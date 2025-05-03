const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Doctor } = require('../models/doctor.model');
const { Patient } = require('../models/patient.model');
const { Schedule } = require('../models/schedule.model');
const { Appointment } = require('../models/appointment.model');
const { AppointmentStatus } = require('../models/appointment-status.model');
const { User } = require('../models/user.model');
const { sendCancellationEmail } = require('../utils/mailer');

/**
 * Get all pending appointments for the logged in doctor
 */
const getPendingAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find doctor from user ID
    const doctor = await Doctor.findOne({ where: { usuario_id: userId } });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Get pending status
    const pendingStatus = await AppointmentStatus.findOne({
      where: { nombre: 'pendiente' }
    });

    // Get active appointments
    const appointments = await Appointment.findAll({
      where: {
        medico_id: doctor.id,
        estado_id: pendingStatus.id
      },
      include: [
        {
          association: 'paciente',
          attributes: ['nombre', 'apellido', 'foto_url', 'telefono']
        }
      ],
      order: [['fecha', 'ASC'], ['hora', 'ASC']]
    });

    return res.status(200).json({
      status: 'success',
      data: appointments.map(appointment => ({
        id: appointment.id,
        fecha: appointment.fecha,
        hora: appointment.hora,
        motivo: appointment.motivo,
        paciente: {
          id: appointment.paciente.id,
          nombre: appointment.paciente.nombre,
          apellido: appointment.paciente.apellido,
          nombre_completo: `${appointment.paciente.nombre} ${appointment.paciente.apellido}`,
          foto_url: appointment.paciente.foto_url,
          telefono: appointment.paciente.telefono
        }
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Attend a patient appointment (mark as attended and add treatment)
 */
const attendAppointment = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const { tratamiento } = req.body;
    const userId = req.user.id;

    // Find doctor from user ID
    const doctor = await Doctor.findOne({ where: { usuario_id: userId } });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Find appointment
    const appointment = await Appointment.findOne({
      where: {
        id: appointment_id,
        medico_id: doctor.id
      },
      include: [
        { association: 'estado', attributes: ['nombre'] },
        { association: 'paciente', attributes: ['nombre', 'apellido'] }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Cita no encontrada'
      });
    }

    // Check if appointment is already cancelled or attended
    if (appointment.estado.nombre !== 'pendiente') {
      return res.status(400).json({
        status: 'error',
        message: `No se puede atender la cita porque su estado actual es: ${appointment.estado.nombre}`
      });
    }

    // Validate treatment
    if (!tratamiento || tratamiento.trim().length < 10) {
      return res.status(400).json({
        status: 'error',
        message: 'El tratamiento debe tener al menos 10 caracteres'
      });
    }

    // Get attended status
    const attendedStatus = await AppointmentStatus.findOne({
      where: { nombre: 'atendida' }
    });

    // Update appointment status and treatment
    await appointment.update({
      estado_id: attendedStatus.id,
      tratamiento,
      fecha_actualizacion: new Date()
    });

    return res.status(200).json({
      status: 'success',
      message: 'Cita marcada como atendida exitosamente',
      data: {
        id: appointment.id,
        paciente: `${appointment.paciente.nombre} ${appointment.paciente.apellido}`,
        fecha: appointment.fecha,
        hora: appointment.hora,
        tratamiento
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel patient appointment by doctor
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const userId = req.user.id;

    // Find doctor from user ID
    const doctor = await Doctor.findOne({ 
      where: { usuario_id: userId },
      include: [{ association: 'usuario', attributes: ['email'] }]
    });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Find appointment
    const appointment = await Appointment.findOne({
      where: {
        id: appointment_id,
        medico_id: doctor.id
      },
      include: [
        { association: 'estado', attributes: ['nombre'] },
        { 
          association: 'paciente', 
          attributes: ['nombre', 'apellido'],
          include: [{ association: 'usuario', attributes: ['email'] }]
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        status: 'error',
        message: 'Cita no encontrada'
      });
    }

    // Check if appointment is already cancelled or attended
    if (appointment.estado.nombre !== 'pendiente') {
      return res.status(400).json({
        status: 'error',
        message: `No se puede cancelar la cita porque su estado actual es: ${appointment.estado.nombre}`
      });
    }

    // Get cancelled by doctor status
    const cancelledStatus = await AppointmentStatus.findOne({
      where: { nombre: 'cancelada_medico' }
    });

    // Start a transaction
    const result = await sequelize.transaction(async (t) => {
      // Update appointment status
      await appointment.update({
        estado_id: cancelledStatus.id,
        fecha_actualizacion: new Date()
      }, { transaction: t });

      // Send email notification to patient
      if (appointment.paciente.usuario && appointment.paciente.usuario.email) {
        // Format date and time for email
        const dateObj = new Date(appointment.fecha);
        const formattedDate = dateObj.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        const timeObj = new Date(`1970-01-01T${appointment.hora}`);
        const formattedTime = timeObj.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit'
        });

        // Send cancellation email
        await sendCancellationEmail({
          to: appointment.paciente.usuario.email,
          patientName: `${appointment.paciente.nombre} ${appointment.paciente.apellido}`,
          doctorName: `Dr. ${doctor.nombre} ${doctor.apellido}`,
          date: formattedDate,
          time: formattedTime,
          reason: appointment.motivo
        });
      }

      return appointment;
    });

    return res.status(200).json({
      status: 'success',
      message: 'Cita cancelada exitosamente',
      data: {
        id: result.id,
        paciente: `${result.paciente.nombre} ${result.paciente.apellido}`,
        fecha: result.fecha,
        hora: result.hora,
        emailEnviado: !!result.paciente.usuario?.email
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor's appointment history
 */
const getAppointmentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find doctor from user ID
    const doctor = await Doctor.findOne({ where: { usuario_id: userId } });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Get pending status ID
    const pendingStatus = await AppointmentStatus.findOne({
      where: { nombre: 'pendiente' }
    });

    // Get appointment history (all except pending)
    const appointments = await Appointment.findAll({
      where: {
        medico_id: doctor.id,
        estado_id: { [Op.ne]: pendingStatus.id }
      },
      include: [
        {
          association: 'paciente',
          attributes: ['nombre', 'apellido', 'foto_url']
        },
        { association: 'estado', attributes: ['nombre'] }
      ],
      order: [['fecha', 'DESC'], ['hora', 'DESC']]
    });

    return res.status(200).json({
      status: 'success',
      data: appointments.map(appointment => ({
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
          foto_url: appointment.paciente.foto_url
        }
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set or update doctor's schedule
 */
const setSchedule = async (req, res, next) => {
  try {
    const { horarios } = req.body;
    const userId = req.user.id;

    // Find doctor from user ID
    const doctor = await Doctor.findOne({ where: { usuario_id: userId } });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Validate schedule input
    if (!horarios || !Array.isArray(horarios) || horarios.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Debe proporcionar al menos un horario'
      });
    }

    // Validate each schedule item
    for (const horario of horarios) {
      if (
        !Number.isInteger(horario.dia_semana) || 
        horario.dia_semana < 0 || 
        horario.dia_semana > 6 ||
        !horario.hora_inicio ||
        !horario.hora_fin
      ) {
        return res.status(400).json({
          status: 'error',
          message: 'Formato de horario inválido. Debe incluir dia_semana (0-6), hora_inicio y hora_fin'
        });
      }

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(horario.hora_inicio) || !timeRegex.test(horario.hora_fin)) {
        return res.status(400).json({
          status: 'error',
          message: 'Formato de hora inválido. Use HH:MM'
        });
      }

      // Validate start time before end time
      const startTime = new Date(`1970-01-01T${horario.hora_inicio}`);
      const endTime = new Date(`1970-01-01T${horario.hora_fin}`);
      
      if (startTime >= endTime) {
        return res.status(400).json({
          status: 'error',
          message: 'La hora de inicio debe ser anterior a la hora de fin'
        });
      }
    }

    // Save schedules with transaction
    await sequelize.transaction(async (t) => {
      // Delete existing schedules
      await Schedule.destroy({
        where: { medico_id: doctor.id },
        transaction: t
      });
      
      // Create new schedules
      const scheduleData = horarios.map(horario => ({
        medico_id: doctor.id,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin
      }));
      
      await Schedule.bulkCreate(scheduleData, { transaction: t });
    });

    // Fetch updated schedules
    const updatedSchedules = await Schedule.findAll({
      where: { medico_id: doctor.id },
      order: [['dia_semana', 'ASC']]
    });

    // Convert schedule to more readable format
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    const formattedSchedules = updatedSchedules.map(schedule => ({
      id: schedule.id,
      dia_semana: schedule.dia_semana,
      dia_nombre: daysOfWeek[schedule.dia_semana],
      hora_inicio: schedule.hora_inicio,
      hora_fin: schedule.hora_fin
    }));

    return res.status(200).json({
      status: 'success',
      message: 'Horarios actualizados exitosamente',
      data: formattedSchedules
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor's current schedule
 */
const getSchedule = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find doctor from user ID
    const doctor = await Doctor.findOne({ where: { usuario_id: userId } });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Get doctor's schedule
    const schedules = await Schedule.findAll({
      where: { medico_id: doctor.id },
      order: [['dia_semana', 'ASC']]
    });

    // Convert schedule to more readable format
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    const formattedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      dia_semana: schedule.dia_semana,
      dia_nombre: daysOfWeek[schedule.dia_semana],
      hora_inicio: schedule.hora_inicio,
      hora_fin: schedule.hora_fin
    }));

    return res.status(200).json({
      status: 'success',
      data: formattedSchedules
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find doctor with user details
    const doctor = await Doctor.findOne({
      where: { usuario_id: userId },
      include: [
        { association: 'usuario', attributes: ['email', 'fecha_registro'] },
        { association: 'especialidad', attributes: ['nombre'] }
      ]
    });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: doctor.id,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        dpi: doctor.dpi,
        genero: doctor.genero,
        direccion: doctor.direccion,
        direccion_clinica: doctor.direccion_clinica,
        telefono: doctor.telefono,
        fecha_nacimiento: doctor.fecha_nacimiento,
        numero_colegiado: doctor.numero_colegiado,
        especialidad: {
          id: doctor.especialidad_id,
          nombre: doctor.especialidad.nombre
        },
        foto_url: doctor.foto_url,
        email: doctor.usuario.email,
        fecha_registro: doctor.usuario.fecha_registro
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update doctor profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      nombre,
      apellido,
      genero,
      direccion,
      direccion_clinica,
      telefono,
      foto_url
    } = req.body;

    // Find doctor
    const doctor = await Doctor.findOne({ 
      where: { usuario_id: userId },
      include: [{ association: 'especialidad', attributes: ['nombre'] }]
    });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Update doctor data
    await doctor.update({
      nombre: nombre || doctor.nombre,
      apellido: apellido || doctor.apellido,
      genero: genero || doctor.genero,
      direccion: direccion || doctor.direccion,
      direccion_clinica: direccion_clinica || doctor.direccion_clinica,
      telefono: telefono || doctor.telefono,
      foto_url: foto_url || doctor.foto_url
    });

    return res.status(200).json({
      status: 'success',
      message: 'Perfil actualizado exitosamente',
      data: {
        id: doctor.id,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        genero: doctor.genero,
        direccion: doctor.direccion,
        direccion_clinica: doctor.direccion_clinica,
        telefono: doctor.telefono,
        especialidad: {
          id: doctor.especialidad_id,
          nombre: doctor.especialidad.nombre
        },
        foto_url: doctor.foto_url
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingAppointments,
  attendAppointment,
  cancelAppointment,
  getAppointmentHistory,
  setSchedule,
  getSchedule,
  getProfile,
  updateProfile
};