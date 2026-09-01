const fetch = require('node-fetch')

const GROQ_API_URL = process.env.GROQ_API_URL || ''
const GROQ_API_KEY = process.env.GROQ_API_KEY || ''

function fallbackAnalyze(text) {
  const t = (text || '').toLowerCase()
  if (!t) return null
  if (t.includes('slow') || t.includes('speed') || t.includes('latency'))
    return 'We detected performance issues. Offer a speed test and check the router. Ask for permission to schedule a technician.'
  if (t.includes('no') && (t.includes('internet') || t.includes('connect'))) 
    return 'Connection seems down. Ask the customer to restart the router and check cables. Offer to escalate if unresolved.'
  return 'Thank you for your feedback. We will record this and a team member will follow up if needed.'
}

async function analyzeFeedback(text) {
  if (!text || !text.trim()) return null
  if (!GROQ_API_URL || !GROQ_API_KEY) {
    return fallbackAnalyze(text)
  }

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text, max_output_tokens: 200 })
    })
    if (!res.ok) {
      console.error('[GROQ]', res.status, await res.text())
      return fallbackAnalyze(text)
    }
    const data = await res.json()
    // Try to extract a reasonable text field from common response shapes
    if (typeof data === 'string') return data
    const out = data.output_text || (data.output && data.output[0] && data.output[0].content) || data.result || JSON.stringify(data)
    return (out && typeof out === 'string') ? out : JSON.stringify(out)
  } catch (e) {
    console.error('[GROQ] Error', e.message)
    return fallbackAnalyze(text)
  }
}

module.exports = { analyzeFeedback }
