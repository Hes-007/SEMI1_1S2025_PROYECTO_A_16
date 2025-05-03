const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Role = sequelize.define('Role', {
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
  tableName: 'roles',
  timestamps: false
});

// Create default roles if they don't exist
const initRoles = async () => {
  try {
    const count = await Role.count();
    
    if (count === 0) {
      await Role.bulkCreate([
        { nombre: 'paciente', descripcion: 'Usuario que puede agendar citas con médicos' },
        { nombre: 'medico', descripcion: 'Usuario que puede atender pacientes' }
      ]);
      console.log('Default roles created successfully');
    }
  } catch (error) {
    console.error('Error initializing roles:', error);
  }
};

module.exports = { Role, initRoles };