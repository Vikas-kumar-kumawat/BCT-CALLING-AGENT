require('dotenv').config()

const REQUIRED_ENV = ['GROQ_API_KEY', 'SUPABASE_URL', 'SUPABASE_PUBLISHABLE_KEY']
const missing = REQUIRED_ENV.filter(k => !process.env[k])
if (missing.length > 0) console.error('[ENV ERROR] Missing required:', missing.join(', '))
else console.log('[ENV] Required vars loaded ✓')

const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()
const port = process.env.PORT || 8000




app.use(cors({
  origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Bypass-Tunnel-Reminder']
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use((req, res, next) => {
  res.header('Bypass-Tunnel-Reminder', 'true')
  res.header('Access-Control-Allow-Origin', '*')
  next()
})

app.use('/audio', express.static(path.join(__dirname, 'audio'), {
  setHeaders: res => { res.set('Content-Type', 'audio/mpeg'); res.set('Bypass-Tunnel-Reminder', 'true') }
}))





app.use('/api/feedbackcalls', require('./routes/feedbackcalls'))
app.use('/api/support', require('./routes/supportRouter'))
app.use('/api/salesagent', require('./routes/salesAgentRouter'))
app.use('/api/customers', require('./routes/customersRouter'))
app.use('/api/tts', require('./routes/ttsRouter'))
app.use('/api/diagnostics', require('./routes/diagnosticsRouter'))





const frontendDist = path.join(__dirname, '../Frontend/dist')
if (fs.existsSync(frontendDist)) {
  console.log('[Production] Serving Frontend from dist/')
  app.use(express.static(frontendDist))
  app.use((req, res, next) => {
    if (req.path.match(/^\/(api|audio|health)/)) return next()
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
} else {
  app.get('/', (req, res) => res.send('BCT Voice AI Backend Running'))
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`)
  if (!process.env.RENDER_EXTERNAL_URL && !process.env.BASE_URL)
    require('./config/tunnel').startTunnel(port)

  // Pre-cache voice audio used by feedback flows
  try {
    const fb = require('./services/feedbackService')
    if (fb && typeof fb.initPrecache === 'function') fb.initPrecache().catch(()=>{})
  } catch (_) {}
})

process.stdin.resume()