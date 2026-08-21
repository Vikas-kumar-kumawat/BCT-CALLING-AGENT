const { formatPhoneNumber } = require('../utils/formatPhone')
const { makeSipCall } = require('../services/sipService')

let conversationLogs = []










async function startCall(req, res) {





  const { name = 'Customer', phone } = req.body || {}
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' })
  // Use raw phone string for SIP since PBXs often reject '+' prefixes
  const formattedPhone = phone.replace(/[^\d]/g, '')
  const audioUrl = 'https://files.catbox.moe/wjlx8c.mp3'
  const agentGreeting = 'नमस्ते सर, मैं बीफाइबनेट से बात कर रही हूँ, फीडबैक के रिगार्डिंग कॉल था। आपका इंटरनेट कैसा चल रहा है?'


  console.log(`[Feedback Call] Target: ${formattedPhone}`)



  conversationLogs = [{
    id: Date.now(),
    sender: 'agent',
    speaker: 'Voice Agent',
    text: agentGreeting,
    timestamp: new Date().toLocaleTimeString()
  }]



  try {
    await makeSipCall(formattedPhone)
    res.json({
      success: true,
      isSimulated: false,
      message: `SIP call initiated to ${name} (${formattedPhone})`,
      audioUrl,
      logs: conversationLogs
    })
  } catch (err) {
    console.error('[SIP Call Error]', err)
    res.status(500).json({ success: false, message: err.message, logs: conversationLogs })
  }






}






















async function cancelCall(req, res) {
  conversationLogs.push({
    id: Date.now(),
    sender: 'agent',
    speaker: 'System',
    text: 'Call ended / cancelled by agent.',
    timestamp: new Date().toLocaleTimeString()
  })
  res.json({ success: true, message: 'Call cancelled successfully', logs: conversationLogs })
}

function getLogs(req, res) {
  res.json({ success: true, logs: conversationLogs })
}

module.exports = { startCall, cancelCall, getLogs }
