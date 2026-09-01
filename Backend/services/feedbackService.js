const { getLocalAudio } = require('./audioService')
const { generateSpeechAudio: swarvamTts } = require('./swarvamService')
const { GREETING, THANK_YOU, SWARVAM_VOICE_ID, SWARVAM_RATE } = require('../config/voiceConfig')

let logs = []

const log = (sender, speaker, text) =>
  logs.push({ id: Date.now() + logs.length, sender, speaker, text, time: new Date().toLocaleTimeString() })

const getLogs = () => logs
const resetLogs = () => { logs.length = 0 }

async function initPrecache() {
  try {
    const tasks = [getLocalAudio('voice1.mpeg')]
    // Pre-generate Swarvam TTS (Swarvam is the sole supported TTS provider)
    const swVoice = process.env.SWARVAM_VOICE || SWARVAM_VOICE_ID
    tasks.push(swarvamTts(GREETING, { voiceId: swVoice, voiceSettings: { rate: SWARVAM_RATE } }))
    tasks.push(swarvamTts(THANK_YOU, { voiceId: swVoice, voiceSettings: { rate: SWARVAM_RATE } }))
    await Promise.all(tasks)
  } catch (e) {
    // silent failure; we don't want startup to crash for caching
  }
}

// Wrapper that uses Swarvam TTS
async function generateSpeech(text, opts = {}) {
  try {
    const swVoice = process.env.SWARVAM_VOICE || SWARVAM_VOICE_ID || opts.voiceId
    const rate = opts.rate || SWARVAM_RATE
    return await swarvamTts(text, { voiceId: swVoice, voiceSettings: { rate } })
  } catch (e) {
    console.error('[generateSpeech] Swarvam failed', e.message)
    return null
  }
}

module.exports = { log, getLogs, resetLogs, initPrecache, generateSpeech }
