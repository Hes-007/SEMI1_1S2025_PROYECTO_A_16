const { Sequelize } = require('sequelize'); //ORM para PostgreSQL [Object-Relational Mapping (Mapeo Objeto-Relacional).]
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    schema: process.env.DB_SCHEMA || 'saludplus',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Este es único para la base en Supabase
      }
    },
    pool: {
      max: 5, // Máximo de conexiones simultáneas
      min: 0, // Mínimo de conexiones abiertas
      acquire: 30000, // Tiempo de espera para obtener una conexión
      idle: 10000 // Tiempo máximo para estar inactivo
    }
  }
);

// Tester para la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('La conexión a la base de datos se ha establecido correctamente.');
    return true;
  } catch (error) {
    console.error('No se puede conectar a la base de datos:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection
};