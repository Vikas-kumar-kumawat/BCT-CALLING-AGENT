const { client, twilio, twilioPhone } = require('../config/twilio')
const { formatPhoneNumber } = require('../utils/formatPhone')
const { getTunnelUrl, startTunnel } = require('../config/tunnel')

let conversationLogs = []
let activeCallSid = null

async function startCall(req, res) {
  const { name = 'Customer', phone } = req.body || {}
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' })
  const formattedPhone = formatPhoneNumber(phone)
  let baseUrl = getTunnelUrl()
  if (!baseUrl || baseUrl.includes('localhost')) {
    baseUrl = await startTunnel(8000)
  }

  const audioUrl = 'https://files.catbox.moe/wjlx8c.mp3'
  const agentGreeting = 'नमस्ते सर, मैं बीफाइबनेट से बात कर रही हूँ, फीडबैक के रिगार्डिंग कॉल था। आपका इंटरनेट कैसा चल रहा है?'

  console.log(`[Twilio Call] Base URL: ${baseUrl} | Audio URL: ${audioUrl}`)

  conversationLogs = [{
    id: Date.now(),
    sender: 'agent',
    speaker: 'Voice Agent',
    text: agentGreeting,
    timestamp: new Date().toLocaleTimeString()
  }]

  const twiml = new twilio.twiml.VoiceResponse()

  // 1. Play greeting audio prompt FIRST to avoid self-voice capture
  twiml.play(audioUrl)

  // 2. Open Gather AFTER prompt finishes (bargeIn: false)
  twiml.gather({
    input: 'speech dtmf',
    language: 'hi-IN',
    bargeIn: false,
    speechTimeout: 'auto',
    timeout: 6,
    action: `${baseUrl}/api/feedbackcalls/gather?bypass-tunnel-reminder=true`,
    method: 'POST'
  })

  twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, 'हमें आपकी आवाज़ नहीं सुनाई दी। धन्यवाद और अलविदा।')

  try {
    if (client) {
      console.log(`[Twilio Call] Dialing ${formattedPhone} with audio: ${audioUrl}`)
      const call = await client.calls.create({ twiml: twiml.toString(), to: formattedPhone, from: twilioPhone })
      activeCallSid = call.sid
      return res.json({
        success: true,
        message: `Call initiated to ${name} (${formattedPhone})`,
        callSid: call.sid,
        audioUrl,
        logs: conversationLogs
      })
    }
    res.json({
      success: true,
      isSimulated: true,
      message: `Simulated call to ${name} (${formattedPhone})`,
      audioUrl,
      logs: conversationLogs
    })
  } catch (err) {
    console.error('[Twilio Call Error]', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

async function cancelCall(req, res) {
  try {
    if (client && activeCallSid) {
      console.log(`[Twilio Call Cancel] Ending call ${activeCallSid}`)
      await client.calls(activeCallSid).update({ status: 'completed' })
    }
    activeCallSid = null
    conversationLogs.push({
      id: Date.now(),
      sender: 'agent',
      speaker: 'System',
      text: 'Call ended / cancelled by agent.',
      timestamp: new Date().toLocaleTimeString()
    })
    res.json({ success: true, message: 'Call cancelled successfully', logs: conversationLogs })
  } catch (err) {
    activeCallSid = null
    conversationLogs.push({
      id: Date.now(),
      sender: 'agent',
      speaker: 'System',
      text: 'Call session ended.',
      timestamp: new Date().toLocaleTimeString()
    })
    res.json({ success: true, message: 'Call session ended', logs: conversationLogs })
  }
}

function handleGather(req, res) {
  try {
    const body = req.body || {}
    const speechText = (body.SpeechResult || body.Digits || '').trim()
    const confidence = body.Confidence || 'N/A'
    const agentClosing = 'आपका फीडबैक शेयर करने के लिए बहुत-बहुत धन्यवाद! आपका दिन शुभ हो।'

    // Ignore self-captured audio echoes or empty triggers
    if (!speechText || speechText.includes('नमस्ते') || speechText.includes('बीफाइबनेट')) {
      console.log(`[Feedback Ignored Echo]: "${speechText}"`)
      const twiml = new twilio.twiml.VoiceResponse()
      twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, agentClosing)
      res.set('Content-Type', 'text/xml')
      return res.send(twiml.toString())
    }

    console.log(`[Feedback Speech Captured]: "${speechText}" (Confidence: ${confidence})`)

    conversationLogs.push({ id: Date.now(), sender: 'customer', speaker: 'Customer (Vikas)', text: speechText, confidence, timestamp: new Date().toLocaleTimeString() })
    conversationLogs.push({ id: Date.now() + 1, sender: 'agent', speaker: 'Voice Agent', text: agentClosing, timestamp: new Date().toLocaleTimeString() })

    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, agentClosing)

    res.set('Content-Type', 'text/xml')
    res.send(twiml.toString())
  } catch (err) {
    console.error('[Feedback Gather Error]', err)
    const fallback = new twilio.twiml.VoiceResponse()
    fallback.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, 'धन्यवाद और अलविदा।')
    res.set('Content-Type', 'text/xml')
    res.send(fallback.toString())
  }
}

function getLogs(req, res) {
  res.json({ success: true, logs: conversationLogs })
}

module.exports = { startCall, cancelCall, handleGather, getLogs }
