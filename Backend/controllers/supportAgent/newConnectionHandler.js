/**
 * Option 2: New Connection Inquiry Handler
 */
async function handleNewConnection(params = {}) {
  const { callerId, dtmfKey, context } = params;
  console.log(`[Support Agent - New Connection] Processing key '${dtmfKey}' from ${callerId || 'Customer'}`);

  const responseText = "You selected New Connection. Thank you for choosing BFibernet! A sales executive will contact you shortly to schedule installation.";

  return {
    option: '2',
    title: 'New Connection Inquiry',
    text: responseText,
    data: {
      leadId: `LEAD-${Math.floor(1000 + Math.random() * 9000)}`,
      planRequested: '100 Mbps Fiber',
      status: 'PENDING_CONTACT'
    },
    audioFile: 'audio23.mp3'
  };
}

module.exports = { handleNewConnection };
