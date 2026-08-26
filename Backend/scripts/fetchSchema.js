require('dotenv').config()
const https = require('https')

const url = process.env.SUPABASE_URL + '/rest/v1/'
const options = {
  headers: {
    apikey: process.env.SUPABASE_PUBLISHABLE_KEY
  }
}

https.get(url, options, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data)
      const customersSchema = parsed.definitions.customers.properties
      console.log('Customers schema columns:', Object.keys(customersSchema))
    } catch(e) {
      console.error('Error parsing:', e.message)
      console.log('Raw data:', data.slice(0, 500))
    }
  })
})
