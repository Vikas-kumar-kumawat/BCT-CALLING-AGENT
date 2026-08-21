/**
 * sipInboundService.js - Listens for incoming SIP calls from Asterisk/FreePBX
 * Answers calls and streams a greeting audio over RTP.
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

// Parse a SIP RESPONSE (SIP/2.0 STATUS ...)
function parseResponse(data) {
  const text = data.toString();
  if (!text.startsWith('SIP/2.0')) return null;
  const m = text.match(/SIP\/2\.0 (\d+)/);
  if (!m) return null;
  const [head, ...bodyParts] = text.split('\r\n\r\n');
  const headers = {};
  for (const line of head.split('\r\n').slice(1)) {
    const c = line.indexOf(':');
    if (c > 0) headers[line.slice(0, c).trim().toLowerCase()] = line.slice(c + 1).trim();
  }
  return { status: parseInt(m[1]), headers, body: bodyParts.join('\r\n\r\n') };
}

// Parse a SIP REQUEST (INVITE / ACK / BYE / OPTIONS ...)
function parseRequest(data) {
  const text = data.toString();
  const m = text.match(/^([A-Z]+)\s+(sip:[^\s]+)\s+SIP\/2\.0/);
  if (!m) return null;
  const [head, ...bodyParts] = text.split('\r\n\r\n');
  const headers = {};
  for (const line of head.split('\r\n').slice(1)) {
    const c = line.indexOf(':');
    if (c > 0) headers[line.slice(0, c).trim().toLowerCase()] = line.slice(c + 1).trim();
  }
  return { method: m[1], uri: m[2], headers, body: bodyParts.join('\r\n\r\n') };
}

// Extract RTP address and port from SDP body
function parseSdp(sdp = '') {
  let ip = null, port = null;
  for (const line of sdp.split(/\r?\n/)) {
    if (line.startsWith('c=IN IP4 ')) ip = line.slice(9).trim();
    if (line.startsWith('m=audio '))  port = parseInt(line.split(' ')[1]);
  }
  return { ip, port };
}

// Parse Digest challenge header
function parseAuth(h = '') {
  const obj = {};
  h.replace(/^Digest\s+/, '').replace(/(\w+)="?([^",]+)"?/g, (_, k, v) => { obj[k] = v; });
  return obj;
}

// Build Authorization header
function authHeader(user, pass, realm, nonce, method, uri) {
  const ha1 = md5(`${user}:${realm}:${pass}`);
  const ha2 = md5(`${method}:${uri}`);
  return `Digest username="${user}",realm="${realm}",nonce="${nonce}",uri="${uri}",response="${md5(`${ha1}:${nonce}:${ha2}`)}"`;
}

// Build raw SIP message string
function buildSip(method, reqUri, headers, body = '') {
  let msg = `${method} ${reqUri} SIP/2.0\r\n`;
  for (const [k, v] of Object.entries(headers)) msg += `${k}: ${v}\r\n`;
  msg += `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
  return msg;
}

// Build a SIP response string (status reply to a request)
function buildResponse(status, reason, req, extraHeaders = {}, body = '') {
  let msg = `SIP/2.0 ${status} ${reason}\r\n`;
  if (req.headers['via'])     msg += `Via: ${req.headers['via']}\r\n`;
  if (req.headers['from'])    msg += `From: ${req.headers['from']}\r\n`;
  if (extraHeaders['to'])     msg += `To: ${extraHeaders['to']}\r\n`;
  else if (req.headers['to']) msg += `To: ${req.headers['to']}\r\n`;
  if (req.headers['call-id']) msg += `Call-ID: ${req.headers['call-id']}\r\n`;
  if (req.headers['cseq'])    msg += `CSeq: ${req.headers['cseq']}\r\n`;
  for (const [k, v] of Object.entries(extraHeaders)) {
    if (k !== 'to') msg += `${k}: ${v}\r\n`;
  }
  msg += `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`;
  return msg;
}

function udpSend(socket, ip, port, msgStr) {
  const buf = Buffer.from(msgStr);
  return new Promise((res, rej) => socket.send(buf, 0, buf.length, port, ip, e => e ? rej(e) : res()));
}

// ─── Registration ─────────────────────────────────────────────────────────────

function doRegister(socket, localIp, localPort, serverIp, serverPort, sipUser, sipPass) {
  return new Promise((resolve, reject) => {
    const regCallId = `reg-${rand()}@${localIp}`;
    const fromTag   = rand();
    const regUri    = `sip:${serverIp}`;
    const fromUri   = `sip:${sipUser}@${serverIp}`;
    const contact   = `sip:${sipUser}@${localIp}:${localPort}`;

    const listeners = {};

    socket.on('message', (msg) => {
      const rs = parseResponse(msg);
      if (!rs) return;
      const cid = rs.headers['call-id'];
      if (listeners[cid]) listeners[cid](rs);
    });

    function waitReg(callId, ms = 10000) {
      return new Promise((res, rej) => {
        const t = setTimeout(() => { delete listeners[callId]; rej(new Error('REGISTER timeout')); }, ms);
        listeners[callId] = (rs) => { if (rs.status >= 200) { clearTimeout(t); delete listeners[callId]; res(rs); } };
      });
    }

    const h = (cseq, extra = {}) => ({
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

    (async () => {
      try {
        console.log(`[SIP Inbound] REGISTER ${sipUser}@${serverIp}...`);
        const w1 = waitReg(regCallId);
        await udpSend(socket, serverIp, serverPort, buildSip('REGISTER', regUri, h(1)));
        let rs = await w1;
        console.log(`[SIP Inbound] REGISTER → ${rs.status}`);

        if (rs.status === 401 || rs.status === 407) {
          const auth = parseAuth(rs.headers['www-authenticate'] || rs.headers['proxy-authenticate']);
          const w2 = waitReg(regCallId);
          await udpSend(socket, serverIp, serverPort, buildSip('REGISTER', regUri, h(2, {
            'Authorization': authHeader(sipUser, sipPass, auth.realm, auth.nonce, 'REGISTER', regUri)
          })));
          rs = await w2;
          console.log(`[SIP Inbound] REGISTER (auth) → ${rs.status}`);
        }

        if (rs.status !== 200) return reject(new Error(`Registration failed: ${rs.status}`));
        console.log('[SIP Inbound] Registered ✓ — waiting for inbound calls...');
        resolve();
      } catch (e) { reject(e); }
    })();
  });
}

// ─── Inbound Call Server ──────────────────────────────────────────────────────

let inboundSocket = null;
let inboundActive = false;

async function startInboundServer(onCallAnswered) {
  if (inboundActive) {
    console.log('[SIP Inbound] Already running');
    return;
  }

  const serverIp   = process.env.SIP_SERVER_IP;
  const serverPort = parseInt(process.env.SIP_PORT || '5060');
  const sipUser    = process.env.SIP_USERNAME;
  const sipPass    = process.env.SIP_PASSWORD;
  const localIp    = getLocalIp();
  const localPort  = 15061; // fixed port so Asterisk knows where to find us

  const socket = dgram.createSocket('udp4');

  // Handle ALL incoming messages
  socket.on('message', async (msg, rinfo) => {
    const text = msg.toString();

    // Handle incoming SIP REQUESTS (INVITE, BYE, OPTIONS, ACK)
    const req = parseRequest(msg);
    if (!req) return;

    if (req.method === 'INVITE') {
      console.log(`[SIP Inbound] ← INVITE from ${rinfo.address}:${rinfo.port}`);

      // Parse caller's SDP to know where to stream audio
      const rtp = parseSdp(req.body);
      const toTag = rand();
      const toWithTag = `${req.headers['to']};tag=${toTag}`;

      // Our SDP (we declare a local RTP port, but we'll send TO the caller's RTP port)
      const localSdp = [
        'v=0',
        `o=- ${Date.now()} ${Date.now()} IN IP4 ${localIp}`,
        's=BCT Support',
        `c=IN IP4 ${localIp}`,
        't=0 0',
        'm=audio 15002 RTP/AVP 0 8 101',
        'a=rtpmap:0 PCMU/8000',
        'a=rtpmap:8 PCMA/8000',
        'a=rtpmap:101 telephone-event/8000',
        'a=sendrecv',
      ].join('\r\n') + '\r\n';

      // 1. Send 100 Trying
      await udpSend(socket, rinfo.address, rinfo.port,
        buildResponse(100, 'Trying', req));

      // 2. Send 200 OK with our SDP
      await udpSend(socket, rinfo.address, rinfo.port,
        buildResponse(200, 'OK', req,
          {
            'to'         : toWithTag,
            'Contact'    : `<sip:${sipUser}@${localIp}:${localPort}>`,
            'Content-Type': 'application/sdp'
          },
          localSdp
        ));

      console.log(`[SIP Inbound] 200 OK sent — caller RTP: ${rtp.ip}:${rtp.port}`);

      // 3. Callback to stream greeting audio to caller's RTP
      if (onCallAnswered && rtp.ip && rtp.port) {
        onCallAnswered(rtp.ip, rtp.port, socket);
      }
    }

    if (req.method === 'ACK') {
      console.log('[SIP Inbound] ← ACK received — call fully established');
    }

    if (req.method === 'BYE') {
      console.log('[SIP Inbound] ← BYE received — call ended');
      await udpSend(socket, rinfo.address, rinfo.port,
        buildResponse(200, 'OK', req));
    }

    if (req.method === 'OPTIONS') {
      await udpSend(socket, rinfo.address, rinfo.port,
        buildResponse(200, 'OK', req));
    }
  });

  socket.on('error', (err) => console.error('[SIP Inbound] Socket error:', err.message));

  await new Promise((res, rej) => socket.bind(localPort, (err) => err ? rej(err) : res()));
  console.log(`[SIP Inbound] Listening on ${localIp}:${localPort}`);

  // Register with Asterisk so it can route inbound calls to us
  await doRegister(socket, localIp, localPort, serverIp, serverPort, sipUser, sipPass);

  inboundSocket = socket;
  inboundActive = true;
}

function stopInboundServer() {
  if (inboundSocket) {
    inboundSocket.close();
    inboundSocket = null;
    inboundActive = false;
    console.log('[SIP Inbound] Server stopped');
  }
}

module.exports = { startInboundServer, stopInboundServer, isActive: () => inboundActive };
