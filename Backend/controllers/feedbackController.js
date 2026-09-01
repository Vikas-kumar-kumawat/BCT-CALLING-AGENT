const { makeSipCall } = require('../services/sip')
const { getLocalAudio } = require('../services/audioService')
const { streamAudio } = require('../services/rtpService')
const { captureRtpStream, transcribeAudio } = require('../services/sttService')
const { classifyFeedback } = require('../services/groqService')
const { log, getLogs: getLogsArray, resetLogs } = require('../services/feedbackService')
const { GREETING } = require('../config/voiceConfig')
const db = require('../config/supabase')

let activeSession = null

// --- Preload Audio Files for Zero-Latency Playback ---
getLocalAudio('starting.mp3').catch(() => { })
getLocalAudio('ending-positive.mp3').catch(() => { })
getLocalAudio('ending-negetive.mp3').catch(() => { })

// --- Internal Helper Methods ---
async function playAudio(session, filename) {
  try {
    const audioBuffer = await getLocalAudio(filename)
    if (audioBuffer && session?.rtpSocket) {
      await streamAudio(audioBuffer, session.rtpIp, session.rtpPort, session.rtpSocket)
    }
  } catch (err) {
    console.warn(`[Audio] Failed to play ${filename}:`, err.message)
  }
}

async function playGreeting(session) {
  log('agent', 'AI', GREETING)
  console.log('[playGreeting] Streaming starting.mp3')
  await playAudio(session, 'starting.mp3')
}

async function captureAndStoreFeedback(session, name, target, maxMs = 8000) {
  let detected = false
  const allResults = []

  log('agent', 'System', 'Listening for feedback...')

  const isMeaningfulSpeech = (text) => {
    if (typeof text !== 'string') return false
    const t = text.trim().toLowerCase()
    if (t.length < 3) return false
    return !['no speech', 'no audio', 'rtp', 'stt error'].some(bad => t.includes(bad)) && !t.startsWith('error:')
  }

  const storeFeedback = async (feedbackText) => {
    try {
      await db.from('customers').upsert([{ name, 'mobile-number': target, feedback: feedbackText }])
    } catch (err) {
      console.warn('[DB] Failed to store feedback:', err.message)
    }
  }

  return new Promise((resolve) => {
    let resolved = false
    const finish = () => {
      if (!resolved) {
        resolved = true
        resolve()
      }
    }

    const timer = setTimeout(() => {
      if (!resolved) {
        if (!detected && allResults.length > 0) {
          const candidate = allResults.filter(r => typeof r === 'string' && !r.startsWith('(')).sort((a, b) => b.length - a.length)[0]
          if (candidate) {
            log('agent', 'System', 'No clear speech detected by threshold — storing best-effort transcript.')
            log('customer', name, candidate)
            storeFeedback(candidate)
          }
        }
        finish()
      }
    }, maxMs)

    captureRtpStream(session.rtpSocket, (chunk, isAlaw) => {
      if (resolved) return
      transcribeAudio(chunk, isAlaw).then(feedback => {
        if (resolved) return
        allResults.push(feedback)
        if (detected || !isMeaningfulSpeech(feedback)) return

        detected = true
        log('customer', name, feedback)
        storeFeedback(feedback)
        clearTimeout(timer)
        finish()
      }).catch(() => { })
    }, maxMs).catch(() => { })
  })
}

async function analyzeAndRespond(session) {
  try {
    const customerTexts = getLogsArray().filter(l => l.sender === 'customer').map(l => l.text)
    const combined = customerTexts.join('. ').slice(0, 4000)

    // Always play a closing greeting to make the conversation smooth and human-like
    if (!combined) {
      log('agent', 'AI', 'No feedback detected, closing call gracefully.')
      await playAudio(session, 'ending-positive.mp3')
      return
    }

    const category = await classifyFeedback(combined)
    if (category === 'positive') {
      log('agent', 'AI', 'Classified as positive feedback — thanking customer.')
      await playAudio(session, 'ending-positive.mp3')
      return
    }

    const escalateMsg = 'OK sir Hamari team aapse jald hi contact karegi Thank you for your feedback'
    log('agent', 'AI', escalateMsg)
    await playAudio(session, 'ending-negetive.mp3')

    // Record for support follow-up
    db.from('support_queue').insert([{ phone: null, notes: combined }]).catch(err => {
      console.warn('[DB] Support queue insert error:', err.message)
    })
  } catch (err) {
    console.warn('[Analysis] Analysis failed:', err.message)
    // Fallback ending on error
    await playAudio(session, 'ending-positive.mp3').catch(() => { })
  }
}

async function cleanupSession() {
  if (!activeSession) return
  try {
    if (activeSession.endCall) await activeSession.endCall()
    if (activeSession.socket) activeSession.socket.close()
    if (activeSession.rtpSocket) activeSession.rtpSocket.close()
  } catch (err) {
    console.warn('[Session] Cleanup error:', err.message)
  }
  activeSession = null
}

// --- API Controllers ---
async function startCall(req, res) {
  const { name = 'Customer', phone } = req.body || {}

  if (!phone) return res.status(400).json({ success: false, msg: 'Phone required' })
  const target = phone.replace(/\D/g, '')
  if (target.length < 10) return res.status(400).json({ success: false, msg: 'Invalid phone' })
  if (activeSession) return res.status(409).json({ success: false, msg: 'Call in progress' })

  resetLogs()

  try {
    activeSession = await makeSipCall(target)
    res.json({ success: true, message: `Connected to ${target}`, logs: getLogsArray() })

    if (activeSession) {
      await playGreeting(activeSession)
      await captureAndStoreFeedback(activeSession, name, target, 8000)
      await analyzeAndRespond(activeSession)
    }

    await cleanupSession()
    log('agent', 'System', 'Call ended successfully.')
  } catch (err) {
    await cleanupSession()
    log('agent', 'System', `Call Error: ${err.message}`)
    if (!res.headersSent) res.status(500).json({ success: false, msg: err.message, logs: getLogsArray() })
  }
}





async function cancelCall(req, res) {
  if (!activeSession) return res.json({ success: true, message: 'No active call', logs: getLogsArray() })
  await cleanupSession()
  log('agent', 'System', 'Call cancelled.')
  res.json({ success: true, logs: getLogsArray() })
}

function getLogs(req, res) {
  res.json({ success: true, logs: getLogsArray() })
}

module.exports = { startCall, cancelCall, getLogs }
