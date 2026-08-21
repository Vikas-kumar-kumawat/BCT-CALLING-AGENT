const express = require('express')
const router = express.Router()
const { startCall, selectOption, getLogs } = require('../controllers/supportController')

router.post('/', startCall)
router.post('/option', selectOption)
router.post('/dtmf', selectOption)
router.get('/logs', getLogs)

module.exports = router
