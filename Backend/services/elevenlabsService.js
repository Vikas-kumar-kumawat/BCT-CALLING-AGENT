// elevenlabsService.js – TTS via ElevenLabs API with on-disk caching
const fs     = require('fs')
const path   = require('path')
const crypto = require('crypto')

const AUDIO_DIR = path.join(__dirname, '../audio')
const VOICE_ID  = 'EXAVITQu4vr4xnSDxMaL' // Bella – reliable fallback

async function generateSpeechAudio(text, { voiceId = VOICE_ID } = {}) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) return null

  const hash     = crypto.createHash('md5').update(`${voiceId}_${text}`).digest('hex')
  const filepath = path.join(AUDIO_DIR, `eleven_${hash}.mp3`)
  if (fs.existsSync(filepath)) return `eleven_${hash}.mp3`

  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true })

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 } })
    })
    if (!res.ok) { console.error('[ElevenLabs]', res.status, await res.text()); return null }
    fs.writeFileSync(filepath, Buffer.from(await res.arrayBuffer()))
    return `eleven_${hash}.mp3`
  } catch (e) { console.error('[ElevenLabs]', e.message); return null }
}

module.exports = { generateSpeechAudio }
