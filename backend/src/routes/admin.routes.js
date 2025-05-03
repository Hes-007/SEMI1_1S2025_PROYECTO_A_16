const express = require('express');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');
const {
  getPendingPatients,
  getPendingDoctors,
  approvePatient,
  approveDoctor,
  rejectPatient,
  rejectDoctor,
  getAllPatients,
  getAllDoctors,
  deactivatePatient,
  deactivateDoctor,
  getDoctorsWithMostPatients,
  getMostPopularSpecialties
} = require('../controllers/admin.controller');

const router = express.Router();

// Apply authentication and admin middleware to all admin routes
router.use(authenticate);
router.use(isAdmin);

// Pending registrations management
router.get('/pending/patients', getPendingPatients);
router.get('/pending/doctors', getPendingDoctors);
router.patch('/pending/patients/:patient_id/approve', approvePatient);
router.patch('/pending/doctors/:doctor_id/approve', approveDoctor);
router.patch('/pending/patients/:patient_id/reject', rejectPatient);
router.patch('/pending/doctors/:doctor_id/reject', rejectDoctor);

// User management
router.get('/patients', getAllPatients);
router.get('/doctors', getAllDoctors);
router.patch('/patients/:patient_id/deactivate', deactivatePatient);
router.patch('/doctors/:doctor_id/deactivate', deactivateDoctor);

// Reports
router.get('/reports/doctors/most-patients', getDoctorsWithMostPatients);
router.get('/reports/specialties/most-popular', getMostPopularSpecialties);

module.exports = router;