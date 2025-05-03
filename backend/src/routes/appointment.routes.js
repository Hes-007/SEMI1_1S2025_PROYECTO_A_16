const express = require('express');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  getAppointmentById,
  getAppointmentsStats
} = require('../controllers/appointment.controller');

const router = express.Router();

// Apply authentication middleware to all appointment routes
router.use(authenticate);

// Get appointment details
router.get('/:appointment_id', getAppointmentById);

// Get appointment statistics (admin only)
router.get('/stats/overview', getAppointmentsStats);

module.exports = router;