const { formatPhoneNumber } = require('../utils/formatPhone')

let conversationLogs = []

async function startCall(req, res) {
  const { name = 'Vikas', phone = '9057262630' } = req.body || {}
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' })
  const formattedPhone = formatPhoneNumber(phone)

  const agentGreeting = `नमस्ते ${name} जी, मैं बीफाइबनेट से बात कर रही हूँ। आपका सौ एमबीपीएस अनलिमिटेड ब्रॉडबैंड प्लान कल समाप्त हो रहा है। क्या आप आज ही रिचार्ज कराना चाहते हैं?`

  console.log(`[Recharge Reminder Call] Target: ${formattedPhone}`)

  conversationLogs = [{
    id: Date.now(),
    sender: 'agent',
    speaker: 'Recharge Voice Agent',
    text: agentGreeting,
    timestamp: new Date().toLocaleTimeString()
  }]

  res.json({
    success: true,
    isSimulated: true,
    message: `Simulated recharge call to ${name} (${formattedPhone})`,
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
