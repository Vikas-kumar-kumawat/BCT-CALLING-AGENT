/**
 * controllers/supportAgent/index.js - Support Agent IVR Handlers & Dispatcher
 */
const { handleComplaint } = require('./complaintHandler');
const { handleNewConnection } = require('./newConnectionHandler');
const { handleBillingDetails } = require('./billingDetailsHandler');
const { handleOtherSupport } = require('./otherSupportHandler');
const { handleInvalidOption } = require('./invalidOptionHandler');

const ivrHandlerMap = {
  '1': handleComplaint,
  '2': handleNewConnection,
  '3': handleBillingDetails,
  '4': handleOtherSupport
};

/**
 * Dispatch IVR Option dynamically based on DTMF key
 */
async function dispatchIvrOption(dtmfKey, context = {}) {
  const handler = ivrHandlerMap[String(dtmfKey).trim()] || handleInvalidOption;
  return await handler({ callerId: context.callerId, dtmfKey, context });
}

module.exports = {
  dispatchIvrOption,
  handleComplaint,
  handleNewConnection,
  handleBillingDetails,
  handleOtherSupport,
  handleInvalidOption,
  ivrHandlerMap
};
