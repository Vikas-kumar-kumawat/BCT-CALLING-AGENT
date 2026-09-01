const { makeSipCall } = require('../services/sip')
const { getLocalAudio } = require('../services/audioService')
const { streamAudio } = require('../services/rtpService')
const { captureRtpStream, transcribeAudio } = require('../services/sttService')
const { analyzeFeedback } = require('../services/groqService')
const { classifyFeedback } = require('../services/geminiService')
const db = require('../config/supabase')
const { log, getLogs: getLogsArray, resetLogs, generateSpeech } = require('../services/feedbackService')
const { GREETING, THANK_YOU, SWARVAM_VOICE_ID, SWARVAM_RATE } = require('../config/voiceConfig')

let session = null

// --- Unified TTS & Audio streaming helper ---
async function speakText(session, text, logAsVoiceAgent = true) {
  if (!session) return;
  try {
    const voiceId = session.selectedVoice || SWARVAM_VOICE_ID;
    console.log(`[speakText] generating TTS for voiceId=${voiceId}`);

    const file = await generateSpeech(text, { voiceId, rate: SWARVAM_RATE });
    let audioBuffer;

    if (!file) {
      console.warn(`[speakText] TTS failed for "${text}"; falling back to local voice1.mpeg`);
      audioBuffer = await getLocalAudio('voice1.mpeg').catch(() => null);
    } else {
      if (logAsVoiceAgent) log('agent', 'Voice Agent', text);
      audioBuffer = await getLocalAudio(file).catch(() => null);
    }

    if (audioBuffer) {
      console.log(`[speakText] Stream audio buffer length: ${audioBuffer.length}`);
      await streamAudio(audioBuffer, session.rtpIp, session.rtpPort, session.rtpSocket);
      console.log('[speakText] streamAudio finished');
    }
  } catch (err) {
    console.warn('[speakText] failed', err.message);
  }
}

// Preload the audio files in the background on startup so they play with 0ms delay
getLocalAudio('starting.mp3').catch(() => { });
getLocalAudio('ending-positive.mp3').catch(() => { });
getLocalAudio('ending-negetive.mp3').catch(() => { });

// --- Call Flow Helpers ---
async function playGreeting(session) {
  try {
    log('agent', 'AI', GREETING);
    const audioBuffer = await getLocalAudio('starting.mp3');
    if (audioBuffer) {
      console.log('[playGreeting] Streaming starting.mp3');
      await streamAudio(audioBuffer, session.rtpIp, session.rtpPort, session.rtpSocket);
    }
  } catch (err) {
    console.warn('[playGreeting] failed to load starting.mp3', err.message);
    // await speakText(session, GREETING); // Swarvam AI disabled for now
  }
}

async function captureAndStoreFeedback(session, name, target, maxMs = 8000) {
  let detected = false;
  const allResults = [];

  log('agent', 'System', 'Listening for feedback...');

  const isMeaningfulSpeech = (text) => {
    if (typeof text !== 'string') return false;
    const t = text.trim().toLowerCase();
    if (t.length < 3) return false;
    return !['no speech', 'no audio', 'rtp', 'stt error'].some(bad => t.includes(bad)) && !t.startsWith('error:');
  };

  const storeFeedback = async (feedbackText) => {
    try {
      await db.from('customers').upsert([{ name, 'mobile-number': target, feedback: feedbackText }]);
    } catch (err) {
      console.warn('[DB] Failed to store feedback', err.message);
    }
  };

  return new Promise((resolve) => {
    let resolved = false;

    const finishEarly = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };

    const timer = setTimeout(() => {
      if (!resolved) {
        if (!detected && allResults.length > 0) {
          const candidate = allResults.filter(r => typeof r === 'string' && !r.startsWith('(')).sort((a, b) => b.length - a.length)[0];
          if (candidate) {
            log('agent', 'System', 'No clear speech detected by threshold — storing best-effort transcript.');
            log('customer', name, candidate);
            storeFeedback(candidate);
          }
        }
        finishEarly();
      }
    }, maxMs);

    // Call without awaiting to allow early resolution
    captureRtpStream(session.rtpSocket, (chunk) => {
      if (resolved) return;
      transcribeAudio(chunk).then(feedback => {
        if (resolved) return;
        allResults.push(feedback);
        if (detected || !isMeaningfulSpeech(feedback)) return;

        detected = true;
        log('customer', name, feedback);
        storeFeedback(feedback);

        // Resolve early! This makes the agent respond to the customer immediately.
        clearTimeout(timer);
        finishEarly();
      }).catch(() => { });
    }, maxMs).catch(() => { });
  });
}





async function analyzeAndRespond(session) {
  try {
    const customerTexts = getLogsArray().filter(l => l.sender === 'customer').map(l => l.text);
    const combined = customerTexts.join('. ').slice(0, 4000);
    if (!combined) return;

    // Classify with Gemini: positive vs other
    const cls = await classifyFeedback(combined);
    if (cls === 'positive') {
      log('agent', 'AI', 'Classified as positive feedback — thanking customer.');
      // await speakText(session, THANK_YOU, false); // Swarvam AI disabled
      try {
        const audioBuffer = await getLocalAudio('ending-positive.mp3');
        if (audioBuffer) await streamAudio(audioBuffer, session.rtpIp, session.rtpPort, session.rtpSocket);
      } catch (e) { console.warn('Missing ending-positive.mp3'); }
      return;
    }

    // For non-positive feedback, use the requested Hindi phrase
    const escalateMsg = 'OK sir  Hamari team aapse jald hi contact karegi  Thank you for your feedback ';

    log('agent', 'AI', escalateMsg);
    // await speakText(session, escalateMsg, false); // Swarvam AI disabled
    try {
      const audioBuffer = await getLocalAudio('ending-negetive.mp3');
      if (audioBuffer) await streamAudio(audioBuffer, session.rtpIp, session.rtpPort, session.rtpSocket);
    } catch (e) { console.warn('Missing ending-negetive.mp3'); }

    // Flag customer for support follow-up (unawaited for speed)
    db.from('support_queue').insert([{ phone: null, notes: combined }]).catch(err => {
      console.warn('[DB] Failed to insert support queue', err.message);
    });
  } catch (err) {
    console.warn('[LLM] analyze failed', err.message);
  }
}

async function speakThankYou(session) {
  await speakText(session, THANK_YOU);
}

async function cleanupSession() {
  try {
    if (session?.endCall) await session.endCall();
    if (session?.socket) session.socket.close();
    if (session?.rtpSocket) session.rtpSocket.close();
  } catch (err) {
    console.warn('[Session] Cleanup error', err.message);
  }
  session = null;
}







// --- API Controllers ---
async function startCall(req, res) {
  const { name = 'Customer', phone, voice } = req.body || {};

  if (!phone) return res.status(400).json({ success: false, msg: 'Phone required' });
  const target = phone.replace(/\D/g, '');
  if (target.length < 10) return res.status(400).json({ success: false, msg: 'Invalid phone' });
  if (session) return res.status(409).json({ success: false, msg: 'Call in progress' });

  resetLogs();

  try {
    session = await makeSipCall(target);
    res.json({ success: true, message: `Connected to ${target}`, logs: getLogsArray() });

    if (session) {
      session.selectedVoice = voice || process.env.SWARVAM_VOICE || undefined;

      // Pre-generate TTS in background to make response instantaneous
      // generateSpeech(THANK_YOU, { voiceId: session.selectedVoice, rate: SWARVAM_RATE }).catch(() => { });
      // generateSpeech('ok sir. Hamari team aapse jald hi contact karegi. feedback dene ke liye dhanywad ', { voiceId: session.selectedVoice, rate: SWARVAM_RATE }).catch(() => { });

      await playGreeting(session);
      await captureAndStoreFeedback(session, name, target, 8000);
      await analyzeAndRespond(session);
    }

    await cleanupSession();
    log('agent', 'System', 'Call ended successfully.');
  } catch (err) {
    await cleanupSession();
    log('agent', 'System', `Call Error: ${err.message}`);
    if (!res.headersSent) res.status(500).json({ success: false, msg: err.message, logs: getLogsArray() });
  }
}

async function cancelCall(req, res) {
  if (!session) return res.json({ success: true, message: 'No active call', logs: getLogsArray() });

  await cleanupSession();
  log('agent', 'System', 'Call cancelled.');
  res.json({ success: true, logs: getLogsArray() });
}

function getLogs(req, res) {
  res.json({ success: true, logs: getLogsArray() });
}

module.exports = { startCall, cancelCall, getLogs }
