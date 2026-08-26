const router   = require('express').Router()
const { startCall, cancelCall, getLogs } = require('../controllers/feedbackController')

router.post('/',       startCall)
router.post('/cancel', cancelCall)
router.get('/logs',    getLogs)

module.exports = router
