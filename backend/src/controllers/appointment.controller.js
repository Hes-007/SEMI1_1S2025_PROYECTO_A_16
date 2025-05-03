const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Appointment } = require('../models/appointment.model');
const { Patient } = require('../models/patient.model');
const { Doctor } = require('../models/doctor.model');
const { AppointmentStatus } = require('../models/appointment-status.model');
const { Specialty } = require('../models/specialty.model');
const { User } = require('../models/user.model');

/**
 * Get appointment details by ID
 */
const getAppointmentById = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const userId = req.user.id;

    // Find appointment with details
    const appointment = await Appointment.findByPk(appointment_id, {
      include: [
        {
          association: 'paciente',
          attributes: ['id', 'nombre', 'apellido', 'dpi', 'telefono', 'foto_url'],
          include: [
            { association: 'usuario', attributes: ['email'] }
          ]
        },
        {
          association: 'medico',
          attributes: ['id', 'nombre', 'apellido', 'direccion_clinica', 'telefono', 'foto_url', 'especialidad_id'],
          include: [
            { association: 'especialidad', attributes: ['nombre'] },
            { association: 'usuario', attributes: ['email'] }
          ]
        },
        { association: 'estado', attributes: ['nombre', 'descripcion'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Cita no encontrada'
      });
    }

    // Check if user has permission to view this appointment
    // If patient, must be their appointment
    // If doctor, must be a appointment they're assigned to
    // If admin, allow access
    
    if (!req.user.isAdmin) {
      // Check if patient
      const patient = await Patient.findOne({ where: { usuario_id: userId } });
      if (patient && appointment.paciente_id !== patient.id) {
        return res.status(403).json({
          status: 'error',
          message: 'No tiene permiso para ver esta cita'
        });
      }

      // Check if doctor
      const doctor = await Doctor.findOne({ where: { usuario_id: userId } });
      if (doctor && appointment.medico_id !== doctor.id) {
        return res.status(403).json({
          status: 'error',
          message: 'No tiene permiso para ver esta cita'
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: appointment.id,
        fecha: appointment.fecha,
        hora: appointment.hora,
        motivo: appointment.motivo,
        tratamiento: appointment.tratamiento,
        estado: appointment.estado.nombre,
        paciente: {
          id: appointment.paciente.id,
          nombre: appointment.paciente.nombre,
          apellido: appointment.paciente.apellido,
          nombre_completo: `${appointment.paciente.nombre} ${appointment.paciente.apellido}`,
          dpi: appointment.paciente.dpi,
          telefono: appointment.paciente.telefono,
          email: appointment.paciente.usuario?.email,
          foto_url: appointment.paciente.foto_url
        },
        medico: {
          id: appointment.medico.id,
          nombre: appointment.medico.nombre,
          apellido: appointment.medico.apellido,
          nombre_completo: `${appointment.medico.nombre} ${appointment.medico.apellido}`,
          direccion_clinica: appointment.medico.direccion_clinica,
          telefono: appointment.medico.telefono,
          especialidad: appointment.medico.especialidad.nombre,
          email: appointment.medico.usuario?.email,
          foto_url: appointment.medico.foto_url
        },
        fecha_creacion: appointment.fecha_creacion,
        fecha_actualizacion: appointment.fecha_actualizacion
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointments statistics
 */
const getAppointmentsStats = async (req, res, next) => {
  try {
    // Get appointment status counts
    const statusCounts = await Appointment.findAll({
      attributes: [
        'estado_id',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      include: [
        { association: 'estado', attributes: ['nombre'] }
      ],
      group: ['estado_id', 'estado.id'],
      raw: true
    });

    // Get counts by month
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    
    const appointmentsByMonth = await Appointment.findAll({
      attributes: [
        [sequelize.fn('date_trunc', 'month', sequelize.col('fecha')), 'month'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        fecha: {
          [Op.gte]: startDate
        }
      },
      group: ['month'],
      order: [[sequelize.fn('date_trunc', 'month', sequelize.col('fecha')), 'ASC']],
      raw: true
    });

    // Get today's appointments
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaysAppointments = await Appointment.count({
      where: {
        fecha: {
          [Op.eq]: today.toISOString().split('T')[0]
        }
      }
    });

    // Get pending appointments
    const pendingStatus = await AppointmentStatus.findOne({
      where: { nombre: 'pendiente' }
    });
    
    const pendingAppointments = await Appointment.count({
      where: {
        estado_id: pendingStatus.id
      }
    });

    return res.status(200).json({
      status: 'success',
      data: {
        statusCounts: statusCounts.map(status => ({
          estado: status['estado.nombre'],
          count: parseInt(status.count)
        })),
        appointmentsByMonth: appointmentsByMonth.map(item => ({
          month: item.month,
          count: parseInt(item.count)
        })),
        todaysAppointments,
        pendingAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAppointmentById,
  getAppointmentsStats
};