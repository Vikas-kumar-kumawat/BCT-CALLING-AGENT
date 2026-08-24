const { makeSipCall } = require('../services/sipService')
const { getLocalAudio } = require('../services/audioService')
const { streamAudio } = require('../services/rtpService')

const { captureRtpAudio, transcribeAudio } = require('../services/sttService')
const { generateSpeechAudio } = require('../services/elevenlabsService')
const supabase = require('../config/supabase')

let conversationLogs = []





async function startCall(req, res) {

  const { name = 'Customer', phone } = req.body || {}
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required' })

  const formattedPhone = phone.replace(/[^\d]/g, '')
  console.log(`[Feedback Call] Target: ${formattedPhone}`)


  let activeSocket = null


  try {
    const { rtpIp, rtpPort, socket, rtpSocket, endCall } = await makeSipCall(formattedPhone)
    activeSocket = socket

    res.json({
      success: true,
      message: `Call connected to ${name} (${formattedPhone}) — playing greeting`,
      logs: conversationLogs
    })

    // 1. Play agent greeting
    const greetingText = "Hello sir, main BCT fibernet se baat kar rahi hu. Feedback ke regarding call tha ki aapka internet kaisa chal raha hai?"

    // Force Bella voice ID to ensure API success if user's custom voice ID is out of quota
    const greetingFilename = await generateSpeechAudio(greetingText, { voiceId: 'EXAVITQu4vr4xnSDxMaL' })
    if (greetingFilename) {
      conversationLogs.push({
        id: Date.now(),
        sender: 'agent',
        speaker: 'Voice Agent',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString()
      })
      const greetingUlaw = await getLocalAudio(greetingFilename)
      await streamAudio(greetingUlaw, rtpIp, rtpPort, rtpSocket) // MUST use rtpSocket for symmetric NAT!
    } else {
      console.warn('[Call] Skipping greeting audio — ElevenLabs unavailable.')
    }



    // 2. Listen to customer (2.2 seconds capture)
    console.log(`[Feedback Call] Listening to customer for 2.2 seconds...`)
    const customerAudioBuffer = await captureRtpAudio(rtpSocket, 2200)

    // 3. Transcribe customer feedback
    const customerText = await transcribeAudio(customerAudioBuffer)
    if (customerText) {
      conversationLogs.push({
        id: Date.now(),
        sender: 'customer',
        speaker: name,
        text: customerText,
        timestamp: new Date().toLocaleTimeString()
      })

      // Non-blocking async DB save in background
      (async () => {
        try {
          const { data: updated } = await supabase
            .from('customers')
            .update({ feedback: customerText })
            .eq('mobile-number', formattedPhone)
            .select()

          if (!updated || updated.length === 0) {
            await supabase
              .from('customers')
              .insert([{ name, 'mobile-number': formattedPhone, feedback: customerText }])
          }
          console.log(`[DB Success] Stored feedback: "${customerText}"`)
        } catch (dbErr) {
          console.error('[DB Error]', dbErr.message)
        }
      })()
    } else {
      console.warn('[Call] Customer audio not transcribed — skipping customer log.')
    }

    // 4. Play Thank-You message (appears on screen AFTER customer feedback)
    const thankYouText = "Aapka feedback dene ke liye dhanyawad. Aapka din shubh ho."
    const thankYouFilename = await generateSpeechAudio(thankYouText, { voiceId: 'EXAVITQu4vr4xnSDxMaL' })
    if (thankYouFilename) {
      conversationLogs.push({
        id: Date.now() + 1,
        sender: 'agent',
        speaker: 'Voice Agent',
        text: thankYouText,
        timestamp: new Date().toLocaleTimeString()
      })
      const thankYouUlaw = await getLocalAudio(thankYouFilename)
      await streamAudio(thankYouUlaw, rtpIp, rtpPort, rtpSocket)
      await new Promise(resolve => setTimeout(resolve, 300))
    } else {
      console.warn('[Call] Skipping thank-you audio — ElevenLabs unavailable.')
    }

    // 5. End call
    console.log(`[Feedback Call] Thank-you audio complete, cutting call instantly.`)
    if (endCall) await endCall()
    try { socket.close() } catch (e) { }
    try { rtpSocket.close() } catch (e) { }



  } catch (err) {
    console.error('[Call Error]', err.message)
    if (activeSocket) {
      try { activeSocket.close() } catch (e) { }
    }
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

// Pre-warm audio cache on server startup for instant zero-latency playback when call connects
async function prewarmAudio() {
  try {
    const greetingText = "Hello sir, main BCT fibernet se baat kar rahi hu. Feedback ke regarding call tha ki aapka internet kaisa chal raha hai?"
    const thankYouText = "Aapka feedback dene ke liye dhanyawad. Aapka din shubh ho."

    const voiceId = 'EXAVITQu4vr4xnSDxMaL'
    const f1 = await generateSpeechAudio(greetingText, { voiceId })
    if (f1) await getLocalAudio(f1)

    const f2 = await generateSpeechAudio(thankYouText, { voiceId })
    if (f2) await getLocalAudio(f2)

    console.log('[Audio Pre-warm] Greeting & Thank You audios are stored and ready in memory!')
  } catch (e) {
    console.warn('[Audio Pre-warm Error]', e.message)
  }
}
prewarmAudio()

module.exports = { startCall, cancelCall, getLogs }
