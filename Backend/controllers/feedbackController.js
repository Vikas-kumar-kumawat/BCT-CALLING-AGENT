const { makeSipCall } = require('../services/sip')
const { getLocalAudio } = require('../services/audioService')
const { streamAudio } = require('../services/rtpService')
const { captureRtpAudio, transcribeAudio } = require('../services/sttService')
const { generateSpeechAudio: tts } = require('../services/elevenlabsService')
const db = require('../config/supabase')

const GREETING  = 'Hello sir, main BCT fibernet se baat kar rahi hu. Feedback ke regarding call tha ki aapka internet kaisa chal raha hai?'
const THANK_YOU = 'Aapka feedback dene ke liye dhanyawad. Aapka din shubh ho.'
const VOICE     = { voiceId: 'EXAVITQu4vr4xnSDxMaL' }

let logs = [], session = null

const log = (sender, speaker, text) => logs.push({ id: Date.now() + logs.length, sender, speaker, text, time: new Date().toLocaleTimeString() })

const close = async () => {
  if (!session) return
  try {
    if (session.endCall) await session.endCall()
    if (session.socket) session.socket.close()
    if (session.rtpSocket) session.rtpSocket.close()
  } catch {}
  session = null
}

const save = (name, phone, txt) =>
  db.from('customers').update({ feedback: txt }).eq('mobile-number', phone).select()
    .then(({ data }) => !data?.length && db.from('customers').insert([{ name, 'mobile-number': phone, feedback: txt }])).catch(console.error)

;(async () => {
  const [f1, f2] = await Promise.all([tts(GREETING, VOICE), tts(THANK_YOU, VOICE)])
  if (f1) await getLocalAudio(f1); if (f2) await getLocalAudio(f2)
})().catch(console.error)

module.exports = {
  startCall: async (req, res) => {
    const { name = 'Customer', phone } = req.body || {}
    if (!phone) return res.status(400).json({ success: false, msg: 'Phone required' })

    const target = phone.replace(/\D/g, '')
    logs = []
    
    try {
      const call = await makeSipCall(target)
      session = call
      res.json({ success: true, message: `Connected to ${target}`, logs })

      const gFile = await tts(GREETING, VOICE)
      if (gFile) {
        log('agent', 'Voice Agent', GREETING)
        await streamAudio(await getLocalAudio(gFile), call.rtpIp, call.rtpPort, call.rtpSocket)
      }

      const txt = await transcribeAudio(await captureRtpAudio(call.rtpSocket, 2200))
      if (txt) { log('customer', name, txt); save(name, target, txt) }

      const tFile = await tts(THANK_YOU, VOICE)
      if (tFile) {
        log('agent', 'Voice Agent', THANK_YOU)
        await streamAudio(await getLocalAudio(tFile), call.rtpIp, call.rtpPort, call.rtpSocket)
      }

      await close()
      log('agent', 'System', 'Call ended.')

    } catch (e) {
      await close()
      log('agent', 'System', `Error: ${e.message}`)
      if (!res.headersSent) res.status(500).json({ success: false, msg: e.message, logs })
    }
  },
  cancelCall: async (req, res) => { await close(); log('agent', 'System', 'Cancelled.'); res.json({ success: true, logs }) },
  getLogs: (req, res) => res.json({ success: true, logs })
}
