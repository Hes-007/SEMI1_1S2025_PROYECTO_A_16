const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  paciente_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  medico_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isAfterToday(value) {
        const today = new Date().toISOString().split('T')[0];
        if (value < today) {
          throw new Error('La fecha de la cita debe ser desde hoy en adelante');
        }
      }
    }
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: false
  },
  motivo: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  tratamiento: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  estado_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'citas',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['medico_id', 'fecha', 'hora']
    }
  ],
  hooks: {
    beforeUpdate: (appointment) => {
      appointment.fecha_actualizacion = new Date();
    }
  }
});

module.exports = { Appointment };