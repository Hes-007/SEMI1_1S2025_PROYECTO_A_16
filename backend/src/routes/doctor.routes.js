const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { appointmentTreatmentSchema, scheduleSchema } = require('../utils/validators');
const {
  getPendingAppointments,
  attendAppointment,
  cancelAppointment,
  getAppointmentHistory,
  setSchedule,
  getSchedule,
  getProfile,
  updateProfile
} = require('../controllers/doctor.controller');

const router = express.Router();

// Apply authentication middleware to all doctor routes
router.use(authenticate);
router.use(authorize('medico'));

// Appointment routes
router.get('/appointments/pending', getPendingAppointments);
router.patch('/appointments/:appointment_id/attend', validate(appointmentTreatmentSchema), attendAppointment);
router.patch('/appointments/:appointment_id/cancel', cancelAppointment);
router.get('/appointments/history', getAppointmentHistory);

// Schedule routes
router.post('/schedule', validate(scheduleSchema), setSchedule);
router.get('/schedule', getSchedule);

// Profile routes
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

module.exports = router;