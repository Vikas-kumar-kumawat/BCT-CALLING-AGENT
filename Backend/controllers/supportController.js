const { client, twilio, twilioPhone } = require('../config/twilio')
const { formatPhoneNumber } = require('../utils/formatPhone')
const { getTunnelUrl, startTunnel } = require('../config/tunnel')

let conversationLogs = []
let activeCallSid = null

// Webhook for Incoming Calls to +17853845847
function handleIncomingCall(req, res) {
  const caller = req.body?.From || req.query?.From || 'Incoming Caller'
  const greetingText = 'Welcome to BCT Support. Thank you for calling BCT Support.'

  console.log(`[Incoming Call Received] Phone: +17853845847 | From: ${caller}`)

  conversationLogs = [{
    id: Date.now(),
    sender: 'agent',
    speaker: 'BCT Support Agent',
    text: `${greetingText} (Caller: ${caller})`,
    timestamp: new Date().toLocaleTimeString()
  }]

  const twiml = new twilio.twiml.VoiceResponse()
  
  // 1. Play greeting prompt FIRST to prevent self-voice capture
  twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, greetingText)

  // 2. Open Gather AFTER prompt finishes (bargeIn: false)
  const baseUrl = getTunnelUrl()
  if (baseUrl) {
    twiml.gather({
      input: 'speech dtmf',
      language: 'en-IN',
      bargeIn: false,
      speechTimeout: 'auto',
      timeout: 6,
      action: `${baseUrl}/api/support/gather?bypass-tunnel-reminder=true`,
      method: 'POST'
    })
  }

  res.set('Content-Type', 'text/xml')
  res.send(twiml.toString())
}

async function startCall(req, res) {
  const { name = 'Vikas', phone = '9057262630' } = req.body || {}
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' })
  const formattedPhone = formatPhoneNumber(phone)

  let baseUrl = getTunnelUrl()
  if (!baseUrl || baseUrl.includes('localhost')) {
    baseUrl = await startTunnel(8000)
  }

  const agentGreeting = 'Welcome to BCT Support. Thank you for calling BCT Support.'

  console.log(`[Support Call] Base URL: ${baseUrl} | Target: ${formattedPhone}`)

  conversationLogs = [{
    id: Date.now(),
    sender: 'agent',
    speaker: 'BCT Support Agent',
    text: agentGreeting,
    timestamp: new Date().toLocaleTimeString()
  }]

  const twiml = new twilio.twiml.VoiceResponse()

  // 1. Play greeting prompt FIRST to prevent self-voice capture
  twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, agentGreeting)

  // 2. Open Gather AFTER prompt finishes (bargeIn: false)
  twiml.gather({
    input: 'speech dtmf',
    language: 'en-IN',
    bargeIn: false,
    speechTimeout: 'auto',
    timeout: 6,
    action: `${baseUrl}/api/support/gather?bypass-tunnel-reminder=true`,
    method: 'POST'
  })

  try {
    if (client) {
      const call = await client.calls.create({ twiml: twiml.toString(), to: formattedPhone, from: twilioPhone })
      activeCallSid = call.sid
      return res.json({ success: true, message: `Support call initiated to ${name} (${formattedPhone})`, callSid: call.sid, logs: conversationLogs })
    }
    res.json({ success: true, isSimulated: true, message: `Simulated support call to ${name} (${formattedPhone})`, logs: conversationLogs })
  } catch (err) {
    console.error('[Support Call Error]', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

async function cancelCall(req, res) {
  try {
    if (client && activeCallSid) {
      await client.calls(activeCallSid).update({ status: 'completed' })
    }
    activeCallSid = null
    conversationLogs.push({ id: Date.now(), sender: 'agent', speaker: 'System', text: 'Call ended by agent.', timestamp: new Date().toLocaleTimeString() })
    res.json({ success: true, message: 'Call cancelled successfully', logs: conversationLogs })
  } catch (err) {
    activeCallSid = null
    conversationLogs.push({ id: Date.now(), sender: 'agent', speaker: 'System', text: 'Call session ended.', timestamp: new Date().toLocaleTimeString() })
    res.json({ success: true, message: 'Call session ended', logs: conversationLogs })
  }
}

function handleGather(req, res) {
  try {
    const body = req.body || {}
    const speechText = (body.SpeechResult || body.Digits || '').trim()
    const confidence = body.Confidence || 'N/A'
    const agentClosing = 'Thank you for contacting BCT Support. Have a great day!'

    // Ignore self-captured audio echoes
    if (!speechText || speechText.toLowerCase().includes('welcome to bct support')) {
      console.log(`[Support Ignored Echo]: "${speechText}"`)
      const twiml = new twilio.twiml.VoiceResponse()
      twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, agentClosing)
      res.set('Content-Type', 'text/xml')
      return res.send(twiml.toString())
    }

    console.log(`[Support Speech Captured]: "${speechText}" (Confidence: ${confidence})`)

    conversationLogs.push({ id: Date.now(), sender: 'customer', speaker: 'Customer', text: speechText, confidence, timestamp: new Date().toLocaleTimeString() })
    conversationLogs.push({ id: Date.now() + 1, sender: 'agent', speaker: 'BCT Support Agent', text: agentClosing, timestamp: new Date().toLocaleTimeString() })

    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say({ voice: 'Polly.Aditi', language: 'en-IN' }, agentClosing)

    res.set('Content-Type', 'text/xml')
    res.send(twiml.toString())
  } catch (err) {
    const fallback = new twilio.twiml.VoiceResponse()
    fallback.say({ voice: 'Polly.Aditi', language: 'en-IN' }, 'Thank you for calling BCT Support.')
    res.set('Content-Type', 'text/xml')
    res.send(fallback.toString())
  }
}

function getLogs(req, res) {
  res.json({ success: true, logs: conversationLogs })
}

module.exports = { handleIncomingCall, startCall, cancelCall, handleGather, getLogs }
