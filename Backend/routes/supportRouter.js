const express = require('express')
const router = express.Router()
const { handleIncomingCall, startCall, cancelCall, handleGather, getLogs } = require('../controllers/supportController')

// Webhook endpoints for incoming calls to +17853845847
router.post('/incoming', handleIncomingCall)
router.get('/incoming', handleIncomingCall)
router.post('/webhook', handleIncomingCall)
router.get('/webhook', handleIncomingCall)

router.post('/', startCall)
router.post('/cancel', cancelCall)
router.post('/gather', handleGather)
router.get('/logs', getLogs)

module.exports = router
