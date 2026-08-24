const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

async function generateSpeechAudio(text, options = {}) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const defaultVoiceId = process.env.ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL'
  const voiceId = options.voiceId || defaultVoiceId

  if (!apiKey) {
    console.warn('[ElevenLabs] No API key configured.')
    return null
  }

  const hash = crypto.createHash('md5').update(`${voiceId}_${text}`).digest('hex')
  const audioDir = path.join(__dirname, '../audio')
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true })
  const filename = `eleven_${hash}.mp3`
  const filepath = path.join(audioDir, filename)

  if (fs.existsSync(filepath)) {
    console.log(`[ElevenLabs TTS] Using stored audio: ${filename}`)
    return filename
  }

  try {
    console.log(`[ElevenLabs TTS] Generating: "${text.slice(0, 60)}"`)
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    })

    if (!response.ok) {
      const errBody = await response.text()
      console.error('[ElevenLabs API Error]', response.status, errBody)
      return null
    }

    const arrayBuffer = await response.arrayBuffer()
    fs.writeFileSync(filepath, Buffer.from(arrayBuffer))
    console.log(`[ElevenLabs TTS] Generated: ${filename}`)
    return filename
  } catch (err) {
    console.error('[ElevenLabs Error]', err.message)
    return null
  }
}

module.exports = { generateSpeechAudio }
