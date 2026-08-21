const express = require('express')
const router = express.Router()
const { startCall, getLogs } = require('../controllers/salesAgent')

router.post('/', startCall)
router.get('/logs', getLogs)

module.exports = router
