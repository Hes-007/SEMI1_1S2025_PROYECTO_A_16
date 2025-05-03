const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Specialty = sequelize.define('Specialty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'especialidades',
  timestamps: false
});

// Create default specialties if they don't exist
const initSpecialties = async () => {
  try {
    const count = await Specialty.count();
    
    if (count === 0) {
      await Specialty.bulkCreate([
        { nombre: 'Medicina General', descripcion: 'Atención médica básica y preventiva' },
        { nombre: 'Pediatría', descripcion: 'Especialidad médica enfocada en la salud de niños y adolescentes' },
        { nombre: 'Cardiología', descripcion: 'Especialidad médica que trata problemas del corazón' },
        { nombre: 'Dermatología', descripcion: 'Especialidad enfocada en el diagnóstico y tratamiento de enfermedades de la piel' },
        { nombre: 'Ginecología', descripcion: 'Especialidad médica relacionada con la salud del sistema reproductor femenino' },
        { nombre: 'Oftalmología', descripcion: 'Especialidad enfocada en el diagnóstico y tratamiento de problemas oculares' },
        { nombre: 'Traumatología', descripcion: 'Especialidad que trata lesiones traumáticas del sistema músculoesquelético' },
        { nombre: 'Psiquiatría', descripcion: 'Especialidad médica dedicada al estudio y tratamiento de enfermedades mentales' }
      ]);
      console.log('Default specialties created successfully');
    }
  } catch (error) {
    console.error('Error initializing specialties:', error);
  }
};

module.exports = { Specialty, initSpecialties };