// sttService.js – Speech-to-Text: u-law → WAV via ffmpeg → Google Web Speech via Python
const fs   = require('fs')
const path = require('path')
const { spawn, execSync } = require('child_process')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path

const PY_SCRIPT = path.join(__dirname, 'python_stt.py')

function ulawToWav(ulawBuffer) {
  return new Promise((ok, fail) => {
    const chunks = []
    const ff = spawn(ffmpegPath, ['-f', 'mulaw', '-ar', '8000', '-ac', '1', '-i', 'pipe:0',
      '-f', 'wav', '-ar', '16000', 'pipe:1'])
    ff.stdin.write(ulawBuffer); ff.stdin.end()
    ff.stdout.on('data', c => chunks.push(c))
    ff.stderr.on('data', () => {})
    ff.on('close', code => chunks.length ? ok(Buffer.concat(chunks)) : fail(new Error(`ffmpeg exit ${code}`)))
    ff.on('error', fail)
  })
}

async function transcribeAudio(audioInput) {
  if (!Buffer.isBuffer(audioInput) || !audioInput.length)
    return '(No audio – RTP port blocked or customer silent)'

  const wavBuffer = await ulawToWav(audioInput)
  const tmp = path.join(__dirname, `tmp_${Date.now()}.wav`)
  fs.writeFileSync(tmp, wavBuffer)

  try {
    const out = execSync(`python "${PY_SCRIPT}" "${tmp}"`, { encoding: 'utf-8' }).trim()
    return out.startsWith('ERROR:') ? `(STT Error: ${out})` : out || '(No speech detected)'
  } catch (e) {
    return `(STT Error: ${e.message})`
  } finally {
    try { fs.unlinkSync(tmp) } catch (_) {}
  }
}

function captureRtpAudio(socket, durationMs = 4000) {
  return new Promise(ok => {
    const packets = []
    const onMsg = msg => { if (msg.length > 12) packets.push(msg.slice(12)) }
    socket?.on('message', onMsg)
    setTimeout(() => {
      socket?.removeListener('message', onMsg)
      ok(Buffer.concat(packets))
    }, durationMs)
  })
}

module.exports = { transcribeAudio, captureRtpAudio }
