const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  medico_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dia_semana: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,  // 0: Sunday
      max: 6   // 6: Saturday
    }
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false
  }
}, {
  tableName: 'horarios_medicos',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['medico_id', 'dia_semana']
    }
  ],
  validate: {
    timeIsValid() {
      // Convert time strings to Date objects for comparison
      const startTime = new Date(`1970-01-01T${this.hora_inicio}`);
      const endTime = new Date(`1970-01-01T${this.hora_fin}`);
      
      if (startTime >= endTime) {
        throw new Error('End time must be greater than start time');
      }
    }
  }
});

module.exports = { Schedule };