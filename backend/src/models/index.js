const { Role, initRoles } = require('./role.model');
const { User } = require('./user.model');
const { Patient } = require('./patient.model');
const { Doctor } = require('./doctor.model');
const { Admin, initAdmin } = require('./admin.model');
const { Specialty, initSpecialties } = require('./specialty.model');
const { Schedule } = require('./schedule.model');
const { AppointmentStatus, initAppointmentStatuses } = require('./appointment-status.model');
const { Appointment } = require('./appointment.model');

// Establish relationships between models

// User - Role relationship
User.belongsTo(Role, { foreignKey: 'rol_id', as: 'rol' });
Role.hasMany(User, { foreignKey: 'rol_id', as: 'usuarios' });

// User - Patient relationship
User.hasOne(Patient, { foreignKey: 'usuario_id', as: 'paciente', onDelete: 'CASCADE' });
Patient.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario', onDelete: 'CASCADE' });

// User - Doctor relationship
User.hasOne(Doctor, { foreignKey: 'usuario_id', as: 'medico', onDelete: 'CASCADE' });
Doctor.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario', onDelete: 'CASCADE' });

// Doctor - Specialty relationship
Doctor.belongsTo(Specialty, { foreignKey: 'especialidad_id', as: 'especialidad' });
Specialty.hasMany(Doctor, { foreignKey: 'especialidad_id', as: 'medicos' });

// Doctor - Schedule relationship
Doctor.hasMany(Schedule, { foreignKey: 'medico_id', as: 'horarios', onDelete: 'CASCADE' });
Schedule.belongsTo(Doctor, { foreignKey: 'medico_id', as: 'medico', onDelete: 'CASCADE' });

// Appointment - Patient relationship
Appointment.belongsTo(Patient, { foreignKey: 'paciente_id', as: 'paciente', onDelete: 'CASCADE' });
Patient.hasMany(Appointment, { foreignKey: 'paciente_id', as: 'citas', onDelete: 'CASCADE' });

// Appointment - Doctor relationship
Appointment.belongsTo(Doctor, { foreignKey: 'medico_id', as: 'medico', onDelete: 'CASCADE' });
Doctor.hasMany(Appointment, { foreignKey: 'medico_id', as: 'citas', onDelete: 'CASCADE' });

// Appointment - AppointmentStatus relationship
Appointment.belongsTo(AppointmentStatus, { foreignKey: 'estado_id', as: 'estado' });
AppointmentStatus.hasMany(Appointment, { foreignKey: 'estado_id', as: 'citas' });

// Initialize default data
const initializeData = async () => {
  await initRoles();
  await initSpecialties();
  await initAppointmentStatuses();
  await initAdmin();
};

module.exports = {
  Role,
  User,
  Patient,
  Doctor,
  Admin,
  Specialty,
  Schedule,
  AppointmentStatus,
  Appointment,
  initializeData
};