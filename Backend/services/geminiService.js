const fetch = (...args) => (globalThis.fetch ? globalThis.fetch(...args) : import('node-fetch').then(({ default: f }) => f(...args)))

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const rawModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
const GEMINI_MODEL = rawModel.includes('2.5') ? 'gemini-1.5-flash' : rawModel
const GEMINI_API_URL = process.env.GEMINI_API_URL || `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

function fallbackClassify(text) {
  if (!text) return 'other'
  const t = ` ${text.toLowerCase()} ` // Pad with space for boundary checking

  // Check for negative words or negation first
  const negativeKeywords = [
    'not', 'nahi', 'naahi', 'bad', 'slow', 'bekar', 'kharab', 'issue', 'problem', 'dikkat', 'ganda', 'bakwas', 'band', 'down',
    'नहीं', 'ख़राब', 'खराब', 'बेकार', 'बकवास', 'बंद', 'समस्या', 'दिक्कत', 'गंदा', 'स्लो', 'नहीं चल रहा'
  ]
  for (const k of negativeKeywords) {
    if (t.includes(k)) return 'other'
  }

  // Check for positive words
  const positiveKeywords = [
    'good', 'fine', 'working', 'achha', 'accha', 'sahi', 'excellent', 'great', 'satisfied', 'badhiya', 'badiya', 'thik', 'theek', 'mast', 'ok', 'aacha', 'best', 'perfect', '1 number', 'ek number',
    'अच्छा', 'बढ़िया', 'ठीक', 'सही', 'मस्त', 'एक नंबर', 'काम कर रहा'
  ]
  for (const k of positiveKeywords) {
    if (t.includes(k)) return 'positive'
  }

  return 'other'
}

async function classifyFeedback(text) {
  if (!text) return 'other'
  if (!GEMINI_API_KEY) {
    console.warn('[GEMINI] API Key missing, using fallback classification')
    return fallbackClassify(text)
  }

  try {
    const prompt = `Classify the sentiment of the following customer feedback (which may be in English, Hindi, or Hinglish) as either POSITIVE or OTHER. Return exactly one word: POSITIVE or OTHER. Feedback:\n\n"""${text.replace(/"/g, '\\"')}"""`;
    
    // Use the official Gemini REST API payload structure
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 16, temperature: 0 }
    }

    const res = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (!res.ok) {
      console.error('[GEMINI] error', res.status, await res.text())
      return fallbackClassify(text)
    }
    
    const data = await res.json()
    // Extract text from the standard Gemini API response format
    const outText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const out = outText.trim().toLowerCase()
    
    if (out.includes('positive')) return 'positive'
    if (out.includes('pos')) return 'positive'
    return 'other'
  } catch (e) {
    console.error('[GEMINI] classify error', e.message)
    return fallbackClassify(text)
  }
}

module.exports = { classifyFeedback }

module.exports = { classifyFeedback }

