const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { hashPassword } = require('../utils/password');

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  auth2_password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  ultima_sesion: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'administrador',
  timestamps: false,
  hooks: {
    beforeCreate: async (admin) => {
      admin.password = await hashPassword(admin.password);
      admin.auth2_password = await hashPassword(admin.auth2_password);
    },
    beforeUpdate: async (admin) => {
      if (admin.changed('password')) {
        admin.password = await hashPassword(admin.password);
      }
      if (admin.changed('auth2_password')) {
        admin.auth2_password = await hashPassword(admin.auth2_password);
      }
    }
  }
});

// Initialize admin account if it doesn't exist
const initAdmin = async () => {
  try {
    const count = await Admin.count();
    
    if (count === 0) {
      await Admin.create({
        username: 'admin',
        password: 'Admin123',  // Will be hashed by the hook
        auth2_password: 'SecondPass456'  // Will be hashed by the hook
      });
      console.log('Default admin account created successfully');
    }
  } catch (error) {
    console.error('Error initializing admin account:', error);
  }
};

module.exports = { Admin, initAdmin };