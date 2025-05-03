const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('../models/user.model');
const { Patient } = require('../models/patient.model');
const { Doctor } = require('../models/doctor.model');
const { Specialty } = require('../models/specialty.model');
const { Appointment } = require('../models/appointment.model');
const { AppointmentStatus } = require('../models/appointment-status.model');
const { Role } = require('../models/role.model');

/**
 * Get pending patient registrations
 */
const getPendingPatients = async (req, res, next) => {
  try {
    // Get patient role ID
    const patientRole = await Role.findOne({
      where: { nombre: 'paciente' }
    });

    if (!patientRole) {
      return res.status(500).json({
        status: 'error',
        message: 'Error interno: Rol de paciente no encontrado'
      });
    }

    // Get pending patients
    const pendingPatients = await Patient.findAll({
      include: [
        {
          association: 'usuario',
          where: { 
            estado: 'pendiente',
            rol_id: patientRole.id
          },
          attributes: ['email', 'fecha_registro']
        }
      ]
    });

    return res.status(200).json({
      status: 'success',
      data: pendingPatients.map(patient => ({
        id: patient.id,
        nombre: patient.nombre,
        apellido: patient.apellido,
        nombre_completo: `${patient.nombre} ${patient.apellido}`,
        dpi: patient.dpi,
        genero: patient.genero,
        fecha_nacimiento: patient.fecha_nacimiento,
        email: patient.usuario.email,
        fecha_registro: patient.usuario.fecha_registro,
        foto_url: patient.foto_url || null
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending doctor registrations
 */
const getPendingDoctors = async (req, res, next) => {
  try {
    // Get doctor role ID
    const doctorRole = await Role.findOne({
      where: { nombre: 'medico' }
    });

    if (!doctorRole) {
      return res.status(500).json({
        status: 'error',
        message: 'Error interno: Rol de médico no encontrado'
      });
    }

    // Get pending doctors
    const pendingDoctors = await Doctor.findAll({
      include: [
        {
          association: 'usuario',
          where: { 
            estado: 'pendiente',
            rol_id: doctorRole.id
          },
          attributes: ['email', 'fecha_registro']
        },
        {
          association: 'especialidad',
          attributes: ['nombre']
        }
      ]
    });

    return res.status(200).json({
      status: 'success',
      data: pendingDoctors.map(doctor => ({
        id: doctor.id,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        nombre_completo: `${doctor.nombre} ${doctor.apellido}`,
        dpi: doctor.dpi,
        genero: doctor.genero,
        especialidad: doctor.especialidad.nombre,
        numero_colegiado: doctor.numero_colegiado,
        email: doctor.usuario.email,
        fecha_registro: doctor.usuario.fecha_registro,
        foto_url: doctor.foto_url
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve patient registration
 */
const approvePatient = async (req, res, next) => {
  try {
    const { patient_id } = req.params;

    // Find patient
    const patient = await Patient.findByPk(patient_id, {
      include: [{ association: 'usuario' }]
    });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    // Check if patient is already approved
    if (patient.usuario.estado !== 'pendiente') {
      return res.status(400).json({
        status: 'error',
        message: `El paciente ya está ${patient.usuario.estado}`
      });
    }

    // Update user status
    await patient.usuario.update({ estado: 'activo' });

    return res.status(200).json({
      status: 'success',
      message: 'Paciente aprobado exitosamente',
      data: {
        id: patient.id,
        nombre: patient.nombre,
        apellido: patient.apellido,
        email: patient.usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve doctor registration
 */
const approveDoctor = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;

    // Find doctor
    const doctor = await Doctor.findByPk(doctor_id, {
      include: [{ association: 'usuario' }]
    });

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Check if doctor is already approved
    if (doctor.usuario.estado !== 'pendiente') {
      return res.status(400).json({
        status: 'error',
        message: `El médico ya está ${doctor.usuario.estado}`
      });
    }

    // Update user status
    await doctor.usuario.update({ estado: 'activo' });

    return res.status(200).json({
      status: 'success',
      message: 'Médico aprobado exitosamente',
      data: {
        id: doctor.id,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        email: doctor.usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject patient registration
 */
const rejectPatient = async (req, res, next) => {
  try {
    const { patient_id } = req.params;

    // Find patient
    const patient = await Patient.findByPk(patient_id, {
      include: [{ association: 'usuario' }]
    });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    // Check if patient is already approved or rejected
    if (patient.usuario.estado !== 'pendiente') {
      return res.status(400).json({
        status: 'error',
        message: `El paciente ya está ${patient.usuario.estado}`
      });
    }

    // Update user status
    await patient.usuario.update({ estado: 'inactivo' });

    return res.status(200).json({
      status: 'success',
      message: 'Paciente rechazado exitosamente',
      data: {
        id: patient.id,
        nombre: patient.nombre,
        apellido: patient.apellido,
        email: patient.usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject doctor registration
 */
const rejectDoctor = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;

    // Find doctor
    const doctor = await Doctor.findByPk(doctor_id, {
      include: [{ association: 'usuario' }]
    });

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Check if doctor is already approved or rejected
    if (doctor.usuario.estado !== 'pendiente') {
      return res.status(400).json({
        status: 'error',
        message: `El médico ya está ${doctor.usuario.estado}`
      });
    }

    // Update user status
    await doctor.usuario.update({ estado: 'inactivo' });

    return res.status(200).json({
      status: 'success',
      message: 'Médico rechazado exitosamente',
      data: {
        id: doctor.id,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        email: doctor.usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all active patients
 */
const getAllPatients = async (req, res, next) => {
  try {
    // Get patient role ID
    const patientRole = await Role.findOne({
      where: { nombre: 'paciente' }
    });

    if (!patientRole) {
      return res.status(500).json({
        status: 'error',
        message: 'Error interno: Rol de paciente no encontrado'
      });
    }

    // Get active patients
    const activePatients = await Patient.findAll({
      include: [
        {
          association: 'usuario',
          where: { 
            estado: 'activo',
            rol_id: patientRole.id
          },
          attributes: ['email', 'fecha_registro', 'estado']
        }
      ]
    });

    return res.status(200).json({
      status: 'success',
      data: activePatients.map(patient => ({
        id: patient.id,
        nombre: patient.nombre,
        apellido: patient.apellido,
        nombre_completo: `${patient.nombre} ${patient.apellido}`,
        dpi: patient.dpi,
        genero: patient.genero,
        fecha_nacimiento: patient.fecha_nacimiento,
        direccion: patient.direccion,
        telefono: patient.telefono,
        email: patient.usuario.email,
        fecha_registro: patient.usuario.fecha_registro,
        estado: patient.usuario.estado,
        foto_url: patient.foto_url || null
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all active doctors
 */
const getAllDoctors = async (req, res, next) => {
  try {
    // Get doctor role ID
    const doctorRole = await Role.findOne({
      where: { nombre: 'medico' }
    });

    if (!doctorRole) {
      return res.status(500).json({
        status: 'error',
        message: 'Error interno: Rol de médico no encontrado'
      });
    }

    // Get active doctors
    const activeDoctors = await Doctor.findAll({
      include: [
        {
          association: 'usuario',
          where: { 
            estado: 'activo',
            rol_id: doctorRole.id
          },
          attributes: ['email', 'fecha_registro', 'estado']
        },
        {
          association: 'especialidad',
          attributes: ['nombre']
        }
      ]
    });

    return res.status(200).json({
      status: 'success',
      data: activeDoctors.map(doctor => ({
        id: doctor.id,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        nombre_completo: `${doctor.nombre} ${doctor.apellido}`,
        dpi: doctor.dpi,
        genero: doctor.genero,
        direccion: doctor.direccion,
        direccion_clinica: doctor.direccion_clinica,
        telefono: doctor.telefono,
        especialidad: doctor.especialidad.nombre,
        especialidad_id: doctor.especialidad_id,
        numero_colegiado: doctor.numero_colegiado,
        email: doctor.usuario.email,
        fecha_registro: doctor.usuario.fecha_registro,
        estado: doctor.usuario.estado,
        foto_url: doctor.foto_url
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate a patient
 */
const deactivatePatient = async (req, res, next) => {
  try {
    const { patient_id } = req.params;

    // Find patient
    const patient = await Patient.findByPk(patient_id, {
      include: [{ association: 'usuario' }]
    });

    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    // Check if patient is already inactive
    if (patient.usuario.estado === 'inactivo') {
      return res.status(400).json({
        status: 'error',
        message: 'El paciente ya está inactivo'
      });
    }

    // Update user status
    await patient.usuario.update({ estado: 'inactivo' });

    return res.status(200).json({
      status: 'success',
      message: 'Paciente desactivado exitosamente',
      data: {
        id: patient.id,
        nombre: patient.nombre,
        apellido: patient.apellido,
        email: patient.usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deactivate a doctor
 */
const deactivateDoctor = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;

    // Find doctor
    const doctor = await Doctor.findByPk(doctor_id, {
      include: [{ association: 'usuario' }]
    });

    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Check if doctor is already inactive
    if (doctor.usuario.estado === 'inactivo') {
      return res.status(400).json({
        status: 'error',
        message: 'El médico ya está inactivo'
      });
    }

    // Update user status
    await doctor.usuario.update({ estado: 'inactivo' });

    return res.status(200).json({
      status: 'success',
      message: 'Médico desactivado exitosamente',
      data: {
        id: doctor.id,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        email: doctor.usuario.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate report: Doctors with most patients attended
 */
/**
 * Generate report: Doctors with most patients attended
 */
/**
 * Generate report: Doctors with most patients attended
 */
/**
 * Generate report: Doctors with most patients attended
 */
const getDoctorsWithMostPatients = async (req, res, next) => {
  try {
    // Get attended status
    const attendedStatus = await AppointmentStatus.findOne({
      where: { nombre: 'atendida' }
    });

    if (!attendedStatus) {
      return res.status(500).json({
        status: 'error',
        message: 'Error interno: Estado de cita atendida no encontrado'
      });
    }

    // Use a simpler raw query approach
    const results = await sequelize.query(`
      SELECT 
        d.id, 
        d.nombre, 
        d.apellido, 
        d.numero_colegiado,
        e.nombre as especialidad,
        COUNT(a.id) as total_pacientes_atendidos
      FROM saludplus.medicos d
      JOIN saludplus.usuarios u ON d.usuario_id = u.id
      JOIN saludplus.especialidades e ON d.especialidad_id = e.id
      LEFT JOIN saludplus.citas a ON d.id = a.medico_id AND a.estado_id = :estadoId
      WHERE u.estado = 'activo'
      GROUP BY d.id, d.nombre, d.apellido, d.numero_colegiado, e.nombre
      ORDER BY total_pacientes_atendidos DESC
      LIMIT 10
    `, {
      replacements: { estadoId: attendedStatus.id },
      type: sequelize.QueryTypes.SELECT
    });

    // Check if we have results
    const formattedResults = Array.isArray(results) ? results.map(doctor => ({
      id: doctor.id,
      nombre: doctor.nombre,
      apellido: doctor.apellido,
      nombre_completo: `${doctor.nombre} ${doctor.apellido}`,
      numero_colegiado: doctor.numero_colegiado,
      especialidad: doctor.especialidad,
      total_pacientes_atendidos: parseInt(doctor.total_pacientes_atendidos || 0)
    })) : [];

    return res.status(200).json({
      status: 'success',
      data: formattedResults
    });
  } catch (error) {
    console.error('Error generating doctors report:', error);
    next(error);
  }
};

/**
 * Generate report: Most popular specialties
 */
/**
 * Generate report: Most popular specialties
 */
const getMostPopularSpecialties = async (req, res, next) => {
  try {
    // Use a direct query approach for reliability
    const results = await sequelize.query(`
      SELECT 
        e.id,
        e.nombre,
        COUNT(a.id) as total_citas
      FROM saludplus.especialidades e
      LEFT JOIN saludplus.medicos d ON e.id = d.especialidad_id
      LEFT JOIN saludplus.usuarios u ON d.usuario_id = u.id
      LEFT JOIN saludplus.citas a ON d.id = a.medico_id
      WHERE u.estado = 'activo' OR u.estado IS NULL
      GROUP BY e.id, e.nombre
      ORDER BY total_citas DESC
    `, {
      type: sequelize.QueryTypes.SELECT
    });

    // Check if we have results
    const formattedResults = Array.isArray(results) ? results.map(specialty => ({
      id: specialty.id,
      nombre: specialty.nombre,
      total_citas: parseInt(specialty.total_citas || 0)
    })) : [];

    return res.status(200).json({
      status: 'success',
      data: formattedResults
    });
  } catch (error) {
    console.error('Error generating specialties report:', error);
    next(error);
  }
};
module.exports = {
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
};