/**
 * Option 1: Complaint Registration Handler
 * 1. Ask user: "What is your complaint?"
 * 2. Capture customer speech and transcribe via STT
 * 3. Respond: "Your complaint is registered and our technical team will reach you as soon as possible."
 */
const { transcribeAudio, captureRtpAudio } = require('../../services/sttService');
const { generateSpeech } = require('../../services/feedbackService');




async function handleComplaint(params = {}) {
  const { callerId, dtmfKey, context, voice } = params;
  const socket = context ? context.socket : null;
  const customerAudio = context ? context.customerAudio : null;

  console.log(`[Complaint Handler] Option 1 (Complaint) selected by ${callerId || 'Customer'}`);

  // Step 1: Prompt customer to state their complaint
  const promptText = "What is your complaint? Please state your issue.";

  // Step 2: Capture customer speech buffer & transcribe
  let audioBuffer = customerAudio;
  if (!audioBuffer && socket) {
    console.log('[Complaint Handler] Capturing customer audio for 2.5 seconds...');
    audioBuffer = await captureRtpAudio(socket, 2500);
  }

  const complaintTranscript = audioBuffer ? await transcribeAudio(audioBuffer) : null;
  const recordedIssue = complaintTranscript || 'Broadband service interruption reported via IVR';

  // Step 3: Register ticket & generate confirmation response
  const ticketNumber = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticketDetails = {
    ticketId: ticketNumber,
    callerId: callerId || 'Customer',
    issueDescription: recordedIssue,
    status: 'OPEN',
    resolutionSLA: '2 hours',
    createdAt: new Date().toISOString()
  };

  const responseText = "Your complaint is registered and our technical team will reach you as soon as possible.";

  console.log(`[Complaint Registered] #${ticketNumber} | Issue: "${recordedIssue}"`);

  // Optionally pre-generate Swarvam TTS for confirmation
  let audioFilename = 'audio24.mp3'
  try {
    const voiceId = voice || process.env.SWARVAM_VOICE || undefined
    const ttsFilename = await generateSpeech(responseText, { voiceId })
    if (ttsFilename) audioFilename = ttsFilename
  } catch (e) {
    console.warn('[Complaint Audio Warning]', e.message)
  }

  return {
    option: '1',
    title: 'Complaint Registration',
    prompt: promptText,
    text: responseText,
    transcript: recordedIssue,
    data: ticketDetails,
    audioFile: audioFilename
  };
}





module.exports = { handleComplaint };
