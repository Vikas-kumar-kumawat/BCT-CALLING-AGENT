/**
 * Option 1: Complaint Registration Handler
 */
const { transcribeAudio, captureRtpAudio } = require('../../services/sttService');

async function handleComplaint(params = {}) {
  const { callerId, dtmfKey, context } = params;
  const socket = context ? context.socket : null;
  const customerAudio = context ? context.customerAudio : null;

  console.log(`[Complaint Handler] Option 1 selected by ${callerId || 'Customer'}`);

  const promptText = "What is your complaint? Please state your issue.";

  let audioBuffer = customerAudio;
  if (!audioBuffer && socket) {
    console.log('[Complaint Handler] Capturing customer RTP audio...');
    audioBuffer = await captureRtpAudio(socket, 4000);
  }

  const complaintTranscript = await transcribeAudio(audioBuffer);

  const ticketNumber = `COMP-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticketDetails = {
    ticketId: ticketNumber,
    callerId: callerId || 'Customer',
    issueDescription: complaintTranscript,
    status: 'OPEN',
    resolutionSLA: '2 hours',
    createdAt: new Date().toISOString()
  };

  const responseText = `Thank you. We recorded your complaint: "${complaintTranscript}". Complaint ticket #${ticketNumber} has been raised. Your issue will be solved within 2 hours.`;

  console.log(`[Ticket Raised] #${ticketNumber} | SLA: 2 Hours | Issue: "${complaintTranscript}"`);

  return {
    option: '1',
    title: 'Complaint Registration',
    prompt: promptText,
    text: responseText,
    transcript: complaintTranscript,
    data: ticketDetails,
    audioFile: 'audio24.mp3'
  };
}

module.exports = { handleComplaint };
