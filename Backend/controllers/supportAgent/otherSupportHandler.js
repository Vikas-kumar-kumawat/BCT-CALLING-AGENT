/**
 * Option 4: General Customer Support Executive Handler
 */
async function handleOtherSupport(params = {}) {
  const { callerId, dtmfKey, context } = params;
  console.log(`[Support Agent - Other Support] Processing key '${dtmfKey}' from ${callerId || 'Customer'}`);

  const responseText = "You selected General Support. Transferring your call to a customer support executive. Please stay on the line.";

  return {
    option: '4',
    title: 'General Support Executive',
    text: responseText,
    data: {
      transferStatus: 'TRANSFERRING_TO_AGENT',
      department: 'General Support'
    },
    audioFile: 'audio22.mp3'
  };
}

module.exports = { handleOtherSupport };
