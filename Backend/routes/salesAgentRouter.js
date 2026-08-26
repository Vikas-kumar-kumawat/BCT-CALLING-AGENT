const router = require('express').Router()
const { startCall, getLogs } = require('../controllers/salesAgent/salesAgentController')

router.post('/',    startCall)
router.get('/logs', getLogs)

module.exports = router
