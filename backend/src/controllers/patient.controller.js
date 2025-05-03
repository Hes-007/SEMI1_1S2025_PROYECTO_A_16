const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const { Doctor } = require('../models/doctor.model');
const { Patient } = require('../models/patient.model');
const { Specialty } = require('../models/specialty.model');
const { Schedule } = require('../models/schedule.model');
const { Appointment } = require('../models/appointment.model');
const { AppointmentStatus } = require('../models/appointment-status.model');
const { User } = require('../models/user.model');

/**
 * Get all available doctors (not associated with current patient)
 */
const getAllDoctors = async (req, res, next) => {
  try {
    const patientId = req.user.id;
    
    // Find patient from user ID
    const patient = await Patient.findOne({ where: { usuario_id: patientId } });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    // Find doctors that don't have active appointments with this patient
    const activeAppointmentStatusIds = await AppointmentStatus.findAll({ 
      where: { nombre: 'pendiente' },
      attributes: ['id']
    });
    
    const activeStatusIds = activeAppointmentStatusIds.map(status => status.id);
    
    // Find doctors with active appointments with this patient
    const doctorsWithAppointments = await Appointment.findAll({
      where: {
        paciente_id: patient.id,
        estado_id: activeStatusIds
      },
      attributes: ['medico_id']
    });
    
    const excludedDoctorIds = doctorsWithAppointments.map(appt => appt.medico_id);

    // Get all doctors except those with active appointments
    const doctors = await Doctor.findAll({
      where: excludedDoctorIds.length > 0 ? { id: { [Op.notIn]: excludedDoctorIds } } : {},
      include: [
        { 
          association: 'usuario', 
          attributes: [],
          where: { estado: 'activo' } 
        },
        { 
          association: 'especialidad', 
          attributes: ['nombre'] 
        }
      ],
      attributes: [
        'id', 
        'nombre', 
        'apellido', 
        'direccion_clinica', 
        'foto_url',
        'especialidad_id'
      ]
    });

    return res.status(200).json({
      status: 'success',
      data: doctors.map(doctor => ({
        id: doctor.id,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        nombre_completo: `${doctor.nombre} ${doctor.apellido}`,
        direccion_clinica: doctor.direccion_clinica,
        foto_url: doctor.foto_url,
        especialidad: doctor.especialidad.nombre,
        especialidad_id: doctor.especialidad_id
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search doctors by specialty
 */
const searchDoctorsBySpecialty = async (req, res, next) => {
  try {
    const { especialidad_id } = req.params;
    const patientId = req.user.id;
    
    // Find patient from user ID
    const patient = await Patient.findOne({ where: { usuario_id: patientId } });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    // Check if specialty exists
    const specialty = await Specialty.findByPk(especialidad_id);
    if (!specialty) {
      return res.status(404).json({
        status: 'error',
        message: 'Especialidad no encontrada'
      });
    }

    // Find doctors that don't have active appointments with this patient
    const activeAppointmentStatusIds = await AppointmentStatus.findAll({ 
      where: { nombre: 'pendiente' },
      attributes: ['id']
    });
    
    const activeStatusIds = activeAppointmentStatusIds.map(status => status.id);
    
    // Find doctors with active appointments with this patient
    const doctorsWithAppointments = await Appointment.findAll({
      where: {
        paciente_id: patient.id,
        estado_id: activeStatusIds
      },
      attributes: ['medico_id']
    });
    
    const excludedDoctorIds = doctorsWithAppointments.map(appt => appt.medico_id);

    // Get doctors by specialty except those with active appointments
    const doctors = await Doctor.findAll({
      where: {
        especialidad_id,
        ...(excludedDoctorIds.length > 0 ? { id: { [Op.notIn]: excludedDoctorIds } } : {})
      },
      include: [
        { 
          association: 'usuario', 
          attributes: [],
          where: { estado: 'activo' } 
        },
        { 
          association: 'especialidad', 
          attributes: ['nombre'] 
        }
      ],
      attributes: [
        'id', 
        'nombre', 
        'apellido', 
        'direccion_clinica', 
        'foto_url',
        'especialidad_id'
      ]
    });

    return res.status(200).json({
      status: 'success',
      data: doctors.map(doctor => ({
        id: doctor.id,
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        nombre_completo: `${doctor.nombre} ${doctor.apellido}`,
        direccion_clinica: doctor.direccion_clinica,
        foto_url: doctor.foto_url,
        especialidad: doctor.especialidad.nombre,
        especialidad_id: doctor.especialidad_id
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor's schedule
 */
const getDoctorSchedule = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;
    
    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctor_id, {
      include: [
        { association: 'usuario', attributes: ['estado'] },
        { association: 'especialidad', attributes: ['nombre'] }
      ]
    });
    
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }
    
    if (doctor.usuario.estado !== 'activo') {
      return res.status(403).json({
        status: 'error',
        message: 'El médico no se encuentra activo en el sistema'
      });
    }

    // Get doctor's schedule
    const schedules = await Schedule.findAll({
      where: { medico_id: doctor_id },
      order: [['dia_semana', 'ASC']]
    });

    // Get doctor's booked appointments
    const pendingStatusId = await AppointmentStatus.findOne({ 
      where: { nombre: 'pendiente' },
      attributes: ['id']
    });

    // Convert schedule to more readable format
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    const formattedSchedule = schedules.map(schedule => ({
      id: schedule.id,
      dia_semana: schedule.dia_semana,
      dia_nombre: daysOfWeek[schedule.dia_semana],
      hora_inicio: schedule.hora_inicio,
      hora_fin: schedule.hora_fin
    }));

    return res.status(200).json({
      status: 'success',
      data: {
        doctor: {
          id: doctor.id,
          nombre: doctor.nombre,
          apellido: doctor.apellido,
          nombre_completo: `${doctor.nombre} ${doctor.apellido}`,
          direccion_clinica: doctor.direccion_clinica,
          foto_url: doctor.foto_url,
          especialidad: doctor.especialidad.nombre
        },
        horarios: formattedSchedule
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get doctor's available slots for a specific date
 */
const getDoctorAvailability = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;
    const { fecha } = req.query;
    
    if (!fecha) {
      return res.status(400).json({
        status: 'error',
        message: 'La fecha es requerida'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    if (!dateRegex.test(fecha)) {
      return res.status(400).json({
        status: 'error',
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    // Check if date is in the past
    const [year, month, day] = fecha.split('-');
    const selectedDate = new Date(`${year}-${month}-${day}T12:00:00`);
    const dayOfWeek = selectedDate.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        status: 'error',
        message: 'No se pueden consultar fechas pasadas'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Check if doctor works on this day
    const schedule = await Schedule.findOne({
      where: { medico_id: doctor_id, dia_semana: dayOfWeek }
    });

    if (!schedule) {
      return res.status(200).json({
        status: 'success',
        message: 'El médico no atiende este día',
        data: {
          fecha,
          dia_semana: dayOfWeek,
          atiende: false,
          horarios_disponibles: []
        }
      });
    }

    // Get pending status ID
    const pendingStatus = await AppointmentStatus.findOne({
      where: { nombre: 'pendiente' }
    });

    // Get booked appointments for this date
    const bookedAppointments = await Appointment.findAll({
      where: {
        medico_id: doctor_id,
        fecha,
        estado_id: pendingStatus.id
      },
      attributes: ['hora'],
      raw: true
    });

    // Extract booked times
    const bookedTimes = bookedAppointments.map(appointment => appointment.hora);

    // Generate available time slots (30 min intervals)
    const startTime = new Date(`1970-01-01T${schedule.hora_inicio}`);
    const endTime = new Date(`1970-01-01T${schedule.hora_fin}`);
    
    const availableSlots = [];
    let currentTime = new Date(startTime);
    
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      
      // Check if this time is already booked
      const isBooked = bookedTimes.some(bookedTime => {
        return bookedTime.slice(0, 5) === timeString;
      });
      
      if (!isBooked) {
        availableSlots.push(timeString);
      }
      
      // Add 30 minutes
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    return res.status(200).json({
      status: 'success',
      data: {
        fecha,
        dia_semana: dayOfWeek,
        atiende: true,
        horario: {
          hora_inicio: schedule.hora_inicio,
          hora_fin: schedule.hora_fin
        },
        horarios_disponibles: availableSlots,
        horarios_ocupados: bookedTimes.map(time => time.slice(0, 5))
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new appointment
 */
const createAppointment = async (req, res, next) => {
  try {
    const { medico_id, fecha, hora, motivo } = req.body;
    const doctor_id = medico_id;
    const userId = req.user.id;

    // Find patient from user ID
    const patient = await Patient.findOne({ where: { usuario_id: userId } });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({
        status: 'error',
        message: 'Médico no encontrado'
      });
    }

    // Validate date format and ensure it's not in the past
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    if (!dateRegex.test(fecha)) {
      return res.status(400).json({
        status: 'error',
        message: 'Formato de fecha inválido. Use YYYY-MM-DD'
      });
    }

    const [year, month, day] = fecha.split('-');
    const selectedDate = new Date(`${year}-${month}-${day}T12:00:00`);
    const dayOfWeek = selectedDate.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        status: 'error',
        message: 'No se pueden agendar citas en fechas pasadas'
      });
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/; // HH:MM
    if (!timeRegex.test(hora)) {
      return res.status(400).json({
        status: 'error',
        message: 'Formato de hora inválido. Use HH:MM'
      });
    }

    // Check if doctor works on this day
    const schedule = await Schedule.findOne({
      where: { medico_id: doctor_id, dia_semana: dayOfWeek }
    });

    if (!schedule) {
      return res.status(400).json({
        status: 'error',
        message: 'El médico no atiende este día'
      });
    }

    // Check if the requested time is within doctor's working hours
    const requestedTime = new Date(`1970-01-01T${hora}`);
    const startTime = new Date(`1970-01-01T${schedule.hora_inicio}`);
    const endTime = new Date(`1970-01-01T${schedule.hora_fin}`);
    
    if (requestedTime < startTime || requestedTime >= endTime) {
      return res.status(400).json({
        status: 'error',
        message: `El horario seleccionado está fuera del horario de atención del médico (${schedule.hora_inicio} - ${schedule.hora_fin})`
      });
    }

    // Check if the time slot is already booked
    const pendingStatus = await AppointmentStatus.findOne({
      where: { nombre: 'pendiente' }
    });

    const existingAppointment = await Appointment.findOne({
      where: {
        medico_id: doctor_id,
        fecha,
        hora,
        estado_id: pendingStatus.id
      }
    });

    if (existingAppointment) {
      return res.status(400).json({
        status: 'error',
        message: 'El horario seleccionado ya está ocupado'
      });
    }

    // Check if patient already has an active appointment with this doctor
    const existingPatientAppointment = await Appointment.findOne({
      where: {
        paciente_id: patient.id,
        medico_id: doctor_id,
        estado_id: pendingStatus.id
      }
    });

    if (existingPatientAppointment) {
      return res.status(400).json({
        status: 'error',
        message: 'Ya tiene una cita activa con este médico'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      paciente_id: patient.id,
      medico_id: doctor_id,
      fecha,
      hora,
      motivo,
      estado_id: pendingStatus.id
    });

    return res.status(201).json({
      status: 'success',
      message: 'Cita agendada exitosamente',
      data: {
        id: appointment.id,
        fecha,
        hora,
        motivo,
        doctor: {
          id: doctor.id,
          nombre: doctor.nombre,
          apellido: doctor.apellido,
          nombre_completo: `${doctor.nombre} ${doctor.apellido}`
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active appointments for logged in patient
 */
const getActiveAppointments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find patient from user ID
    const patient = await Patient.findOne({ where: { usuario_id: userId } });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    // Get pending status
    const pendingStatus = await AppointmentStatus.findOne({
      where: { nombre: 'pendiente' }
    });

    // Get active appointments
    const appointments = await Appointment.findAll({
      where: {
        paciente_id: patient.id,
        estado_id: pendingStatus.id
      },
      include: [
        {
          association: 'medico',
          attributes: ['nombre', 'apellido', 'direccion_clinica', 'foto_url'],
          include: [
            { association: 'especialidad', attributes: ['nombre'] }
          ]
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
        medico: {
          id: appointment.medico.id,
          nombre: appointment.medico.nombre,
          apellido: appointment.medico.apellido,
          nombre_completo: `${appointment.medico.nombre} ${appointment.medico.apellido}`,
          direccion_clinica: appointment.medico.direccion_clinica,
          especialidad: appointment.medico.especialidad.nombre,
          foto_url: appointment.medico.foto_url
        }
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel an appointment
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const userId = req.user.id;

    // Find patient from user ID
    const patient = await Patient.findOne({ where: { usuario_id: userId } });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    // Find appointment
    const appointment = await Appointment.findOne({
      where: {
        id: appointment_id,
        paciente_id: patient.id
      },
      include: [
        { association: 'estado', attributes: ['nombre'] }
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

    // Get cancelled by patient status
    const cancelledStatus = await AppointmentStatus.findOne({
      where: { nombre: 'cancelada_paciente' }
    });

    // Update appointment directly in the database using a raw query instead of the model
    await sequelize.query(`
      UPDATE saludplus.citas 
      SET estado_id = :cancelledStatusId, fecha_actualizacion = NOW() 
      WHERE id = :appointmentId
    `, {
      replacements: { 
        cancelledStatusId: cancelledStatus.id,
        appointmentId: appointment.id
      },
      type: sequelize.QueryTypes.UPDATE
    });

    return res.status(200).json({
      status: 'success',
      message: 'Cita cancelada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment history for logged in patient
 */
const getAppointmentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find patient from user ID
    const patient = await Patient.findOne({ where: { usuario_id: userId } });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    // Get pending status ID
    const pendingStatus = await AppointmentStatus.findOne({
      where: { nombre: 'pendiente' }
    });

    // Get appointment history (all except pending)
    const appointments = await Appointment.findAll({
      where: {
        paciente_id: patient.id,
        estado_id: { [Op.ne]: pendingStatus.id }
      },
      include: [
        {
          association: 'medico',
          attributes: ['nombre', 'apellido', 'direccion_clinica', 'foto_url'],
          include: [
            { association: 'especialidad', attributes: ['nombre'] }
          ]
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
        medico: {
          id: appointment.medico.id,
          nombre: appointment.medico.nombre,
          apellido: appointment.medico.apellido,
          nombre_completo: `${appointment.medico.nombre} ${appointment.medico.apellido}`,
          direccion_clinica: appointment.medico.direccion_clinica,
          especialidad: appointment.medico.especialidad.nombre,
          foto_url: appointment.medico.foto_url
        }
      }))
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get patient profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find patient with user details
    const patient = await Patient.findOne({
      where: { usuario_id: userId },
      include: [
        { association: 'usuario', attributes: ['email', 'fecha_registro'] }
      ]
    });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        id: patient.id,
        nombre: patient.nombre,
        apellido: patient.apellido,
        dpi: patient.dpi,
        genero: patient.genero,
        direccion: patient.direccion,
        telefono: patient.telefono,
        fecha_nacimiento: patient.fecha_nacimiento,
        foto_url: patient.foto_url,
        email: patient.usuario.email,
        fecha_registro: patient.usuario.fecha_registro
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update patient profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      nombre,
      apellido,
      genero,
      direccion,
      telefono,
      fecha_nacimiento,
      foto_url
    } = req.body;

    // Find patient
    const patient = await Patient.findOne({ where: { usuario_id: userId } });
    
    if (!patient) {
      return res.status(404).json({
        status: 'error',
        message: 'Paciente no encontrado'
      });
    }

    // Update patient data
    await patient.update({
      nombre: nombre || patient.nombre,
      apellido: apellido || patient.apellido,
      genero: genero || patient.genero,
      direccion: direccion || patient.direccion,
      telefono: telefono || patient.telefono,
      fecha_nacimiento: fecha_nacimiento || patient.fecha_nacimiento,
      foto_url: foto_url !== undefined ? foto_url : patient.foto_url
    });

    return res.status(200).json({
      status: 'success',
      message: 'Perfil actualizado exitosamente',
      data: {
        id: patient.id,
        nombre: patient.nombre,
        apellido: patient.apellido,
        genero: patient.genero,
        direccion: patient.direccion,
        telefono: patient.telefono,
        fecha_nacimiento: patient.fecha_nacimiento,
        foto_url: patient.foto_url
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};