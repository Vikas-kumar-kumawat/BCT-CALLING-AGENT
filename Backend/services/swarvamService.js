const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const AUDIO_DIR = path.join(__dirname, '../audio')
const DEFAULT_SWARVAM_API_URL = 'https://api.sarvam.ai/text-to-speech'
const SWARVAM_API_URL = process.env.SWARVAM_API_URL || DEFAULT_SWARVAM_API_URL
const SWARVAM_API_KEY = process.env.SWARVAM_API_KEY || ''

const fetch = (...args) => (globalThis.fetch ? globalThis.fetch(...args) : import('node-fetch').then(({ default: f }) => f(...args)))

async function generateSpeechAudio(text, { voiceId = 'shubh', voiceSettings = {} } = {}) {
  if (!SWARVAM_API_KEY) {
    console.error('[Swarvam] missing API key')
    return null
  }
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true })

  const hash = crypto.createHash('md5').update(`${voiceId}_${text}`).digest('hex')
  const filename = `swarvam_${hash}.mp3`
  const filepath = path.join(AUDIO_DIR, filename)
  if (fs.existsSync(filepath)) return filename

  const payload = {
    text: text,
    language_code: "hi-IN", // Defaulting to Hindi for Indian voices
    speaker: voiceId === 'rajasthani_male' || voiceId === 'marwadi_male' || voiceId === 'default' ? 'shubh' : (voiceId || 'shubh'),
    model: "bulbul:v3",
    speech_sample_rate: 24000,
    enable_preprocessing: true,
    properties: {
      pace: parseFloat(voiceSettings.rate) || 1.25,
      temperature: 0.35
    }
  }

  try {
    // Try request; on network failure retry once
    let res
    try {
      res = await fetch(SWARVAM_API_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': SWARVAM_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    } catch (e) {
      console.warn('[Swarvam] initial request failed:', e && e.message)
      // retry once
      res = await fetch(SWARVAM_API_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': SWARVAM_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[Swarvam] non-OK response', res.status, body)
      return null
    }

    const json = await res.json()
    if (!json.audios || !json.audios.length) {
      console.error('[Swarvam] No audios returned', json)
      return null
    }

    const buf = Buffer.from(json.audios[0], 'base64')
    fs.writeFileSync(filepath, buf)
    return filename
  } catch (e) {
    console.error('[Swarvam] request failed after retry', e && (e.stack || e.message))
    return null
  }
}

module.exports = { generateSpeechAudio }
