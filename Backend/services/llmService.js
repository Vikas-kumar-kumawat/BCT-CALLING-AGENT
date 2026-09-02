// llmService.js — LLM-first voice feedback agent for BCT Fibernet
// The LLM decides sentiment, tone, and when to end the call. Local code only handles infra.
'use strict'
const fetch = (...args) => (globalThis.fetch ? globalThis.fetch(...args) : import('node-fetch').then(({ default: f }) => f(...args)))

const LLM_NAME = process.env.LLM_NAME
const LLM_MODEL = process.env.LLM_MODEL
const LLM_API_KEY = process.env.LLM_API_KEY
const LLM_API_URL = process.env.LLM_API_URL

const REQUEST_TIMEOUT_MS = Number(process.env.LLM_REQUEST_TIMEOUT_MS || 14000)
const HISTORY_WINDOW = Number(process.env.LLM_HISTORY_WINDOW || 12)

// ─────────────────────────────────────────────────────────────────────────────
// SYSTEM PROMPT — the LLM handles ALL logic: sentiment, tone, call end decision
// ─────────────────────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Rahul, a friendly customer support and feedback agent at BCT Fibernet.

LANGUAGE: Aap SIRF Hindi / Hinglish mein baat karein (Roman script e.g. "Namaste"). Never reply in full English. Ek natural, crisp aur polite agent ki tarah bolein.

VERY IMPORTANT - ULTRA SHORT RESPONSES:
- Har response BAHUT CHOTA hona chahiye (MAXIMUM 10-15 words total).
- Lambi baatein ya repeat karna bilkul mana hai. Voice call par short crisp responses hi bolne hain.

DECISION LOGIC:

POSITIVE FEEDBACK (Customer happy/satisfied):
- Thank them briefly and tell them to check BCT website or app for help.
- Example: "Dhanyawad sir! Kisi bhi madad ke liye BCT app ya website visit karein. [CALL_END]"

NEGATIVE FEEDBACK / ISSUE (Slow speed, disconnection, billing, etc.):
- Empathize in 2-3 words. Ask at most ONE short troubleshooting question (e.g. "Kya router restart kiya?").
- If already tried or still not working → Register complaint directly and direct to website/app:
  Example: "Samajh gaya sir, complaint register ho gayi hai. Status BCT app ya website par dekhein. Dhanyawad! [CALL_END]"
- Billing issues: Direct to app/website and end call immediately:
  Example: "Billing complaint note ho gayi hai, details BCT app ya website par check karein. Dhanyawad! [CALL_END]"

VAGUE REPLY:
- Ask ONE short question to clarify. Do NOT append [CALL_END].

CUSTOMER SAYS BYE / WANTS TO END:
- "Ji dhanyawad sir, aapka din shubh ho! [CALL_END]"

VOICE CALL RULES (STRICT):
- Plain text only (no markdown, emojis, asterisks, or formatting).
- MAXIMUM 10-15 WORDS PER RESPONSE. Keep it super short and crisp!
- Append [CALL_END] as the very last token ONLY when conversation is ending.
- Do NOT append [CALL_END] if you asked a question.`

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────


function prepareHistory(conversationHistory = []) {
  if (!Array.isArray(conversationHistory)) return []
  const clean = conversationHistory.filter(
    item => item && typeof item.content === 'string' && item.content.trim()
  )
  if (clean.length <= HISTORY_WINDOW) return clean
  return [...clean.slice(0, 1), ...clean.slice(-(HISTORY_WINDOW - 1))]
}

function stripFormatting(rawText = '') {
  if (typeof rawText !== 'string') return ''
  return rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/\[CALL_END\]/gi, '')
    .replace(/[*#_`~>]/g, '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildFallbackResponse() {
  const phrases = [
    'Maafi chahta hoon sir, sun nahi paya. Kya dobara bolenge?',
    'Haanji sir, thoda clearly bolenge? Aawaz nahi aayi.',
    'Ji sir, ek baar aur bolenge? Main dhyan se sun raha hoon.'
  ]
  return phrases[Math.floor(Math.random() * phrases.length)]
}

// ─────────────────────────────────────────────────────────────────────────────
// fetchWithRetry — HTTP with timeout + automatic retry
// ─────────────────────────────────────────────────────────────────────────────
async function fetchWithRetry(url, options, retries = 2, delayMs = 800) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const tid = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
      const res = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(tid)
      return res
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise(r => setTimeout(r, delayMs))
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// callLLM — sends chat history to LLM with automatic model fallback
// ─────────────────────────────────────────────────────────────────────────────
async function callLLM(conversationHistory) {
  const apiKey = process.env.LLM_API_KEY || LLM_API_KEY
  if (!apiKey || apiKey === 'YOUR_LLM_API_KEY_HERE') throw new Error('LLM API Key not configured.')

  const primaryModel = process.env.LLM_MODEL || LLM_MODEL
  const modelsToTry = [primaryModel, 'groq/compound', 'openai/gpt-oss-20b']

  const messages = prepareHistory(conversationHistory).map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }))

  const headers = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }

  let lastError = null
  for (const model of modelsToTry) {
    try {
      const res = await fetchWithRetry(LLM_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
          temperature: 0.6,
          max_tokens: 500,
          top_p: 0.9
        })
      })

      if (!res.ok) {
        const errBody = await res.text().catch(() => '')
        throw new Error(`HTTP ${res.status}: ${errBody.slice(0, 200)}`)
      }

      const data = await res.json()
      const raw = data.choices?.[0]?.message?.content || ''
      if (raw && raw.trim()) return { text: raw.trim(), model }
      throw new Error('Empty response')
    } catch (err) {
      console.warn(`[LLM] ${model} failed: ${err.message}`)
      lastError = err
    }
  }

  throw lastError || new Error('All LLM models failed')
}

// ─────────────────────────────────────────────────────────────────────────────
// generateAgentResponse — main entry point called by feedbackController
// The LLM response alone decides whether to end the call via [CALL_END]
// ─────────────────────────────────────────────────────────────────────────────
async function generateAgentResponse(conversationHistory = [], callDurationMs = 0, userSpeech = '') {
  const apiKey = process.env.LLM_API_KEY || LLM_API_KEY
  const modelName = process.env.LLM_MODEL || LLM_MODEL
  const providerName = process.env.LLM_NAME || LLM_NAME
  const history = prepareHistory(conversationHistory)

  let rawText = ''
  let modelUsed = 'none'
  const start = Date.now()

  if (apiKey && apiKey !== 'YOUR_LLM_API_KEY_HERE') {
    try {
      console.log(`[LLM] → ${providerName} (${modelName}) | Key: ${apiKey.substring(0, 6)}...`)
      const result = await callLLM(history)
      rawText = result.text
      modelUsed = result.model
      console.log(`[LLM] ✓ ${modelUsed} responded in ${Date.now() - start}ms`)
    } catch (err) {
      console.error('[LLM] All models failed:', err.message)
      rawText = ''
    }
  } else {
    console.warn('[LLM] No API key — using test simulation.')
    rawText = 'Namaste sir! Main BCT Fibernet se Rahul bol raha hoon. Aapki internet service kaisi chal rahi hai?'
  }

  if (!rawText || !rawText.trim()) {
    rawText = buildFallbackResponse()
  }

  // LLM output determines everything — check [CALL_END] before stripping it.
  // Guard: never cut the call before the customer has spoken at least once.
  const hasUserSpoken = conversationHistory.some(m => m.role === 'user')
  const llmWantsEnd = rawText.includes('[CALL_END]')
  const shouldEndCall = hasUserSpoken && llmWantsEnd

  const spokenText = stripFormatting(rawText)

  // Safety: if the LLM returned nothing meaningful
  const finalText = spokenText || (shouldEndCall
    ? 'BCT Fibernet se baat karne ke liye dhanyawad sir. Aapka din shubh ho.'
    : buildFallbackResponse())

  console.log(`[LLM] Agent: "${finalText}" | EndCall: ${shouldEndCall} | HasUserSpoken: ${hasUserSpoken} | Model: ${modelUsed}`)
  return { text: finalText, shouldEndCall }
}

module.exports = {
  generateAgentResponse,
  callLLM,
  buildFallbackResponse,
  stripFormatting,
  prepareHistory
}
