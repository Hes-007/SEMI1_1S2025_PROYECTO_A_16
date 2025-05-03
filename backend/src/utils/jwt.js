const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Generar un token JWT
 * @param {Object} payload - Los datos a incluir en el token
 * @returns {string} - JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRATION || '24h' } // Debe cambiar a menos tiempo pero para estas pruebas se dejaŕa así
  );
};

/**
 * Verificar un token JWT
 * @param {string} token - El token para verificar
 * @returns {Object|null} - Carga útil del token decodificada o nula si no es válida
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Extraer token del encabezado de autorización
 * @param {Object} req - Objeto de solicitud Express
 * @returns {string|null} - Token JWT o nulo si no se encuentra
 */
const extractToken = (req) => {
  if (!req.headers.authorization) {
    return null;
  }
  
  const parts = req.headers.authorization.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

module.exports = {
  generateToken,
  verifyToken,
  extractToken
};