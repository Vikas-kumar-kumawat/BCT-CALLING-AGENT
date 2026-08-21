const express = require('express')
const router = express.Router()
const { startCall, cancelCall, handleGather, getLogs } = require('../controllers/rechargeController')

router.post('/', startCall)
router.post('/cancel', cancelCall)
router.post('/gather', handleGather)
router.get('/logs', getLogs)

module.exports = router
