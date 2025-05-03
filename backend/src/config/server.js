const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const routes = require('../routes');
const errorMiddleware = require('../middlewares/error.middleware');

const setupServer = (app) => {
  // Middleware de seguridad
  app.use(helmet());
  
  // Configuración CORS
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://saludplus-app.com' // Dominio de frontend (cambiar en producción)
      : ['http://localhost:5173', 'http://localhost:3000'],  // Puerto por defecto de Vite
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Solicitar análisis de JSON
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Middleware de registro de peticiones en consola
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  
  // Endpoint de control de estado
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'El servidor esta funcionando' });
  });
  
  // Rutas API
  app.use('/api', routes);
  
  // Error al manejar el middleware
  app.use(errorMiddleware);
  
  // Manejador del típico 404
  app.use('*', (req, res) => {
    res.status(404).json({ 
      status: 'error', 
      message: `Ruta ${req.originalUrl} no encontrada` 
    });
  });
  
  return app;
};

module.exports = setupServer;