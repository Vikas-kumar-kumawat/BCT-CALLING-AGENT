const { makeSipCall } = require('../services/sip')
const { streamAudio } = require('../services/rtpService')
const { captureRtpStream, transcribeAudio } = require('../services/sttService')
const { generateAgentResponse } = require('../services/llmService')
const { generateTtsUlawBuffer } = require('../services/ttsService')
const { getLocalAudio } = require('../services/audioService')
const { log, getLogs: getLogsArray, resetLogs } = require('../services/feedbackService')
const { storeFeedback, initDB } = require('../services/dbService')

// Run DB startup check once (non-blocking)
initDB().catch(err => console.warn('[DB] initDB error:', err.message))

let activeSession = null

// Helper to check if transcribed text is valid human speech
function isMeaningfulSpeech(text) {
  if (typeof text !== 'string') return false
  const t = text.trim().toLowerCase()
  if (t.length < 2) return false
  return !['no speech', 'no audio', 'rtp', 'stt error'].some(bad => t.includes(bad)) && !t.startsWith('(') && !t.startsWith('error:')
}



// Helper to listen for a single chunk of customer speech
function captureCustomerSpeech(session, maxMs = 7000) {
  return new Promise((resolve) => {
    let resolved = false
    const finish = (result = null) => {
      if (!resolved) {
        resolved = true
        resolve(result)
      }
    }

    const timer = setTimeout(() => finish(null), maxMs)

    captureRtpStream(session.rtpSocket, (chunk, isAlaw) => {
      if (resolved) return
      transcribeAudio(chunk, isAlaw).then(feedback => {
        if (resolved) return
        if (isMeaningfulSpeech(feedback)) {
          clearTimeout(timer)
          finish({ text: feedback })
        }
      }).catch(() => { })
    }, maxMs).catch(() => { finish(null) })
  })
}

// Dynamic Multi-Turn LLM Conversational Voice Agent Loop
async function runVoiceAgentConversation(session, customerName, targetPhone) {
  log('agent', 'System', 'Initializing dynamic AI Voice Agent...')

  const conversationHistory = []
  const callStartTime = Date.now()
  const MAX_CALL_DURATION_MS = 120000 // 2 minutes strict max call time

  // 1. Initial High-Quality Pre-recorded Greeting
  const greetingText = 'Hello sir, main BCT Fibernet se baat kar raha hoon. Feedback ke regarding call tha, aapka internet kaisa chal raha hai?'
  conversationHistory.push({ role: 'assistant', content: greetingText })

  log('agent', 'AI', greetingText)

  // Strictly use the pre-recorded MP3 to avoid generating new TTS voices
  const greetingAudio = await getLocalAudio('greeting_feedback.mp3').catch(err => {
    log('agent', 'System', 'Warning: greeting_feedback.mp3 not found, skipping audio.')
    return null
  })
  if (greetingAudio && session?.rtpSocket) {
    await streamAudio(greetingAudio, session.rtpIp, session.rtpPort, session.rtpSocket)
  }

  // 2. Open multi-turn conversation loop (keeps listening until user is satisfied or 2 minutes limit)
  let silentTurns = 0
  let hasPromptedListenCheck = false

  for (let turn = 0; turn < 100; turn++) {
    if (!activeSession) break

    const callDurationMs = Date.now() - callStartTime
    if (callDurationMs >= MAX_CALL_DURATION_MS) {
      log('agent', 'System', '2-minute call limit reached. Closing call automatically.')
      const closeText = 'Aapka 2 minute ka samay pura ho gaya hai. BCT Telecom se baat karne ke liye dhanyawad!'
      log('agent', 'AI', closeText)
      const closeAudio = await generateTtsUlawBuffer(closeText)
      if (closeAudio && session?.rtpSocket) {
        await streamAudio(closeAudio, session.rtpIp, session.rtpPort, session.rtpSocket)
      }
      break
    }

    log('agent', 'System', `Listening for customer response (Turn ${turn + 1}, Duration: ${Math.round(callDurationMs / 1000)}s)...`)
    const speechResult = await captureCustomerSpeech(session, 10000)

    if (!activeSession) break

    if (!speechResult || !isMeaningfulSpeech(speechResult.text)) {
      silentTurns++
      log('agent', 'System', `No speech detected (Silent count: ${silentTurns}).`)

      if (silentTurns >= 3) {
        log('agent', 'System', 'Customer inactive. Closing call gracefully.')
        const closeText = 'Aapka response nahi mila. Call end ki ja rahi hai. Dhanyawad!'
        log('agent', 'AI', closeText)
        const closeAudio = await generateTtsUlawBuffer(closeText)
        if (closeAudio && session?.rtpSocket) {
          await streamAudio(closeAudio, session.rtpIp, session.rtpPort, session.rtpSocket)
        }
        break
      }

      if (!hasPromptedListenCheck) {
        hasPromptedListenCheck = true
        const promptText = 'Kya aap mujhe sun pa rahe hain sir?'
        log('agent', 'AI', promptText)
        conversationHistory.push({ role: 'assistant', content: promptText })
        const promptAudio = await generateTtsUlawBuffer(promptText)
        if (promptAudio && session?.rtpSocket) {
          await streamAudio(promptAudio, session.rtpIp, session.rtpPort, session.rtpSocket)
        }
      }
      continue
    }

    // Customer spoke! Reset silence counter
    silentTurns = 0
    log('customer', customerName, speechResult.text)
    conversationHistory.push({ role: 'user', content: speechResult.text })

    // Generate dynamic LLM response
    log('agent', 'System', 'AI is thinking...')
    const currentDurationMs = Date.now() - callStartTime
    const { text: agentText, shouldEndCall } = await generateAgentResponse(conversationHistory, currentDurationMs, speechResult.text)
    conversationHistory.push({ role: 'assistant', content: agentText })

    log('agent', 'AI', agentText)

    // Synthesize response to voice audio & stream to call
    const safeAgentText = agentText.replace(/\[CALL_END\]/g, '').trim()
    const agentAudio = await generateTtsUlawBuffer(safeAgentText)

    if (agentAudio && session?.rtpSocket) {
      await streamAudio(agentAudio, session.rtpIp, session.rtpPort, session.rtpSocket)
    }

    // Disconnect when shouldEndCall is true (user satisfied / problem solved / explicit call cut / 2 mins limit)
    if (shouldEndCall) {
      log('agent', 'System', 'Call completed (satisfied or time limit reached). Ending session.')
      break
    }
  }

  // Final Closing check if conversation hasn't closed yet
  log('agent', 'System', 'Conversation complete. Ending call.')

  // Store the entire conversation as a single entry
  if (conversationHistory.length > 0) {
    const fullConversation = conversationHistory
      .map(m => `[${m.role === 'user' ? 'Customer' : 'Agent'}] ${m.content}`)
      .join('\n')
    storeFeedback(customerName, targetPhone, fullConversation)
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

  let hardCutTimer = null

  try {
    activeSession = await makeSipCall(target)
    res.json({ success: true, message: `Connected to ${target}`, logs: getLogsArray() })

    // HARD 2-MINUTE (120,000 ms) SAFETY TIMER - Guarantees call cut at 2 min at any cost
    hardCutTimer = setTimeout(async () => {
      if (activeSession) {
        console.log('[HARD CUT] 2-minute maximum duration reached! Force terminating SIP call session.')
        log('agent', 'System', 'HARD CUT: 2-minute maximum call duration reached. Terminating call immediately.')
        await cleanupSession()
      }
    }, 120000)

    if (activeSession) {
      await runVoiceAgentConversation(activeSession, name, target)
    }

    if (hardCutTimer) clearTimeout(hardCutTimer)
    await cleanupSession()
    log('agent', 'System', 'Call ended successfully.')
  } catch (err) {
    if (hardCutTimer) clearTimeout(hardCutTimer)
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
