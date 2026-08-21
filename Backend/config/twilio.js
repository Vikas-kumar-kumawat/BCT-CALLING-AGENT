require('dotenv').config()
const twilio = require('twilio')

const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_PHONE_NUMBER: twilioPhone } = process.env
const client = (sid && sid !== 'your_twilio_account_sid') ? twilio(sid, token) : null

module.exports = { client, twilio, twilioPhone }
