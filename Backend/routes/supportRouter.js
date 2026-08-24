const express = require('express')
const router = express.Router()
const { 
  startCall, 
  selectOption, 
  getLogs, 
  getComplaints, 
  updateComplaintStatus, 
  createComplaint 
} = require('../controllers/supportAgent/supportController')

router.post('/', startCall)
router.post('/option', selectOption)
router.post('/dtmf', selectOption)
router.get('/logs', getLogs)

// Complaints Dashboard Endpoints
router.get('/complaints', getComplaints)
router.post('/complaints', createComplaint)
router.put('/complaints/:id/status', updateComplaintStatus)

module.exports = router
