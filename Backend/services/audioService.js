// audioService.js – Convert audio files → G.711 u-law for RTP streaming
const { spawn }  = require('child_process')
const path       = require('path')
const fs         = require('fs')

const cache = new Map()

function getLocalAudio(filename) {
  if (cache.has(filename)) return Promise.resolve(cache.get(filename))

  const filePath = path.join(__dirname, '../audio', filename)
  if (!fs.existsSync(filePath)) return Promise.reject(new Error(`Audio not found: ${filePath}`))

  return new Promise((ok, fail) => {
    const chunks = []
    const ff = spawn('ffmpeg', ['-i', filePath, '-ar', '8000', '-ac', '1', '-f', 'mulaw', '-'])
    ff.stdout.on('data', c => chunks.push(c))
    ff.stderr.on('data', () => {})
    ff.on('close', code => {
      if (!chunks.length) return fail(new Error(`ffmpeg failed (${code}) for ${filename}`))
      const buf = Buffer.concat(chunks)
      cache.set(filename, buf)
      ok(buf)
    })
    ff.on('error', e => fail(new Error(`ffmpeg: ${e.message}`)))
  })
}

module.exports = { getLocalAudio }
