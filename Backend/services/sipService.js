/**
 * sipService.js - Raw UDP SIP client with rport NAT traversal
 * Returns { rtpIp, rtpPort, socket } when call is answered (200 OK)
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

function buildSip(method, reqUri, headers, body = '') {
  let msg = `${method} ${reqUri} SIP/2.0\r\n`;
  for (const [k, v] of Object.entries(headers)) msg += `${k}: ${v}\r\n`;
  msg += `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
  return msg;
}

// Parse status, headers, and body from SIP response
function parseResponse(data) {
  const text = data.toString();
  const m = text.match(/SIP\/2\.0 (\d+)/);
  if (!m) return null;
  const [headerSection, ...bodyParts] = text.split('\r\n\r\n');
  const headers = {};
  for (const line of headerSection.split('\r\n').slice(1)) {
    const c = line.indexOf(':');
    if (c > 0) headers[line.slice(0, c).trim().toLowerCase()] = line.slice(c + 1).trim();
  }
  return { status: parseInt(m[1]), headers, body: bodyParts.join('\r\n\r\n') };
}

// Extract remote RTP IP and port from SDP body
function parseSdp(sdp = '') {
  let ip = null, port = null;
  for (const line of sdp.split(/\r?\n/)) {
    if (line.startsWith('c=IN IP4 ')) ip = line.slice(9).trim();
    if (line.startsWith('m=audio '))  port = parseInt(line.split(' ')[1]);
  }
  return { ip, port };
}

// Parse Digest auth challenge header
function parseAuth(h = '') {
  const obj = {};
  h.replace(/^Digest\s+/, '').replace(/(\w+)="?([^",]+)"?/g, (_, k, v) => { obj[k] = v; });
  return obj;
}

// Build Authorization header value
function authHeader(user, pass, realm, nonce, method, uri) {
  const ha1 = md5(`${user}:${realm}:${pass}`);
  const ha2 = md5(`${method}:${uri}`);
  const resp = md5(`${ha1}:${nonce}:${ha2}`);
  return `Digest username="${user}",realm="${realm}",nonce="${nonce}",uri="${uri}",response="${resp}"`;
}

// ─── Socket Layer ─────────────────────────────────────────────────────────────

function udpSend(socket, serverIp, serverPort, msgStr) {
  const buf = Buffer.from(msgStr);
  return new Promise((res, rej) => socket.send(buf, 0, buf.length, serverPort, serverIp, e => e ? rej(e) : res()));
}

function waitForResponse(listeners, callId, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      delete listeners[callId];
      reject(new Error(`SIP timeout (${timeoutMs / 1000}s)`));
    }, timeoutMs);

    listeners[callId] = (rs) => {
      if (rs.status < 200) return; // ignore 100/180 provisionals
      clearTimeout(timer);
      delete listeners[callId];
      resolve(rs);
    };
  });
}

// ─── SIP Steps ───────────────────────────────────────────────────────────────

async function doRegister(socket, localIp, localPort, serverIp, serverPort, sipUser, sipPass, listeners) {
  const regCallId = `reg-${rand()}@${localIp}`;
  const fromTag   = rand();
  const regUri    = `sip:${serverIp}`;
  const fromUri   = `sip:${sipUser}@${serverIp}`;
  const contact   = `sip:${sipUser}@${localIp}:${localPort}`;

  const headers = (cseq, extra = {}) => ({
    'Via'          : `SIP/2.0/UDP ${localIp}:${localPort};rport;branch=${branch()}`,
    'From'         : `<${fromUri}>;tag=${fromTag}`,
    'To'           : `<${fromUri}>`,
    'Call-ID'      : regCallId,
    'CSeq'         : `${cseq} REGISTER`,
    'Contact'      : `<${contact}>`,
    'Expires'      : '3600',
    'Max-Forwards' : '70',
    ...extra
  });

  console.log(`[SIP] REGISTER ${sipUser}@${serverIp}...`);
  const waiter1 = waitForResponse(listeners, regCallId);
  await udpSend(socket, serverIp, serverPort, buildSip('REGISTER', regUri, headers(1)));
  let rs = await waiter1;
  console.log(`[SIP] REGISTER → ${rs.status}`);

  if (rs.status === 401 || rs.status === 407) {
    const auth = parseAuth(rs.headers['www-authenticate'] || rs.headers['proxy-authenticate']);
    const waiter2 = waitForResponse(listeners, regCallId);
    await udpSend(socket, serverIp, serverPort, buildSip('REGISTER', regUri, headers(2, {
      'Authorization': authHeader(sipUser, sipPass, auth.realm, auth.nonce, 'REGISTER', regUri)
    })));
    rs = await waiter2;
    console.log(`[SIP] REGISTER (auth) → ${rs.status}`);
  }

  if (rs.status !== 200) throw new Error(`Registration failed: ${rs.status}`);
  console.log('[SIP] Registered ✓');
}

async function doInvite(socket, localIp, localPort, serverIp, serverPort, sipUser, sipPass, targetPhone, listeners) {
  const invCallId = `call-${rand()}@${localIp}`;
  const fromTag   = rand();
  const toUri     = `sip:${targetPhone}@${serverIp}`;
  const fromUri   = `sip:${sipUser}@${serverIp}`;
  const contact   = `sip:${sipUser}@${localIp}:${localPort}`;

  const sdpBody = [
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

  const headers = (cseq, extra = {}) => ({
    'Via'          : `SIP/2.0/UDP ${localIp}:${localPort};rport;branch=${branch()}`,
    'From'         : `<${fromUri}>;tag=${fromTag}`,
    'To'           : `<${toUri}>`,
    'Call-ID'      : invCallId,
    'CSeq'         : `${cseq} INVITE`,
    'Contact'      : `<${contact}>`,
    'Max-Forwards' : '70',
    'Content-Type' : 'application/sdp',
    ...extra
  });

  console.log(`[SIP] INVITE → ${targetPhone}@${serverIp}`);

  // Register a provisional listener separately so we can log 180 Ringing
  listeners[invCallId + '_prov'] = (rs) => {
    if (rs.status === 180) console.log('[SIP] 180 Ringing — phone is ringing...');
    if (rs.status === 183) console.log('[SIP] 183 Session Progress');
  };

  const waiter1 = waitForResponse(listeners, invCallId, 60000); // 60s for call answer
  await udpSend(socket, serverIp, serverPort, buildSip('INVITE', toUri, headers(1), sdpBody));
  let rs = await waiter1;
  console.log(`[SIP] INVITE → ${rs.status}`);

  if (rs.status === 401 || rs.status === 407) {
    const auth = parseAuth(rs.headers['www-authenticate'] || rs.headers['proxy-authenticate']);
    const waiter2 = waitForResponse(listeners, invCallId, 60000);
    await udpSend(socket, serverIp, serverPort, buildSip('INVITE', toUri, headers(2, {
      'Authorization': authHeader(sipUser, sipPass, auth.realm, auth.nonce, 'INVITE', toUri)
    }), sdpBody));
    rs = await waiter2;
    console.log(`[SIP] INVITE (auth) → ${rs.status}`);
  }

  if (rs.status < 200 || rs.status >= 300) throw new Error(`SIP Error: ${rs.status}`);

  // Parse remote RTP info from SDP in 200 OK body
  const rtpInfo = parseSdp(rs.body);
  console.log(`[SIP] Call answered ✓ — remote RTP: ${rtpInfo.ip}:${rtpInfo.port}`);

  // Send ACK (mandatory after 200 OK)
  const toWithTag = rs.headers['to'] || `<${toUri}>`;
  await udpSend(socket, serverIp, serverPort, buildSip('ACK', toUri, {
    'Via'          : `SIP/2.0/UDP ${localIp}:${localPort};rport;branch=${branch()}`,
    'From'         : `<${fromUri}>;tag=${fromTag}`,
    'To'           : toWithTag,
    'Call-ID'      : invCallId,
    'CSeq'         : '2 ACK',
    'Max-Forwards' : '70'
  }));
  console.log('[SIP] ACK sent ✓');

  return { rtpIp: rtpInfo.ip || serverIp, rtpPort: rtpInfo.port || 10000 };
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function makeSipCall(targetPhone) {
  const serverIp   = process.env.SIP_SERVER_IP;
  const serverPort = parseInt(process.env.SIP_PORT || '5060');
  const sipUser    = process.env.SIP_USERNAME;
  const sipPass    = process.env.SIP_PASSWORD;
  const localIp    = getLocalIp();

  const listeners = {};

  const socket = dgram.createSocket('udp4');
  socket.on('message', (msg) => {
    const rs = parseResponse(msg);
    if (!rs) return;
    const cid = rs.headers['call-id'];
    if (rs.status) {
      console.log(`[SIP IN ] ${rs.status} (${cid})`);
      const provCb = listeners[cid + '_prov'];
      if (provCb && rs.status < 200) provCb(rs);
      if (listeners[cid]) listeners[cid](rs);
    }
  });

  // Bind to port 0 → OS assigns a free ephemeral port (no EADDRINUSE)
  await new Promise((res, rej) => socket.bind(0, (err) => err ? rej(err) : res()));
  const localPort = socket.address().port;
  console.log(`[SIP] Socket bound → ${localIp}:${localPort}`);

  try {
    await doRegister(socket, localIp, localPort, serverIp, serverPort, sipUser, sipPass, listeners);
    const rtpInfo = await doInvite(socket, localIp, localPort, serverIp, serverPort, sipUser, sipPass, targetPhone, listeners);

    // Keep socket open for call duration (2 min)
    setTimeout(() => { try { socket.close(); } catch (_) {} }, 120000);

    return { ...rtpInfo, socket };
  } catch (err) {
    try { socket.close(); } catch (_) {}
    throw err;
  }
}

module.exports = { makeSipCall };
