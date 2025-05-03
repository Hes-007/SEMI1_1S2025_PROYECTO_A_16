/**
 * Middleware para validar los datos de la solicitud frente a un esquema Joi
 * @param {Object} schema - Esquema Joi para validar contra comparación
 * @param {string} property - Solicitar propiedad a validar (cuerpo, parámetros, consulta)
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
      const { error } = schema.validate(req[property], { abortEarly: false });
      
      if (!error) {
        return next();
      }
      
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));
      
      return res.status(400).json({
        status: 'error',
        message: 'La validación fallo',
        errors: validationErrors
      });
    };
  };
  
  module.exports = validate;