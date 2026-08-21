const { formatPhoneNumber } = require('../utils/formatPhone')

let conversationLogs = []

async function startCall(req, res) {
  const { name = 'Vikas', phone = '9057262630' } = req.body || {}
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' })
  const formattedPhone = formatPhoneNumber(phone)

  const agentGreeting = 'Welcome to BCT Support. Thank you for calling BCT Support.'

  console.log(`[Support Call] Target: ${formattedPhone}`)

  conversationLogs = [{
    id: Date.now(),
    sender: 'agent',
    speaker: 'BCT Support Agent',
    text: agentGreeting,
    timestamp: new Date().toLocaleTimeString()
  }]

  res.json({
    success: true,
    isSimulated: true,
    message: `Simulated support call to ${name} (${formattedPhone})`,
    logs: conversationLogs
  })
}

async function cancelCall(req, res) {
  conversationLogs.push({ id: Date.now(), sender: 'agent', speaker: 'System', text: 'Call ended by agent.', timestamp: new Date().toLocaleTimeString() })
  res.json({ success: true, message: 'Call cancelled successfully', logs: conversationLogs })
}

function getLogs(req, res) {
  res.json({ success: true, logs: conversationLogs })
}

module.exports = { startCall, cancelCall, getLogs }
