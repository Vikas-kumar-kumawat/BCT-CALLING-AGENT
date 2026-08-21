const { client, twilio, twilioPhone } = require('../config/twilio')
const { formatPhoneNumber } = require('../utils/formatPhone')
const { getTunnelUrl, startTunnel } = require('../config/tunnel')

let conversationLogs = []
let activeCallSid = null

async function startCall(req, res) {
  const { name = 'Vikas', phone = '9057262630' } = req.body || {}
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' })
  const formattedPhone = formatPhoneNumber(phone)
  let baseUrl = getTunnelUrl()
  if (!baseUrl || baseUrl.includes('localhost')) {
    baseUrl = await startTunnel(8000)
  }

  const agentGreeting = `नमस्ते ${name} जी, मैं बीफाइबनेट से बात कर रही हूँ। आपका सौ एमबीपीएस अनलिमिटेड ब्रॉडबैंड प्लान कल समाप्त हो रहा है। क्या आप आज ही रिचार्ज कराना चाहते हैं?`

  console.log(`[Recharge Reminder Call] Base URL: ${baseUrl} | Target: ${formattedPhone}`)

  conversationLogs = [{
    id: Date.now(),
    sender: 'agent',
    speaker: 'Recharge Voice Agent',
    text: agentGreeting,
    timestamp: new Date().toLocaleTimeString()
  }]

  const twiml = new twilio.twiml.VoiceResponse()

  // 1. Play greeting TTS prompt FIRST to prevent self-voice capture
  twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, agentGreeting)

  // 2. Open Gather AFTER prompt finishes (bargeIn: false)
  twiml.gather({
    input: 'speech dtmf',
    language: 'hi-IN',
    bargeIn: false,
    speechTimeout: 'auto',
    timeout: 6,
    action: `${baseUrl}/api/rechargereminder/gather?bypass-tunnel-reminder=true`,
    method: 'POST'
  })

  twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, 'हमें आपकी आवाज़ नहीं सुनाई दी। धन्यवाद और अलविदा।')

  try {
    if (client) {
      console.log(`[Twilio Recharge Call] Dialing ${formattedPhone}`)
      const call = await client.calls.create({ twiml: twiml.toString(), to: formattedPhone, from: twilioPhone })
      activeCallSid = call.sid
      return res.json({
        success: true,
        message: `Recharge reminder call initiated to ${name} (${formattedPhone})`,
        callSid: call.sid,
        logs: conversationLogs
      })
    }
    res.json({
      success: true,
      isSimulated: true,
      message: `Simulated recharge call to ${name} (${formattedPhone})`,
      logs: conversationLogs
    })
  } catch (err) {
    console.error('[Twilio Recharge Call Error]', err)
    res.status(500).json({ success: false, message: err.message })
  }
}

async function cancelCall(req, res) {
  try {
    if (client && activeCallSid) {
      console.log(`[Twilio Recharge Cancel] Ending call ${activeCallSid}`)
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

    let agentClosing = 'आपका बहुत-बहुत धन्यवाद! रिचार्ज का पेमेंट लिंक आपके व्हाट्सएप पर भेज दिया गया है। आपका दिन शुभ हो।'

    const lowerSpeech = speechText.toLowerCase()
    if (lowerSpeech.includes('नहीं') || lowerSpeech.includes('बाद में') || lowerSpeech.includes('no')) {
      agentClosing = 'कोई बात नहीं सर! रिमाइंडर के लिए धन्यवाद। जब भी आप चाहें बीफाइबनेट ऐप से रिचार्ज कर सकते हैं।'
    } else if (lowerSpeech.includes('हाँ') || lowerSpeech.includes('हां') || lowerSpeech.includes('करना है') || lowerSpeech.includes('yes')) {
      agentClosing = 'जी धन्यवाद! भुगतान लिंक आपके मोबाइल नंबर पर भेज दिया गया है। ऑनलाइन पेमेंट करते ही आपका इंटरनेट जारी रहेगा।'
    }

    // Ignore self-captured audio echoes
    if (!speechText || speechText.includes('बीफाइबनेट') || speechText.includes('समाप्त हो रहा')) {
      console.log(`[Recharge Ignored Echo]: "${speechText}"`)
      const twiml = new twilio.twiml.VoiceResponse()
      twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, agentClosing)
      res.set('Content-Type', 'text/xml')
      return res.send(twiml.toString())
    }

    console.log(`[Recharge Speech Captured]: "${speechText}" (Confidence: ${confidence})`)

    conversationLogs.push({
      id: Date.now(),
      sender: 'customer',
      speaker: 'Customer (Vikas)',
      text: speechText,
      confidence,
      timestamp: new Date().toLocaleTimeString()
    })

    conversationLogs.push({
      id: Date.now() + 1,
      sender: 'agent',
      speaker: 'Recharge Voice Agent',
      text: agentClosing,
      timestamp: new Date().toLocaleTimeString()
    })

    const twiml = new twilio.twiml.VoiceResponse()
    twiml.say({ language: 'hi-IN', voice: 'Polly.Aditi' }, agentClosing)

    res.set('Content-Type', 'text/xml')
    res.send(twiml.toString())
  } catch (err) {
    console.error('[Recharge Gather Error]', err)
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
