/**
 * controllers/salesAgent/salesAgentController.js - Outbound Sales Agent Controller
 */
const { makeSipCall } = require('../../services/sipService')
const { getLocalAudio } = require('../../services/audioService')
const { streamAudio } = require('../../services/rtpService')

let conversationLogs = []
const SALES_GREETING = 'Hello! I am calling from BFibernet Sales. We have exciting high-speed fiber plan upgrades available for your location today. Are you interested in upgrading your speed?'





async function startCall(req, res) {


  const { name = 'Prospect Customer', phone } = req.body || {}
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' })

  const formattedPhone = phone.replace(/[^\d]/g, '')
  console.log(`[Sales Agent] Outbound Call Target: ${formattedPhone}`)

  conversationLogs = [{
    id: Date.now(),
    sender: 'agent',
    speaker: 'BFibernet Sales Agent',
    text: SALES_GREETING,
    timestamp: new Date().toLocaleTimeString()
  }]

  try {
    const { rtpIp, rtpPort, socket } = await makeSipCall(formattedPhone)

    res.json({
      success: true,
      message: `Sales call connected to ${name} (${formattedPhone})`,
      logs: conversationLogs
    })

    const audio = await getLocalAudio('audio23.mp3')
    await streamAudio(audio, rtpIp, rtpPort, socket)

  } catch (err) {
    console.error('[Sales Agent Error]', err.message)
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message, logs: conversationLogs })
    }
  }


}






function getLogs(req, res) {
  res.json({ success: true, logs: conversationLogs })
}

module.exports = { startCall, getLogs }
