const bcrypt = require('bcrypt'); // Ya se ha usado varias veces en varios proyectos

/**
 * Hash de una contraseña usando bcrypt
 * @param {string} password - La contraseña en texto plano y sin cifrar
 * @returns {Promise<string>} - La contraseña cifrada (hashed)
 */
const hashPassword = async (password) => {
  const saltRounds = 10; // Número normal para saltos con bcrypt
  return bcrypt.hash(password, saltRounds);
};

/**
 * Comparar una contraseña de texto plano con una contraseña cifrada
 * @param {string} password - Contraseña sin cifrar
 * @param {string} hashedPassword - Contraseña cifrada
 * @returns {Promise<boolean>} - Verdadero si coinciden sino falso
 */
const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Validar la seguridad de la contraseña
 * Al menos 8 caracteres: 1 minúscula, 1 mayúscula y 1 número
 * @param {string} password - La contraseña a validar
 * @returns {boolean} - Verdadero si la contraseña cumple los requisitos
 */
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  return (
    password.length >= minLength &&
    hasLowerCase &&
    hasUpperCase &&
    hasNumber
  );
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength
};