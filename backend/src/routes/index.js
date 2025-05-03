const express = require('express');
const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const doctorRoutes = require('./doctor.routes');
const adminRoutes = require('./admin.routes');
const appointmentRoutes = require('./appointment.routes');

const router = express.Router();

// API Info route
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'SaludPlus API',
    version: '1.0.0',
    description: 'API para la gestión de citas médicas entre pacientes y médicos',
    status: 'OK'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/patient', patientRoutes);
router.use('/doctor', doctorRoutes);
router.use('/admin', adminRoutes);
router.use('/appointments', appointmentRoutes);

module.exports = router;