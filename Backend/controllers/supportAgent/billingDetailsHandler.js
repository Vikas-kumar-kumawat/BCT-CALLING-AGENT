/**
 * Option 3: Billing Details Handler
 */
async function handleBillingDetails(params = {}) {
  const { callerId, dtmfKey, context } = params;
  console.log(`[Support Agent - Billing] Processing key '${dtmfKey}' from ${callerId || 'Customer'}`);

  const responseText = "You selected Billing Details. Your current plan bill is Rs. 799, due on 30th of this month. Pay online at bfibernet.com to enjoy uninterrupted service.";

  return {
    option: '3',
    title: 'Billing Details',
    text: responseText,
    data: {
      plan: 'BFibernet 100Mbps',
      amountDue: 'INR 799.00',
      dueDate: '2026-08-30',
      paymentStatus: 'UNPAID'
    },
    audioFile: 'audio22.mp3'
  };
}

module.exports = { handleBillingDetails };




// algorithm

// 1.search user in databases by caller id
// 2.search user recharge details.
// 3.send user the recharege status to user
