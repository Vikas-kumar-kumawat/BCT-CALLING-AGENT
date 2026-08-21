/**
 * Fallback Handler for Invalid Options
 */
async function handleInvalidOption(params = {}) {
  const { dtmfKey } = params;
  console.log(`[Support Agent - Invalid Option] Processing key '${dtmfKey}'`);

  const responseText = `Invalid selection '${dtmfKey}'. Please press 1 for Complaint, 2 for New Connection, 3 for Billing Details, or 4 for Other Support.`;

  return {
    option: dtmfKey || 'invalid',
    title: 'Invalid Selection',
    text: responseText,
    data: null,
    audioFile: null
  };
}

module.exports = { handleInvalidOption };
