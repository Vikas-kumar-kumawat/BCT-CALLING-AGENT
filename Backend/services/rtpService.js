/**
 * rtpService.js - Streams G.711 u-law audio as RTP PCMU packets (payload type 0)
 * Input: raw u-law buffer from ElevenLabs (already encoded — no conversion needed)
 */

// Build a 12-byte RTP header
function rtpHeader(seq, timestamp, ssrc) {
  const h = Buffer.allocUnsafe(12);
  h[0] = 0x80;                         // Version=2, P=0, X=0, CC=0
  h[1] = 0x00;                         // Marker=0, PT=0 (PCMU / G.711 u-law)
  h.writeUInt16BE(seq & 0xFFFF, 2);
  h.writeUInt32BE(timestamp >>> 0, 4);
  h.writeUInt32BE(ssrc >>> 0, 8);
  return h;
}

/**
 * Stream pre-encoded G.711 u-law buffer as RTP over UDP.
 * @param {Buffer} ulawBuffer  - Raw G.711 u-law bytes from ElevenLabs
 * @param {string} remoteIp    - Remote RTP IP (from SDP in 200 OK)
 * @param {number} remotePort  - Remote RTP port (from SDP in 200 OK)
 * @param {import('dgram').Socket} socket - Shared UDP socket from sipService
 * @returns {Promise} Resolves when audio finishes
 */
function streamAudio(ulawBuffer, remoteIp, remotePort, socket) {
  return new Promise((resolve, reject) => {
    if (!remoteIp || !remotePort) {
      console.warn('[RTP] No remote RTP address — skipping audio');
      return resolve();
    }

    const FRAME    = 160;
    const INTERVAL = 20;
    const ssrc     = (Math.random() * 0xFFFFFFFF) >>> 0;
    let seq        = (Math.random() * 0xFFFF) >>> 0;
    let ts         = 0;
    let offset     = 0;
    let closed     = false;
    const total    = Math.ceil(ulawBuffer.length / FRAME);

    console.log(`[RTP] Streaming to ${remoteIp}:${remotePort} — ${total} packets (~${(ulawBuffer.length / 8000).toFixed(1)}s)`);

    function sendFrame() {
      if (closed || offset >= ulawBuffer.length) {
        console.log('[RTP] Audio complete ✓');
        return resolve();
      }

      const payload = ulawBuffer.slice(offset, offset + FRAME);
      offset += FRAME;

      const pkt = Buffer.concat([rtpHeader(seq++, ts, ssrc), payload]);
      ts += FRAME;

      try {
        socket.send(pkt, 0, pkt.length, remotePort, remoteIp, (err) => {
          if (err) {
            closed = true;
            return resolve(); // socket closed, end gracefully
          }
        });
      } catch (e) {
        closed = true;
        return resolve();
      }

      setTimeout(sendFrame, INTERVAL);
    }

    sendFrame();
  });
}

module.exports = { streamAudio };
