/**
 * Middleware para manejar errores
 */
const errorMiddleware = (err, req, res, next) => {
    console.error('Error:', err);
  
    // Mensaje de error cuando el servidor se vaya a la burger
    let statusCode = 500;
    let message = 'Se chingó el servidor';
    let errors = null;
  
    // Comprobar si el error es en "Sequelize" (Crítico por ser en la base de datos o conexión a esta)
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
      statusCode = 400;
      message = 'Error de validacion';
      errors = err.errors.map(e => ({
        field: e.path,
        message: e.message
      }));
    }
    // Comprueba si es un error personalizado con statusCode único
    else if (err.statusCode) {
      statusCode = err.statusCode;
      message = err.message;
    }
    // Manejar errores JWT
    else if (err.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Token no valido';
    }
    else if (err.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token caducado';
    }
  
    // Enviar respuesta de error
    res.status(statusCode).json({
      status: 'error',
      message,
      errors: errors || undefined,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  };
  
  module.exports = errorMiddleware;