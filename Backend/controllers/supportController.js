const { startInboundServer, isActive } = require('../services/sipInboundService')
const { getLocalAudio } = require('../services/audioService')
const { streamAudio } = require('../services/rtpService')
const { dispatchIvrOption } = require('./supportAgent')

let conversationLogs = []
let activeCallSession = null
const GREETING = 'Welcome to BCT Support. For complaint press 1, for new connection press 2, for billing details press 3, for other support press 4.'

function addLog(sender, speaker, text) {
  conversationLogs.push({
    id: Date.now(),
    sender,
    speaker,
    text,
    timestamp: new Date().toLocaleTimeString()
  })
}

async function startCall(req, res) {
  try {
    if (!isActive()) {
      await startInboundServer(async (rtpIp, rtpPort, socket) => {
        activeCallSession = { rtpIp, rtpPort, socket }
        addLog('customer', 'Customer', `Call connected from ${rtpIp}:${rtpPort}`)
        try {
          const audio = await getLocalAudio('audio22.mp3')
          await streamAudio(audio, rtpIp, rtpPort, socket)
        } catch (e) {
          console.warn('[Support Audio Error]', e.message)
        }
        addLog('agent', 'BCT Support IVR', GREETING)
      })
    }

    if (conversationLogs.length === 0) {
      addLog('agent', 'BCT Support IVR', GREETING)
    }

    res.json({ success: true, message: 'BCT Support IVR Active', logs: conversationLogs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, logs: conversationLogs })
  }
}

async function selectOption(req, res) {
  const { option } = req.body || {}
  if (!option) return res.status(400).json({ success: false, message: 'Option key required' })

  try {
    addLog('customer', 'Customer (DTMF)', `Pressed Key [ ${option} ]`)
    const result = await dispatchIvrOption(option)
    addLog('agent', 'BCT Support Agent', result.text)

    if (activeCallSession && result.audioFile) {
      const audio = await getLocalAudio(result.audioFile)
      streamAudio(audio, activeCallSession.rtpIp, activeCallSession.rtpPort, activeCallSession.socket).catch(() => {})
    }

    res.json({ success: true, result, logs: conversationLogs })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message, logs: conversationLogs })
  }
}

function getLogs(req, res) {
  res.json({ success: true, logs: conversationLogs })
}

module.exports = { startCall, selectOption, getLogs }
