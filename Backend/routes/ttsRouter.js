const express = require('express')
const router = express.Router()
const { generateSpeech } = require('../services/feedbackService')
const { getLocalAudio } = require('../services/audioService')

// POST /api/tts/sample
// body: { text?: string, voiceId?: string }
router.post('/sample', async (req, res) => {
  try {
    const { text = 'Namaste. This is a voice sample.', voiceId } = req.body || {}
    const filename = await generateSpeech(text, { voiceId })
    if (!filename) return res.status(500).json({ success: false, msg: 'TTS generation failed' })
    // Return public audio URL
    return res.json({ success: true, url: `/audio/${filename}` })
  } catch (e) {
    console.error('[TTS Sample]', e.message)
    return res.status(500).json({ success: false, msg: e.message })
  }
})

module.exports = router
