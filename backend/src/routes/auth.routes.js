const express = require('express');
const multer = require('multer');
const path = require('path');
const validate = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  patientRegisterSchema,
  doctorRegisterSchema,
  loginSchema,
  adminLoginSchema
} = require('../utils/validators');
const {
  registerPatient,
  registerDoctor,
  login,
  adminLogin,
  adminSecondAuth
} = require('../controllers/auth.controller');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../temp'));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only accept auth2.ayd1 files for second factor auth
    if (file.originalname === 'auth2.ayd1') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permite el archivo auth2.ayd1'), false);
    }
  }
});

// Register routes
router.post('/register/patient', validate(patientRegisterSchema), registerPatient);
router.post('/register/doctor', validate(doctorRegisterSchema), registerDoctor);

// Login routes
router.post('/login', validate(loginSchema), login);
router.post('/admin/login', validate(adminLoginSchema), adminLogin);
router.post('/admin/second-auth', authenticate, upload.single('auth2'), adminSecondAuth);

module.exports = router;