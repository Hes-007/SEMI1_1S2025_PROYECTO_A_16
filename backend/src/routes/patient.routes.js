const express = require('express');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { appointmentSchema } = require('../utils/validators');
const {
  getAllDoctors,
  searchDoctorsBySpecialty,
  getDoctorSchedule,
  getDoctorAvailability,
  createAppointment,
  getActiveAppointments,
  cancelAppointment,
  getAppointmentHistory,
  getProfile,
  updateProfile
} = require('../controllers/patient.controller');

const router = express.Router();

// Apply authentication middleware to all patient routes
router.use(authenticate);
router.use(authorize('paciente'));

// Doctor listing and search routes
router.get('/doctors', getAllDoctors);
router.get('/doctors/specialty/:especialidad_id', searchDoctorsBySpecialty);
router.get('/doctors/:doctor_id/schedule', getDoctorSchedule);
router.get('/doctors/:doctor_id/availability', getDoctorAvailability);

// Appointment routes
router.post('/appointments', validate(appointmentSchema), createAppointment);
router.get('/appointments/active', getActiveAppointments);
router.patch('/appointments/:appointment_id/cancel', cancelAppointment);
router.get('/appointments/history', getAppointmentHistory);

// Profile routes
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

module.exports = router;