/**
 * controllers/supportAgent/supportController.js - Support IVR & Complaints Dashboard Controller
 */

const { startInboundServer, isActive } = require('../../services/sipInboundService')
const { getLocalAudio } = require('../../services/audioService')
const { streamAudio } = require('../../services/rtpService')
const { dispatchIvrOption } = require('./index')

let conversationLogs = []
let activeCallSession = null
let totalCallsCount = 18

// Initial pre-loaded complaints store
let complaintsList = [
  {
    id: 'TKT-8901',
    customerName: 'Vikas Kumawat',
    phone: '9057262630',
    issue: 'Fiber Optical Light RED - Complete internet outage since morning',
    category: 'Broadband Outage',
    status: 'OPEN',
    sla: '2 Hours',
    createdAt: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: 'TKT-8894',
    customerName: 'Amit Sharma',
    phone: '9829012345',
    issue: 'High latency & packet loss during evening gaming hours',
    category: 'Speed & Latency',
    status: 'IN PROGRESS',
    sla: '4 Hours',
    createdAt: new Date(Date.now() - 7200000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  },
  {
    id: 'TKT-8872',
    customerName: 'Priya Verma',
    phone: '9414056789',
    issue: 'Requested plan upgrade from 100Mbps to 300Mbps Fiber',
    category: 'Plan Change',
    status: 'RESOLVED',
    sla: 'Resolved',
    createdAt: new Date(Date.now() - 86400000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
]

const GREETING_TEXT = 'Welcome to BCT Support. For complaint press 1, for new connection press 2, for billing details press 3, for other support press 4.'

function addLog(sender, speaker, text) {
  conversationLogs.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    sender,
    speaker,
    text,
    timestamp: new Date().toLocaleTimeString()
  })
}

/**
 * Start Inbound Support IVR Call Session
 */
async function startCall(req, res) {
  try {
    totalCallsCount += 1
    if (!isActive()) {
      await startInboundServer(async (rtpIp, rtpPort, socket) => {
        activeCallSession = { rtpIp, rtpPort, socket }
        addLog('customer', 'Customer', `Call connected from ${rtpIp}:${rtpPort}`)
        
        try {
          const audio = await getLocalAudio('audio22.mp3')
          await streamAudio(audio, rtpIp, rtpPort, socket)
        } catch (e) {
          console.warn('[Support Audio Warning]', e.message)
        }
        addLog('agent', 'BCT Support IVR', GREETING_TEXT)
      })
    }

    if (conversationLogs.length === 0) {
      addLog('agent', 'BCT Support IVR', GREETING_TEXT)
    }

    res.json({ 
      success: true, 
      message: 'BCT Support IVR Active', 
      logs: conversationLogs,
      totalCalls: totalCallsCount
    })
  } catch (err) {
    console.error('[Support Call Error]', err.message)
    res.status(500).json({ 
      success: false, 
      message: err.message, 
      logs: conversationLogs 
    })
  }
}

/**
 * Handle DTMF Option Selection (Keys 1, 2, 3, 4)
 */
async function selectOption(req, res) {
  const { option, callerId, name, phone } = req.body || {}
  if (!option) return res.status(400).json({ success: false, message: 'Option key is required' })

  try {
    const customerPhone = phone || '9057262630'
    const customerName = name || 'Vikas'
    addLog('customer', 'Customer (DTMF)', `Pressed Key [ ${option} ]`)

    const result = await dispatchIvrOption(option, { callerId: callerId || `${customerName} (${customerPhone})` })
    addLog('agent', 'BCT Support Agent', result.text)

    // If Key 1 (Complaint) was selected, auto-register a new complaint ticket!
    if (option === '1') {
      const ticketId = result.data?.ticketId || `TKT-${Math.floor(1000 + Math.random() * 9000)}`
      const newTicket = {
        id: ticketId,
        customerName: customerName,
        phone: customerPhone,
        issue: result.transcript || 'Broadband service interruption reported via IVR',
        category: 'IVR Complaint',
        status: 'OPEN',
        sla: '2 Hours',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      complaintsList.unshift(newTicket)
    }

    // Stream audio response over RTP if session is active
    if (activeCallSession && result.audioFile) {
      getLocalAudio(result.audioFile).then((audio) => {
        return streamAudio(audio, activeCallSession.rtpIp, activeCallSession.rtpPort, activeCallSession.socket)
      }).catch((e) => console.warn('[Support RTP Stream Error]', e.message))
    }

    res.json({ success: true, result, logs: conversationLogs, complaints: complaintsList })
  } catch (err) {
    console.error('[Support Option Error]', err.message)
    res.status(500).json({ success: false, message: err.message, logs: conversationLogs })
  }
}

/**
 * Get active support conversation logs & dashboard stats
 */
function getLogs(req, res) {
  res.json({ 
    success: true, 
    logs: conversationLogs,
    stats: {
      totalCalls: totalCallsCount,
      openComplaints: complaintsList.filter(c => c.status === 'OPEN').length,
      inProgressComplaints: complaintsList.filter(c => c.status === 'IN PROGRESS').length,
      resolvedComplaints: complaintsList.filter(c => c.status === 'RESOLVED').length
    }
  })
}

/**
 * Get all complaints
 */
function getComplaints(req, res) {
  res.json({
    success: true,
    complaints: complaintsList,
    stats: {
      totalCalls: totalCallsCount,
      openComplaints: complaintsList.filter(c => c.status === 'OPEN').length,
      inProgressComplaints: complaintsList.filter(c => c.status === 'IN PROGRESS').length,
      resolvedComplaints: complaintsList.filter(c => c.status === 'RESOLVED').length
    }
  })
}

/**
 * Update complaint status (OPEN -> IN PROGRESS -> RESOLVED)
 */
function updateComplaintStatus(req, res) {
  const { id } = req.params
  const { status } = req.body
  const ticket = complaintsList.find(c => c.id === id)
  if (!ticket) return res.status(404).json({ success: false, message: 'Complaint ticket not found' })

  if (status) {
    ticket.status = status
  } else {
    // Toggle cycle
    ticket.status = ticket.status === 'OPEN' ? 'IN PROGRESS' : ticket.status === 'IN PROGRESS' ? 'RESOLVED' : 'OPEN'
  }

  res.json({ success: true, message: `Ticket ${id} status updated to ${ticket.status}`, ticket })
}

/**
 * Add a new complaint manually
 */
function createComplaint(req, res) {
  const { customerName, phone, issue, category } = req.body || {}
  if (!issue) return res.status(400).json({ success: false, message: 'Issue description required' })

  const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`
  const newTicket = {
    id: ticketId,
    customerName: customerName || 'Walk-in Customer',
    phone: phone || '9057262630',
    issue,
    category: category || 'General Complaint',
    status: 'OPEN',
    sla: '2 Hours',
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  complaintsList.unshift(newTicket)
  res.json({ success: true, message: 'Complaint registered successfully', ticket: newTicket })
}

module.exports = { 
  startCall, 
  selectOption, 
  getLogs, 
  getComplaints, 
  updateComplaintStatus, 
  createComplaint 
}
