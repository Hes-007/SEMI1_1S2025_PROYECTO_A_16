const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const { User } = require('../models/user.model');
const { Patient } = require('../models/patient.model');
const { Doctor } = require('../models/doctor.model');
const { Admin } = require('../models/admin.model');
const { Role } = require('../models/role.model');
const { Specialty } = require('../models/specialty.model');
const { comparePassword, validatePasswordStrength } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

/**
 * Register a new patient
 */
const registerPatient = async (req, res, next) => {
  try {
    // Check if password meets strength requirements
    if (!validatePasswordStrength(req.body.password)) {
      return res.status(400).json({
        status: 'error',
        message: 'La contraseña debe tener al menos 8 caracteres e incluir al menos una letra minúscula, una letra mayúscula y un número'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Check if DPI already exists
    const existingPatient = await Patient.findOne({ where: { dpi: req.body.dpi } });
    if (existingPatient) {
      return res.status(400).json({
        status: 'error',
        message: 'El DPI ya está registrado'
      });
    }

    // Get patient role
    const patientRole = await Role.findOne({ where: { nombre: 'paciente' } });
    if (!patientRole) {
      return res.status(500).json({
        status: 'error',
        message: 'Error interno: Rol de paciente no encontrado'
      });
    }

    // Create user with transaction
    const result = await sequelize.transaction(async (t) => {
      // Create user first
      const user = await User.create({
        email: req.body.email,
        password: req.body.password,
        rol_id: patientRole.id,
        estado: 'pendiente'
      }, { transaction: t });

      // Create patient profile
      const patient = await Patient.create({
        usuario_id: user.id,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        dpi: req.body.dpi,
        genero: req.body.genero,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        fecha_nacimiento: req.body.fecha_nacimiento,
        foto_url: req.body.foto_url || null
      }, { transaction: t });

      return { user, patient };
    });

    return res.status(201).json({
      status: 'success',
      message: 'Paciente registrado exitosamente. Pendiente de aprobación por el administrador',
      data: {
        id: result.patient.id,
        nombre: result.patient.nombre,
        apellido: result.patient.apellido,
        email: result.user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register a new doctor
 */
const registerDoctor = async (req, res, next) => {
  try {
    // Check if password meets strength requirements
    if (!validatePasswordStrength(req.body.password)) {
      return res.status(400).json({
        status: 'error',
        message: 'La contraseña debe tener al menos 8 caracteres e incluir al menos una letra minúscula, una letra mayúscula y un número'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: req.body.email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'El correo electrónico ya está registrado'
      });
    }

    // Check if DPI already exists
    const existingDoctor = await Doctor.findOne({ 
      where: { 
        [Op.or]: [
          { dpi: req.body.dpi },
          { numero_colegiado: req.body.numero_colegiado }
        ]
      } 
    });
    
    if (existingDoctor) {
      if (existingDoctor.dpi === req.body.dpi) {
        return res.status(400).json({
          status: 'error',
          message: 'El DPI ya está registrado'
        });
      } else {
        return res.status(400).json({
          status: 'error',
          message: 'El número de colegiado ya está registrado'
        });
      }
    }

    // Check if specialty exists
    const specialty = await Specialty.findByPk(req.body.especialidad_id);
    if (!specialty) {
      return res.status(404).json({
        status: 'error',
        message: 'La especialidad seleccionada no existe'
      });
    }

    // Get doctor role
    const doctorRole = await Role.findOne({ where: { nombre: 'medico' } });
    if (!doctorRole) {
      return res.status(500).json({
        status: 'error',
        message: 'Error interno: Rol de médico no encontrado'
      });
    }

    // Create user with transaction
    const result = await sequelize.transaction(async (t) => {
      // Create user first
      const user = await User.create({
        email: req.body.email,
        password: req.body.password,
        rol_id: doctorRole.id,
        estado: 'pendiente'
      }, { transaction: t });

      // Create doctor profile
      const doctor = await Doctor.create({
        usuario_id: user.id,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        dpi: req.body.dpi,
        genero: req.body.genero,
        direccion: req.body.direccion,
        direccion_clinica: req.body.direccion_clinica,
        telefono: req.body.telefono,
        fecha_nacimiento: req.body.fecha_nacimiento,
        numero_colegiado: req.body.numero_colegiado,
        especialidad_id: req.body.especialidad_id,
        foto_url: req.body.foto_url
      }, { transaction: t });

      return { user, doctor };
    });

    return res.status(201).json({
      status: 'success',
      message: 'Médico registrado exitosamente. Pendiente de aprobación por el administrador',
      data: {
        id: result.doctor.id,
        nombre: result.doctor.nombre,
        apellido: result.doctor.apellido,
        email: result.user.email,
        especialidad_id: result.doctor.especialidad_id
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login for patients and doctors
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ 
      where: { email },
      include: [
        { association: 'rol', attributes: ['nombre'] }
      ]
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }

    // Check if user is active
    if (user.estado !== 'activo') {
      return res.status(403).json({
        status: 'error',
        message: user.estado === 'pendiente' 
          ? 'Su cuenta está pendiente de aprobación por el administrador' 
          : 'Su cuenta está inactiva'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }

    // Get user details based on role
    let userDetails = null;
    
    if (user.rol.nombre === 'paciente') {
      userDetails = await Patient.findOne({ where: { usuario_id: user.id } });
    } else if (user.rol.nombre === 'medico') {
      userDetails = await Doctor.findOne({ 
        where: { usuario_id: user.id },
        include: [{ association: 'especialidad', attributes: ['nombre'] }]
      });
    }

    if (!userDetails) {
      return res.status(500).json({
        status: 'error',
        message: 'Error interno: Detalles de usuario no encontrados'
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      rol: user.rol.nombre,
      isAdmin: false
    });

    // Update last login
    user.ultima_actualizacion = new Date();
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Inicio de sesión exitoso',
      data: {
        id: user.id,
        email: user.email,
        rol: user.rol.nombre,
        nombre: userDetails.nombre,
        apellido: userDetails.apellido,
        foto_url: userDetails.foto_url,
        especialidad: user.rol.nombre === 'medico' ? userDetails.especialidad.nombre : undefined,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin login
 */
const adminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find admin by username
    const admin = await Admin.findOne({ where: { username } });

    // Check if admin exists
    if (!admin) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Credenciales inválidas'
      });
    }

    // Generate JWT token for first auth phase
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      isAdmin: true,
      isSecondAuth: false
    });

    // Update last login
    admin.ultima_sesion = new Date();
    await admin.save();

    return res.status(200).json({
      status: 'success',
      message: 'Primera fase de autenticación exitosa',
      data: {
        token,
        requiresSecondAuth: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin second auth
 */
const adminSecondAuth = async (req, res, next) => {
  try {
    // Get admin ID from JWT token
    const adminId = req.user.id;
    
    // No file uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Debe subir el archivo de autenticación secundaria'
      });
    }

    // Get file content
    const filePath = req.file.path;
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Delete the temporary file
    fs.unlinkSync(filePath);

    // Find admin
    const admin = await Admin.findByPk(adminId);

    // Verify second password
    const isSecondAuthValid = await comparePassword(fileContent, admin.auth2_password);
    if (!isSecondAuthValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Segunda autenticación fallida'
      });
    }

    // Generate new JWT token with full access
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      isAdmin: true,
      isSecondAuth: true
    });

    return res.status(200).json({
      status: 'success',
      message: 'Autenticación completa exitosa',
      data: {
        id: admin.id,
        username: admin.username,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerPatient,
  registerDoctor,
  login,
  adminLogin,
  adminSecondAuth
};