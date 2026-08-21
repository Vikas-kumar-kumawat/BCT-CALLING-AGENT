const { makeSipCall } = require('../services/sipService')
const { getLocalAudio } = require('../services/audioService')
const { streamAudio } = require('../services/rtpService')

let conversationLogs = []








async function startCall(req, res) {

  const { name = 'Customer', phone } = req.body || {}
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' })

  const formattedPhone = phone.replace(/[^\d]/g, '')
  console.log(`[Feedback Call] Target: ${formattedPhone}`)

  conversationLogs = [{
    id: Date.now(),
    sender: 'agent',
    speaker: 'Voice Agent',
    text: 'Welcome to BFibernet! Calling customer with feedback greeting.',
    timestamp: new Date().toLocaleTimeString()
  }]

  try {
    // Wait for call to be answered (200 OK)
    const { rtpIp, rtpPort, socket } = await makeSipCall(formattedPhone)

    // Respond to HTTP immediately after call is connected
    res.json({
      success: true,
      message: `Call connected to ${name} (${formattedPhone}) — playing greeting`,
      logs: conversationLogs
    })

    // Convert audio23.mp3 → u-law and stream over RTP
    const ulaw = await getLocalAudio('audio23.mp3')
    await streamAudio(ulaw, rtpIp, rtpPort, socket)

  } catch (err) {
    console.error('[Call Error]', err.message)
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message, logs: conversationLogs })
    }
  }


}












async function cancelCall(req, res) {
  conversationLogs.push({
    id: Date.now(),
    sender: 'agent',
    speaker: 'System',
    text: 'Call ended by agent.',
    timestamp: new Date().toLocaleTimeString()
  })
  res.json({ success: true, message: 'Call cancelled', logs: conversationLogs })
}

function getLogs(req, res) {
  res.json({ success: true, logs: conversationLogs })
}

module.exports = { startCall, cancelCall, getLogs }
