const express = require('express')
const router = express.Router()
const { startCall, cancelCall, getLogs } = require('../controllers/rechargeController')

router.post('/', startCall)
router.post('/cancel', cancelCall)
router.get('/logs', getLogs)

module.exports = router
