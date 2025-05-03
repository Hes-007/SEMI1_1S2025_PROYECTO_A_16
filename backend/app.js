const express = require('express');
const { sequelize, testConnection } = require('./src/config/database');
const setupServer = require('./src/config/server');
const { initializeData } = require('./src/models');
require('dotenv').config();

const app = express();
setupServer(app);
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Verificamos la conexión con la base de datos (Supabase PostgreSQL) antes de iniciar el servidor
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('No se pudo conectar a la base de datos. El servidor no se iniciara.');
      process.exit(1);
    }
    
    // Inicializamos los datos por defecto (roles, specialties, etc.)
    await initializeData();
    
    // Sincronizamos los modelos de la base de datos (aunque en producción se utilizaría migraciones)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synced successfully');
    }
    
    // Ahora si iniciamos el servidor con todo listo para poder utilizarlo
    app.listen(PORT, () => {
      console.log(`Servidor ejecutandose en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
      console.log(`Comprobacion de estado disponible en: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejar excepciones no detectadas (errores incontrolables)
process.on('uncaughtException', (error) => {
  console.error('EXCEPCIÓN NO CAPTURADA:', error);
  process.exit(1);
});

// Gestionar los rechazos de promesas no gestionadas (por errores externos)
process.on('unhandledRejection', (error) => {
  console.error('RECHAZO NO CONTROLADO:', error);
  process.exit(1);
});

startServer();

module.exports = app;