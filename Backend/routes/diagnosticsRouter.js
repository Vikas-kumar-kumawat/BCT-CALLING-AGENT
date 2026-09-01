const express = require('express')
const router = express.Router()
const multer = require('multer')
const upload = multer()
const { transcribeAudio } = require('../services/sttService')

// POST /api/diagnostics/stt - form-data file field 'audio' (raw ulaw or wav)
router.post('/stt', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) return res.status(400).json({ success: false, msg: 'audio file required' })
    const txt = await transcribeAudio(req.file.buffer)
    res.json({ success: true, text: txt })
  } catch (e) { res.status(500).json({ success: false, msg: e.message }) }
})

module.exports = router
