const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AppointmentStatus = sequelize.define('AppointmentStatus', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'estados_citas',
  timestamps: false
});

// Initialize appointment statuses if they don't exist
const initAppointmentStatuses = async () => {
  try {
    const count = await AppointmentStatus.count();
    
    if (count === 0) {
      await AppointmentStatus.bulkCreate([
        { nombre: 'pendiente', descripcion: 'Cita programada pero aún no atendida' },
        { nombre: 'atendida', descripcion: 'Cita que ya fue atendida por el médico' },
        { nombre: 'cancelada_paciente', descripcion: 'Cita cancelada por el paciente' },
        { nombre: 'cancelada_medico', descripcion: 'Cita cancelada por el médico' }
      ]);
      console.log('Default appointment statuses created successfully');
    }
  } catch (error) {
    console.error('Error initializing appointment statuses:', error);
  }
};

module.exports = { AppointmentStatus, initAppointmentStatuses };