require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const feedbackCallsRouter = require('./routes/feedbackcalls')
// const rechargereminderRouter = require('./routes/rechargereminderRouter')
// const promotionRouter = require('./routes/promotionRouter')
// const supportRouter = require('./routes/supportRouter')
const { startTunnel } = require('./config/tunnel')

const app = express()
const port = process.env.PORT || 8000

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
  setHeaders: (res) => {
    res.set('Content-Type', 'audio/mpeg')
    res.set('Bypass-Tunnel-Reminder', 'true')
  }
}))

// API Routes
app.use('/api/feedbackcalls', feedbackCallsRouter)
// app.use('/api/rechargereminder', rechargereminderRouter)
// app.use('/api/promotion', promotionRouter)
// app.use('/api/support', supportRouter)


// Serve static frontend build if dist folder exists (Single Service Render Deployment)
const frontendDist = path.join(__dirname, '../Frontend/dist')
if (fs.existsSync(frontendDist)) {
  console.log('[Production] Serving static Frontend assets from dist/')
  app.use(express.static(frontendDist))
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/audio') || req.path.startsWith('/health')) {
      return next()
    }
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
} else {
  app.get('/', (req, res) => res.send('BCT Voice AI Backend Running'))
}



app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`)
  if (!process.env.RENDER_EXTERNAL_URL && !process.env.BASE_URL) {
    startTunnel(port)
  }
})

process.stdin.resume()