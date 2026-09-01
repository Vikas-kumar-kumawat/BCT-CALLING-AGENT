/**
 * sip.js - Unified SIP service (outbound calls + inbound server)
 */
const dgram  = require('dgram')
const crypto = require('crypto')
const os     = require('os')

// ─── Shared Helpers ────────────────────────────────────────────────────────────
const md5    = s => crypto.createHash('md5').update(s).digest('hex')
const rand   = (n = 8) => Math.random().toString(36).slice(2, 2 + n)
const branch = () => 'z9hG4bK' + rand(8)

function getLocalIp() {
  for (const ifaces of Object.values(os.networkInterfaces()))
    for (const i of ifaces)
      if (i.family === 'IPv4' && !i.internal) return i.address
  return '127.0.0.1'
}

let _publicIp = null
async function getPublicIp() {
  if (process.env.PUBLIC_IP) return process.env.PUBLIC_IP
  if (_publicIp) return _publicIp
  try {
    const r = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3000) })
    const d = await r.json()
    if (d?.ip) { _publicIp = d.ip; return _publicIp }
  } catch { /* fall through */ }
  return (_publicIp = getLocalIp())
}

const udpSend = (sock, ip, port, msg) => {
  const buf = Buffer.from(msg)
  return new Promise((ok, fail) => sock.send(buf, 0, buf.length, port, ip, e => e ? fail(e) : ok()))
}

const buildSip = (method, uri, headers, body = '') => {
  let msg = `${method} ${uri} SIP/2.0\r\n`
  for (const [k, v] of Object.entries(headers)) msg += `${k}: ${v}\r\n`
  return msg + `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`
}

const parseHeaders = raw => {
  const h = {}
  for (const line of raw.split('\r\n').slice(1)) {
    const c = line.indexOf(':')
    if (c > 0) h[line.slice(0, c).trim().toLowerCase()] = line.slice(c + 1).trim()
  }
  return h
}

const parseResponse = data => {
  const text = data.toString()
  const m = text.match(/SIP\/2\.0 (\d+)/)
  if (!m) return null
  const [head, ...body] = text.split('\r\n\r\n')
  return { status: +m[1], headers: parseHeaders(head), body: body.join('\r\n\r\n') }
}

const parseRequest = data => {
  const text = data.toString()
  const m = text.match(/^([A-Z]+)\s+(sip:[^\s]+)\s+SIP\/2\.0/)
  if (!m) return null
  const [head, ...body] = text.split('\r\n\r\n')
  return { method: m[1], uri: m[2], headers: parseHeaders(head), body: body.join('\r\n\r\n') }
}

const parseSdp = (sdp = '') => {
  let ip = null, port = null
  for (const line of sdp.split(/\r?\n/)) {
    if (line.startsWith('c=IN IP4 ')) ip = line.slice(9).trim()
    if (line.startsWith('m=audio '))  port = +line.split(' ')[1]
  }
  return { ip, port }
}

const parseAuth = (h = '') => {
  const o = {}
  h.replace(/^Digest\s+/, '').replace(/(\w+)="?([^",]+)"?/g, (_, k, v) => { o[k] = v })
  return o
}

const authHeader = (user, pass, realm, nonce, method, uri) => {
  const ha1 = md5(`${user}:${realm}:${pass}`)
  const ha2  = md5(`${method}:${uri}`)
  return `Digest username="${user}",realm="${realm}",nonce="${nonce}",uri="${uri}",response="${md5(`${ha1}:${nonce}:${ha2}`)}"`
}

const buildResponse = (status, reason, req, extra = {}, body = '') => {
  let msg = `SIP/2.0 ${status} ${reason}\r\n`
  if (req.headers['via'])     msg += `Via: ${req.headers['via']}\r\n`
  if (req.headers['from'])    msg += `From: ${req.headers['from']}\r\n`
  msg += `To: ${extra.to || req.headers['to']}\r\n`
  if (req.headers['call-id']) msg += `Call-ID: ${req.headers['call-id']}\r\n`
  if (req.headers['cseq'])    msg += `CSeq: ${req.headers['cseq']}\r\n`
  for (const [k, v] of Object.entries(extra)) if (k !== 'to') msg += `${k}: ${v}\r\n`
  return msg + `Content-Length: ${Buffer.byteLength(body)}\r\n\r\n${body}`
}

// ─── Shared: SIP REGISTER with Digest Auth ────────────────────────────────────
async function doRegister(sock, localIp, localPort, serverIp, serverPort, user, pass, listeners) {
  const cid     = `reg-${rand()}@${localIp}`
  const fromTag = rand()
  const regUri  = `sip:${serverIp}`
  const fromUri = `sip:${user}@${serverIp}`
  const contact = `sip:${user}@${localIp}:${localPort}`

  const h = (seq, extra = {}) => ({
    'Via': `SIP/2.0/UDP ${localIp}:${localPort};rport;branch=${branch()}`,
    'From': `<${fromUri}>;tag=${fromTag}`,
    'To': `<${fromUri}>`,
    'Call-ID': cid,
    'CSeq': `${seq} REGISTER`,
    'Contact': `<${contact}>`,
    'Expires': '3600',
    'Max-Forwards': '70',
    ...extra
  })

  const wait = ms => new Promise((ok, fail) => {
    const t = setTimeout(() => { delete listeners[cid]; fail(new Error('REGISTER timeout')) }, ms)
    listeners[cid] = rs => { if (rs.status >= 200) { clearTimeout(t); delete listeners[cid]; ok(rs) } }
  })

  await udpSend(sock, serverIp, serverPort, buildSip('REGISTER', regUri, h(1)))
  let rs = await wait(10000)

  if (rs.status === 401 || rs.status === 407) {
    const a = parseAuth(rs.headers['www-authenticate'] || rs.headers['proxy-authenticate'])
    await udpSend(sock, serverIp, serverPort, buildSip('REGISTER', regUri, h(2, {
      'Authorization': authHeader(user, pass, a.realm, a.nonce, 'REGISTER', regUri)
    })))
    rs = await wait(10000)
  }

  if (rs.status !== 200) throw new Error(`Registration failed: ${rs.status}`)
  console.log('[SIP] Registered ✓')
}

// ─── Outbound: INVITE + BYE ───────────────────────────────────────────────────
async function makeSipCall(targetPhone) {
  const serverIp   = process.env.SIP_SERVER_IP
  const serverPort = +(process.env.SIP_PORT || 5060)
  const user       = process.env.SIP_USERNAME
  const pass       = process.env.SIP_PASSWORD
  const localIp    = await getPublicIp()
  const listeners  = {}

  const sipSock = dgram.createSocket('udp4')
  const rtpSock = dgram.createSocket('udp4')

  sipSock.on('message', msg => {
    const rs = parseResponse(msg)
    if (!rs) return
    const cid = rs.headers['call-id']
    console.log(`[SIP ←] ${rs.status} (${cid})`)
    if (rs.status < 200) listeners[cid + '_prov']?.(rs)
    else listeners[cid]?.(rs)
  })

  await new Promise((ok, fail) => sipSock.bind(0, e => e ? fail(e) : ok()))
  const localPort = sipSock.address().port
  await new Promise((ok, fail) => rtpSock.bind(0, e => e ? fail(e) : ok()))
  const localRtpPort = rtpSock.address().port

  try {
    await doRegister(sipSock, localIp, localPort, serverIp, serverPort, user, pass, listeners)

    // INVITE
    const invCid  = `call-${rand()}@${localIp}`
    const fromTag = rand()
    const toUri   = `sip:${targetPhone}@${serverIp}`
    const fromUri = `sip:${user}@${serverIp}`

    const sdp = [
      'v=0', `o=- ${Date.now()} ${Date.now()} IN IP4 ${localIp}`, 's=BCT Call',
      `c=IN IP4 ${localIp}`, 't=0 0', `m=audio ${localRtpPort} RTP/AVP 0 8 101`,
      'a=rtpmap:0 PCMU/8000', 'a=rtpmap:8 PCMA/8000',
      'a=rtpmap:101 telephone-event/8000', 'a=fmtp:101 0-15', 'a=sendrecv'
    ].join('\r\n') + '\r\n'

    const invH = (seq, extra = {}) => ({
      'Via': `SIP/2.0/UDP ${localIp}:${localPort};rport;branch=${branch()}`,
      'From': `<${fromUri}>;tag=${fromTag}`,
      'To': `<${toUri}>`,
      'Call-ID': invCid,
      'CSeq': `${seq} INVITE`,
      'Contact': `<sip:${user}@${localIp}:${localPort}>`,
      'Max-Forwards': '70',
      'Content-Type': 'application/sdp',
      ...extra
    })

    listeners[invCid + '_prov'] = rs => {
      if (rs.status === 180) console.log('[SIP] 180 Ringing')
      if (rs.status === 183) console.log('[SIP] 183 Progress')
    }

    const waitInv = ms => new Promise((ok, fail) => {
      const t = setTimeout(() => { delete listeners[invCid]; fail(new Error('INVITE timeout')) }, ms)
      listeners[invCid] = rs => { if (rs.status >= 200) { clearTimeout(t); delete listeners[invCid]; ok(rs) } }
    })

    await udpSend(sipSock, serverIp, serverPort, buildSip('INVITE', toUri, invH(1), sdp))
    let rs = await waitInv(60000)

    if (rs.status === 401 || rs.status === 407) {
      const a = parseAuth(rs.headers['www-authenticate'] || rs.headers['proxy-authenticate'])
      await udpSend(sipSock, serverIp, serverPort, buildSip('INVITE', toUri, invH(2, {
        'Authorization': authHeader(user, pass, a.realm, a.nonce, 'INVITE', toUri)
      }), sdp))
      rs = await waitInv(60000)
    }

    if (rs.status === 480) throw new Error('Callee unavailable (SIP 480)')
    if (rs.status < 200 || rs.status >= 300) throw new Error(`SIP Error: ${rs.status}`)

    const rtpInfo    = parseSdp(rs.body)
    const toWithTag  = rs.headers['to'] || `<${toUri}>`

    await udpSend(sipSock, serverIp, serverPort, buildSip('ACK', toUri, {
      'Via': `SIP/2.0/UDP ${localIp}:${localPort};rport;branch=${branch()}`,
      'From': `<${fromUri}>;tag=${fromTag}`,
      'To': toWithTag,
      'Call-ID': invCid,
      'CSeq': '2 ACK',
      'Max-Forwards': '70'
    }))
    console.log('[SIP] ACK sent ✓')

    // Auto-close safety net at 2 min
    const autoClose = setTimeout(() => {
      try { sipSock.close() } catch (_) {}
      try { rtpSock.close() } catch (_) {}
    }, 120000)

    const endCall = async () => {
      clearTimeout(autoClose)
      try {
        await udpSend(sipSock, serverIp, serverPort, buildSip('BYE', toUri, {
          'Via': `SIP/2.0/UDP ${localIp}:${localPort};rport;branch=${branch()}`,
          'From': `<${fromUri}>;tag=${fromTag}`,
          'To': toWithTag,
          'Call-ID': invCid,
          'CSeq': '3 BYE',
          'Max-Forwards': '70'
        }))
        console.log('[SIP] BYE sent ✓')
      } catch (e) { console.warn('[SIP] BYE failed:', e.message) }
    }

    return {
      rtpIp: rtpInfo.ip || serverIp,
      rtpPort: rtpInfo.port || 10000,
      socket: sipSock,
      rtpSocket: rtpSock,
      endCall
    }
  } catch (err) {
    try { sipSock.close() } catch (_) {}
    try { rtpSock.close() } catch (_) {}
    throw err
  }
}

// ─── Inbound Server ───────────────────────────────────────────────────────────
let _inboundSock   = null
let _inboundActive = false

async function startInboundServer(onCallAnswered) {
  if (_inboundActive) return

  const serverIp   = process.env.SIP_SERVER_IP
  const serverPort = +(process.env.SIP_PORT || 5060)
  const user       = process.env.SIP_USERNAME
  const pass       = process.env.SIP_PASSWORD
  const localIp    = getLocalIp()
  const localPort  = parseInt(process.env.SIP_LOCAL_PORT || '15061')
  const listeners  = {}

  const sock = dgram.createSocket('udp4')

  sock.on('message', async (msg, rinfo) => {
    const rs = parseResponse(msg)
    if (rs) {
      const cid = rs.headers['call-id']
      if (listeners[cid]) listeners[cid](rs)
      return
    }

    const req = parseRequest(msg)
    if (!req) return

    if (req.method === 'INVITE') {
      const rtp      = parseSdp(req.body)
      const toTag    = rand()
      const toFull   = `${req.headers['to']};tag=${toTag}`
      const localSdp = [
        'v=0', `o=- ${Date.now()} ${Date.now()} IN IP4 ${localIp}`, 's=BCT Support',
        `c=IN IP4 ${localIp}`, 't=0 0', 'm=audio 15002 RTP/AVP 0 8 101',
        'a=rtpmap:0 PCMU/8000', 'a=rtpmap:8 PCMA/8000',
        'a=rtpmap:101 telephone-event/8000', 'a=sendrecv'
      ].join('\r\n') + '\r\n'

      await udpSend(sock, rinfo.address, rinfo.port, buildResponse(100, 'Trying', req))
      await udpSend(sock, rinfo.address, rinfo.port, buildResponse(200, 'OK', req, {
        to: toFull,
        'Contact': `<sip:${user}@${localIp}:${localPort}>`,
        'Content-Type': 'application/sdp'
      }, localSdp))

      if (onCallAnswered && rtp.ip && rtp.port) onCallAnswered(rtp.ip, rtp.port, sock)
    }

    if (req.method === 'BYE' || req.method === 'OPTIONS')
      await udpSend(sock, rinfo.address, rinfo.port, buildResponse(200, 'OK', req))
  })

  sock.on('error', e => console.error('[SIP Inbound]', e.message))
  // Try to bind preferred localPort; on EADDRINUSE fallback to ephemeral port
  await new Promise((ok, fail) => {
    sock.bind(localPort, (e) => {
      if (!e) return ok()
      if (e && e.code === 'EADDRINUSE') {
        console.warn(`[SIP Inbound] preferred port ${localPort} in use, falling back to ephemeral port`)
        // try ephemeral port
        return sock.bind(0, (e2) => e2 ? fail(e2) : ok())
      }
      return fail(e)
    })
  })

  await doRegister(sock, localIp, localPort, serverIp, serverPort, user, pass, listeners)

  _inboundSock   = sock
  _inboundActive = true
}

const stopInboundServer = () => {
  _inboundSock?.close()
  _inboundSock   = null
  _inboundActive = false
}

module.exports = { makeSipCall, startInboundServer, stopInboundServer, isInboundActive: () => _inboundActive }
