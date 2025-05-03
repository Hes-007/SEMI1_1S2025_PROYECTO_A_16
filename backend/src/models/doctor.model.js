const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Doctor = sequelize.define('Doctor', {
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
  direccion_clinica: {
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
  numero_colegiado: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  especialidad_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  foto_url: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'medicos',
  timestamps: false
});

module.exports = { Doctor };