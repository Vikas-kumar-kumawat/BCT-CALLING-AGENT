const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { spawn } = require('child_process')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const { generateSpeechAudio: generateSarvamAudio } = require('./swarvamService')

const AUDIO_DIR = path.join(__dirname, '../audio')
const fetch = (...args) => (globalThis.fetch ? globalThis.fetch(...args) : import('node-fetch').then(({ default: f }) => f(...args)))

// Convert any audio file (MP3/WAV) on disk to G.711 u-law buffer for RTP streaming
function audioFileToUlawBuffer(filePath) {
  return new Promise((resolve, reject) => {
    const chunks = []
    const ff = spawn(ffmpegPath, ['-i', filePath, '-ar', '8000', '-ac', '1', '-f', 'mulaw', '-'])
    ff.stdout.on('data', c => chunks.push(c))
    ff.stderr.on('data', () => { })
    ff.on('close', code => {
      if (!chunks.length) return reject(new Error(`ffmpeg failed exit code ${code}`))
      resolve(Buffer.concat(chunks))
    })
    ff.on('error', reject)
  })
}

// Fallback Free Google Translate TTS (Hindi / English)
async function googleTranslateTts(text, lang = 'hi') {
  if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true })
  
  const hash = crypto.createHash('md5').update(`gtts_${lang}_${text}`).digest('hex')
  const filename = `gtts_${hash}.mp3`
  const filepath = path.join(AUDIO_DIR, filename)

  if (fs.existsSync(filepath)) return filepath

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text.slice(0, 200))}&tl=${lang}&client=tw-ob`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  })

  if (!res.ok) throw new Error(`Google TTS HTTP ${res.status}`)
  const buffer = Buffer.from(await res.arrayBuffer())
  await fs.promises.writeFile(filepath, buffer)
  return filepath
}

// Main Dynamic TTS Function: Generates speech for text and returns u-law audio buffer
async function generateTtsUlawBuffer(text) {
  if (!text || !text.trim()) return null
  const cleanText = text.replace(/[\*\#\_`\[\]]/g, '').trim()

  // 1. Try Sarvam AI TTS (if configured)
  try {
    const sarvamFilename = await generateSarvamAudio(cleanText, { voiceId: 'shubh' })
    if (sarvamFilename) {
      const fullPath = path.join(AUDIO_DIR, sarvamFilename)
      return await audioFileToUlawBuffer(fullPath)
    }
  } catch (err) {
    console.warn('[TTS] Sarvam AI failed, using Google TTS fallback:', err.message)
  }

  // 2. Fallback to Google Translate TTS
  try {
    // Detect if text is mostly English or Hindi
    const isHindi = /[\u0900-\u097F]/.test(cleanText) || cleanText.toLowerCase().includes('namaste') || cleanText.toLowerCase().includes('aap')
    const lang = isHindi ? 'hi' : 'en'
    const filePath = await googleTranslateTts(cleanText, lang)
    return await audioFileToUlawBuffer(filePath)
  } catch (err) {
    console.error('[TTS] Google TTS failed:', err.message)
    return null
  }
}

module.exports = { generateTtsUlawBuffer }
