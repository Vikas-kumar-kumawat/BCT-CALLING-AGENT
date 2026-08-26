const { makeSipCall } = require('../../services/sip')
const { getLocalAudio } = require('../../services/audioService')
const { streamAudio } = require('../../services/rtpService')

const GREETING = 'Hello! I am calling from BCT Fibernet Sales. We have exciting high-speed fiber plan upgrades available for your location today. Are you interested in upgrading your speed?'
let logs = []

module.exports = {
  startCall: async (req, res) => {
    const { name = 'Customer', phone } = req.body || {}
    if (!phone) return res.status(400).json({ success: false, msg: 'Phone required' })

    const target = phone.replace(/\D/g, '')
    logs = [{ id: Date.now(), sender: 'agent', speaker: 'Sales Agent', text: GREETING, time: new Date().toLocaleTimeString() }]

    try {
      const call = await makeSipCall(target)
      res.json({ success: true, message: `Connected to ${target}`, logs })
      await streamAudio(await getLocalAudio('audio23.mp3'), call.rtpIp, call.rtpPort, call.socket)
    } catch (e) {
      if (!res.headersSent) res.status(500).json({ success: false, msg: e.message, logs })
    }
  },
  getLogs: (req, res) => res.json({ success: true, logs })
}
