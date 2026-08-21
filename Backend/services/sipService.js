/**
 * sipService.js - Raw UDP SIP client with rport NAT traversal
 * Uses built-in dgram + crypto only. No external sip library.
 */
const dgram = require('dgram');
const crypto = require('crypto');
const os = require('os');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function md5(s) { return crypto.createHash('md5').update(s).digest('hex'); }
function rand(n = 8) { return Math.random().toString(36).slice(2, 2 + n); }
function branch() { return 'z9hG4bK' + rand(8); }

function getLocalIp() {
  for (const ifaces of Object.values(os.networkInterfaces())) {
    for (const i of ifaces) {
      if (i.family === 'IPv4' && !i.internal) return i.address;
    }
  }
  return '127.0.0.1';
}

// Build a raw SIP message string
function buildSip(method, reqUri, headers, body = '') {
  let msg = `${method} ${reqUri} SIP/2.0\r\n`;
  for (const [k, v] of Object.entries(headers)) msg += `${k}: ${v}\r\n`;
  msg += `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
  return msg;
}

// Parse the status line + headers of a SIP response
function parseResponse(data) {
  const text = data.toString();
  const m = text.match(/SIP\/2\.0 (\d+)/);
  if (!m) return null;
  const headers = {};
  for (const line of text.split('\r\n').slice(1)) {
    const c = line.indexOf(':');
    if (c > 0) headers[line.slice(0, c).trim().toLowerCase()] = line.slice(c + 1).trim();
    if (!line) break;
  }
  return { status: parseInt(m[1]), headers };
}

// Parse Digest auth challenge header into object
function parseAuth(h = '') {
  const obj = {};
  h.replace(/^Digest\s+/, '').replace(/(\w+)="?([^",]+)"?/g, (_, k, v) => { obj[k] = v; });
  return obj;
}

// Calculate MD5 Digest response
function digestResp(user, pass, realm, nonce, method, uri) {
  const ha1 = md5(`${user}:${realm}:${pass}`);
  const ha2 = md5(`${method}:${uri}`);
  return md5(`${ha1}:${nonce}:${ha2}`);
}

// Build Authorization header value
function authHeader(user, pass, realm, nonce, method, uri) {
  const resp = digestResp(user, pass, realm, nonce, method, uri);
  return `Digest username="${user}",realm="${realm}",nonce="${nonce}",uri="${uri}",response="${resp}"`;
}

// ─── Socket Layer ─────────────────────────────────────────────────────────────

// Send a SIP message and wait for a final response (>=200) matching the callId
function sendAndWait(socket, serverIp, serverPort, msgStr, callId, listeners, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const buf = Buffer.from(msgStr);
    const timer = setTimeout(() => {
      delete listeners[callId];
      reject(new Error(`SIP timeout (no response in ${timeoutMs / 1000}s)`));
    }, timeoutMs);

    listeners[callId] = (rs) => {
      if (rs.status < 200) return; // ignore provisional 100/180/183
      clearTimeout(timer);
      delete listeners[callId];
      resolve(rs);
    };

    socket.send(buf, 0, buf.length, serverPort, serverIp, (err) => {
      if (err) { clearTimeout(timer); delete listeners[callId]; reject(err); }
    });
  });
}

// ─── SIP Steps ───────────────────────────────────────────────────────────────

async function doRegister(socket, localIp, localPort, serverIp, serverPort, sipUser, sipPass, listeners) {
  const regCallId  = `reg-${rand()}@${localIp}`;
  const fromTag    = rand();
  const regUri     = `sip:${serverIp}`;
  const fromUri    = `sip:${sipUser}@${serverIp}`;
  const contactUri = `sip:${sipUser}@${localIp}:${localPort}`;

  const baseHeaders = (cseq, extra = {}) => ({
    'Via'          : `SIP/2.0/UDP ${localIp}:${localPort};rport;branch=${branch()}`,
    'From'         : `<${fromUri}>;tag=${fromTag}`,
    'To'           : `<${fromUri}>`,
    'Call-ID'      : regCallId,
    'CSeq'         : `${cseq} REGISTER`,
    'Contact'      : `<${contactUri}>`,
    'Expires'      : '3600',
    'Max-Forwards' : '70',
    ...extra
  });

  console.log(`[SIP] REGISTER ${sipUser}@${serverIp}...`);
  let rs = await sendAndWait(socket, serverIp, serverPort,
    buildSip('REGISTER', regUri, baseHeaders(1)), regCallId, listeners);
  console.log(`[SIP] REGISTER → ${rs.status}`);

  if (rs.status === 401 || rs.status === 407) {
    const auth = parseAuth(rs.headers['www-authenticate'] || rs.headers['proxy-authenticate']);
    rs = await sendAndWait(socket, serverIp, serverPort,
      buildSip('REGISTER', regUri, baseHeaders(2, {
        'Authorization': authHeader(sipUser, sipPass, auth.realm, auth.nonce, 'REGISTER', regUri)
      })), regCallId, listeners);
    console.log(`[SIP] REGISTER (auth) → ${rs.status}`);
  }

  if (rs.status !== 200) throw new Error(`Registration failed: ${rs.status}`);
  console.log('[SIP] Registered ✓');
}

async function doInvite(socket, localIp, localPort, serverIp, serverPort, sipUser, sipPass, targetPhone, listeners) {
  const invCallId  = `call-${rand()}@${localIp}`;
  const fromTag    = rand();
  const toUri      = `sip:${targetPhone}@${serverIp}`;
  const fromUri    = `sip:${sipUser}@${serverIp}`;
  const contactUri = `sip:${sipUser}@${localIp}:${localPort}`;

  const sdp = [
    'v=0',
    `o=- ${Date.now()} ${Date.now()} IN IP4 ${localIp}`,
    's=BCT Call',
    `c=IN IP4 ${localIp}`,
    't=0 0',
    'm=audio 15000 RTP/AVP 0 8 101',
    'a=rtpmap:0 PCMU/8000',
    'a=rtpmap:8 PCMA/8000',
    'a=rtpmap:101 telephone-event/8000',
    'a=fmtp:101 0-15',
    'a=sendrecv',
  ].join('\r\n') + '\r\n';

  const baseHeaders = (cseq, extra = {}) => ({
    'Via'          : `SIP/2.0/UDP ${localIp}:${localPort};rport;branch=${branch()}`,
    'From'         : `<${fromUri}>;tag=${fromTag}`,
    'To'           : `<${toUri}>`,
    'Call-ID'      : invCallId,
    'CSeq'         : `${cseq} INVITE`,
    'Contact'      : `<${contactUri}>`,
    'Max-Forwards' : '70',
    'Content-Type' : 'application/sdp',
    ...extra
  });

  console.log(`[SIP] INVITE → ${targetPhone}@${serverIp}`);
  let rs = await sendAndWait(socket, serverIp, serverPort,
    buildSip('INVITE', toUri, baseHeaders(1), sdp), invCallId, listeners, 30000);
  console.log(`[SIP] INVITE → ${rs.status}`);

  if (rs.status === 401 || rs.status === 407) {
    const auth = parseAuth(rs.headers['www-authenticate'] || rs.headers['proxy-authenticate']);
    rs = await sendAndWait(socket, serverIp, serverPort,
      buildSip('INVITE', toUri, baseHeaders(2, {
        'Authorization': authHeader(sipUser, sipPass, auth.realm, auth.nonce, 'INVITE', toUri)
      }), sdp), invCallId, listeners, 30000);
    console.log(`[SIP] INVITE (auth) → ${rs.status}`);
  }

  if (rs.status >= 200 && rs.status < 300) {
    console.log('[SIP] Call accepted ✓');
    return rs;
  }
  throw new Error(`SIP Error: ${rs.status}`);
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function makeSipCall(targetPhone) {
  const serverIp   = process.env.SIP_SERVER_IP;
  const serverPort = parseInt(process.env.SIP_PORT || '5060');
  const sipUser    = process.env.SIP_USERNAME;
  const sipPass    = process.env.SIP_PASSWORD;
  const localIp    = getLocalIp();
  const localPort  = 15060;

  // Shared listener map: callId → callback
  const listeners = {};

  const socket = dgram.createSocket('udp4');
  socket.on('message', (msg) => {
    const rs = parseResponse(msg);
    if (!rs) return;
    const cid = rs.headers['call-id'];
    console.log(`[SIP IN ] ${rs.status} (call-id: ${cid})`);
    if (listeners[cid]) listeners[cid](rs);
  });

  await new Promise((res, rej) => socket.bind(localPort, (err) => err ? rej(err) : res()));
  console.log(`[SIP] Socket bound to ${localIp}:${localPort}`);

  try {
    await doRegister(socket, localIp, localPort, serverIp, serverPort, sipUser, sipPass, listeners);
    const result = await doInvite(socket, localIp, localPort, serverIp, serverPort, sipUser, sipPass, targetPhone, listeners);
    // Keep socket open for 2 minutes to sustain the call
    setTimeout(() => socket.close(), 120000);
    return result;
  } catch (err) {
    socket.close();
    throw err;
  }
}

module.exports = { makeSipCall };
