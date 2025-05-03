const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Patient = sequelize.define('Patient', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  dpi: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: [13, 13],
      isNumeric: true
    }
  },
  genero: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: [['masculino', 'femenino', 'otro']]
    }
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isNumeric: true
    }
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    validate: {
      isDate: true,
      isBefore: new Date().toISOString().split('T')[0] // Cannot be in the future
    }
  },
  foto_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'pacientes',
  timestamps: false
});

module.exports = { Patient };