const { formatPhoneNumber } = require('../utils/formatPhone')

let conversationLogs = []

async function startCall(req, res) {
  const { name = 'Vikas', phone = '9057262630' } = req.body || {}
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' })
  const formattedPhone = formatPhoneNumber(phone)

  const agentGreeting = `नमस्ते ${name} जी, मैं बीफाइबनेट से बात कर रही हूँ। हमारे पास आपके लिए एक एक्सक्लूसिव ऑफर है, 300 एमबीपीएस स्पीड और 14 फ्री ओटीटी ऐप्स केवल 999 रुपये में। क्या आप जानकारी लेना चाहेंगे?`

  console.log(`[Plan Promotion Call] Target: ${formattedPhone}`)

  conversationLogs = [{
    id: Date.now(),
    sender: 'agent',
    speaker: 'Promotion Voice Agent',
    text: agentGreeting,
    timestamp: new Date().toLocaleTimeString()
  }]

  res.json({
    success: true,
    isSimulated: true,
    message: `Simulated promotion call to ${name} (${formattedPhone})`,
    logs: conversationLogs
  })
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
