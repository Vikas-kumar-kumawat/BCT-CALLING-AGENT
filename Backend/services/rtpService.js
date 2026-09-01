// rtpService.js – Stream G.711 u-law audio as RTP PCMU packets over UDP
function streamAudio(ulawBuffer, remoteIp, remotePort, socket) {
  return new Promise(ok => {
    if (!remoteIp || !remotePort) return ok()

    const FRAME = 160, INTERVAL = 20
    const ssrc  = (Math.random() * 0xFFFFFFFF) >>> 0
    let seq = (Math.random() * 0xFFFF) >>> 0, ts = 0, offset = 0, closed = false

    const header = (seq, ts) => {
      const h = Buffer.allocUnsafe(12)
      h[0] = 0x80; h[1] = 0x00
      h.writeUInt16BE(seq & 0xFFFF, 2)
      h.writeUInt32BE(ts >>> 0, 4)
      h.writeUInt32BE(ssrc, 8)
      return h
    }

    const start = Date.now()
    const send = () => {
      if (closed || offset >= ulawBuffer.length) return ok()
      const payload = ulawBuffer.slice(offset, offset + FRAME)
      offset += FRAME
      try {
        socket.send(Buffer.concat([header(seq++, ts), payload]), 0, payload.length + 12,
          remotePort, remoteIp, err => { if (err) { closed = true; ok() } })
      } catch { closed = true; ok(); return }
      ts += FRAME
      
      const elapsed = Date.now() - start
      const targetTime = (offset / FRAME) * INTERVAL
      const wait = Math.max(0, targetTime - elapsed)
      setTimeout(send, wait)
    }

    send()
  })
}

module.exports = { streamAudio }
