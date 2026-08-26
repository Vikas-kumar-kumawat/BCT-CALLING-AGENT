const { startInboundServer, isInboundActive } = require('../../services/sip')
const { getLocalAudio } = require('../../services/audioService')
const { streamAudio }   = require('../../services/rtpService')
const { generateSpeechAudio: tts } = require('../../services/elevenlabsService')
const { captureRtpAudio: capRtp, transcribeAudio: stt } = require('../../services/sttService')

const GREETING = 'Welcome to the newly updated BCT Support system. Press 1 for complaint, 2 for new connection, 3 for billing, 4 for support.'
const OPTS = {
  '1': { t: 'Complaint', txt: 'Complaint registered. Team will contact you.', a: 'audio24.mp3' },
  '2': { t: 'New Connection', txt: 'Thanks! Sales will contact you.', a: 'audio23.mp3' },
  '3': { t: 'Billing', txt: 'Bill is Rs 799, due 30th. Pay online.', a: 'audio22.mp3' },
  '4': { t: 'Support', txt: 'Transferring to executive. Stay online.', a: 'audio22.mp3' }
}

let logs = [], session = null, calls = 18
const tk = () => `TKT-${Math.floor(1000 + Math.random() * 9000)}`
const ts = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
let comps = [
  { id: 'TKT-8901', customerName: 'Vikas', phone: '9057262630', issue: 'Outage', category: 'Outage', status: 'OPEN', sla: '2 Hours', createdAt: ts() },
  { id: 'TKT-8894', customerName: 'Amit',  phone: '9829012345', issue: 'Latency', category: 'Speed', status: 'IN PROGRESS', sla: '4 Hours', createdAt: ts() }
]

const log = (snd, spk, txt) => logs.push({ id: Date.now()+Math.random(), sender: snd, speaker: spk, text: txt, time: ts() })
const stats = () => ({ calls, open: comps.filter(c=>c.status==='OPEN').length, prog: comps.filter(c=>c.status==='IN PROGRESS').length, res: comps.filter(c=>c.status==='RESOLVED').length })

const handleInboundCall = async (ip, port, sock) => {
  session = { ip, port, sock }
  calls++
  console.log(`\n[NEW SUPPORT CODE] Inbound call connected from ${ip}:${port}`)
  log('customer', 'Customer', `Inbound call connected from ${ip}:${port}`)
  try {
    const gFile = await tts(GREETING)
    if (gFile) {
      console.log(`[NEW SUPPORT CODE] Playing IVR Greeting...`)
      await streamAudio(await getLocalAudio(gFile), ip, port, sock)
    }
  } catch (e) {
    console.error('[Inbound Audio Error]', e.message)
  }
  log('agent', 'IVR', GREETING)
}

// Auto-start inbound SIP listener when supportController module is loaded
if (process.env.SIP_SERVER_IP && process.env.SIP_USERNAME) {
  startInboundServer(handleInboundCall).catch(err => console.warn('[SIP Inbound Auto-start]', err.message))
}

module.exports = {
  startCall: async (req, res) => {
    try {
      calls++
      if (!isInboundActive()) await startInboundServer(handleInboundCall)
      if (!logs.length) log('agent', 'IVR', GREETING)
      res.json({ success: true, logs, calls })
    } catch (e) { res.status(500).json({ success: false, msg: e.message, logs }) }
  },
  selectOption: async (req, res) => {
    const { option: o, name = 'Vikas', phone = '9057262630' } = req.body || {}
    if (!o) return res.status(400).json({ success: false })
    log('customer', 'Customer', `Pressed [${o}]`)
    const opt = OPTS[o], txt = opt ? opt.txt : 'Invalid. Press 1-4.'
    log('agent', 'IVR', txt)
    
    if (o === '1') {
      let tr = '(IVR)'
      if (session?.sock) tr = await stt(await capRtp(session.sock, 2500)) || tr
      comps.unshift({ id: tk(), customerName: name, phone, issue: tr, category: 'Complaint', status: 'OPEN', sla: '2 Hours', createdAt: ts() })
    }
    
    if (session) {
      if (opt?.a) getLocalAudio(opt.a).then(a => streamAudio(a, session.ip, session.port, session.sock)).catch(()=>{})
      if (opt) tts(txt).then(f => f && getLocalAudio(f).then(a => streamAudio(a, session.ip, session.port, session.sock)).catch(()=>{})).catch(()=>{})
    }
    res.json({ success: true, logs, complaints: comps })
  },
  getLogs: (req, res) => res.json({ success: true, logs, stats: stats() }),
  getComplaints: (req, res) => res.json({ success: true, complaints: comps, stats: stats() }),
  updateComplaintStatus: (req, res) => {
    const t = comps.find(c => c.id === req.params.id)
    if (!t) return res.status(404).json({ success: false })
    t.status = req.body.status || ({'OPEN':'IN PROGRESS','IN PROGRESS':'RESOLVED','RESOLVED':'OPEN'})[t.status]
    res.json({ success: true, ticket: t })
  },
  createComplaint: (req, res) => {
    const { customerName: c = 'Walk-in', phone: p = '', issue: i, category: cat = 'General' } = req.body || {}
    if (!i) return res.status(400).json({ success: false })
    const t = { id: tk(), customerName: c, phone: p, issue: i, category: cat, status: 'OPEN', sla: '2 Hours', createdAt: ts() }
    comps.unshift(t)
    res.json({ success: true, ticket: t })
  }
}
