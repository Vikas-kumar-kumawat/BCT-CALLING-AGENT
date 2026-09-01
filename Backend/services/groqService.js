const fetch = (...args) => (globalThis.fetch ? globalThis.fetch(...args) : import('node-fetch').then(({ default: f }) => f(...args)))

const GROQ_API_KEY = process.env.GROQ_API_KEY || ''
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

function fallbackClassify(text) {
  const t = (text || '').toLowerCase()
  if (!t) return 'other'
  if (t.includes('slow') || t.includes('speed') || t.includes('latency') || t.includes('no internet') || t.includes('bad') || t.includes('worst') || t.includes('not working') || t.includes('error') || t.includes('issue')) return 'other'
  if (t.includes('good') || t.includes('great') || t.includes('excellent') || t.includes('fine') || t.includes('working') || t.includes('best') || t.includes('awesome') || t.includes('nice') || t.includes('ok')) return 'positive'
  return 'other'
}

async function classifyFeedback(text) {
  if (!text || !text.trim()) return 'other'
  if (!GROQ_API_KEY) {
    return fallbackClassify(text)
  }

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'groq/compound-mini',
        messages: [{ role: 'user', content: `Classify this customer feedback as exactly "positive" or "other". Respond with only one word in lowercase. Feedback: "${text}"` }],
        max_tokens: 10,
        temperature: 0.1
      })
    })

    if (!res.ok) {
      console.warn('[GROQ CLASSIFY] HTTP Error', res.status)
      return fallbackClassify(text)
    }

    const data = await res.json()
    const result = data.choices?.[0]?.message?.content?.trim()?.toLowerCase() || ''
    
    if (result.includes('positive')) return 'positive'
    return 'other'
  } catch (e) {
    console.warn('[GROQ CLASSIFY] Error', e.message)
    return fallbackClassify(text)
  }
}

module.exports = { classifyFeedback }
