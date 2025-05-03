const { verifyToken, extractToken } = require('../utils/jwt');
const { User } = require('../models/user.model');
const { Admin } = require('../models/admin.model');

/**
 * Middleware para proteger todas las rutas que requieren autenticación
 * 401 -> No autorizado (No se quién eres neceistas una autenticación [Iniciar Sesión])
 * 403 -> Prohibido (Se quién eres pero no puedes acceder a esto)
 * 404 -> No encontrado (Lo que buscas no está aquí)
 * 500 -> Error interno en el servidor (El servidor se fue a la burger por algo mal hecho, no es culpa del usuario)
 * 
 * 200 -> OK (Ta bien)
 * 201 -> Creado (Recurso creado exitosamente)
 * 204 -> Sin contenido (Todo está bien pero no hay contenido en la respuesta del servidor)
 */

const authenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);
    
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No se proporciona ningun token'
      });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: 'Token invalido o caducado'
      });
    }
    
    if (decoded.isAdmin) {
      const admin = await Admin.findByPk(decoded.id);
      
      if (!admin) {
        return res.status(401).json({
          status: 'error',
          message: 'Administrador no encontrado'
        });
      }
      
      req.user = {
        id: admin.id,
        username: admin.username,
        isAdmin: true
      };
    } else {
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuario no encontrado'
        });
      }
      
      if (user.estado !== 'activo') {
        return res.status(403).json({
          status: 'error',
          message: 'La cuenta no esta activa'
        });
      }
      
      req.user = {
        id: user.id,
        email: user.email,
        rol_id: user.rol_id,
        estado: user.estado
      };
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error de autenticacion',
      error: error.message
    });
  }
};

/**
 * Middleware para garantizar que el usuario tenga un rol específico
 * @param {Array|string} roles - Roles permitidos en el sistema
 */
const authorize = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Usuario no autenticado'
        });
      }
      
      if (req.user.isAdmin) {
        return next(); // El administrador tiene todos los permisos hacia todas las rutas por defecto
      }
      
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      // Find user with role
      const user = await User.findByPk(req.user.id, {
        include: {
          association: 'rol',
          attributes: ['nombre']
        }
      });
      
      if (!user || !user.rol) {
        return res.status(403).json({
          status: 'error',
          message: 'Rol no encontrado'
        });
      }
      
      if (!allowedRoles.includes(user.rol.nombre)) {
        return res.status(403).json({
          status: 'error',
          message: 'Permisos insuficientes'
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error de autorización',
        error: error.message
      });
    }
  };
};

/**
 * Middleware para garantizar que el usuario sea administrador
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        status: 'error',
        message: 'Se requiere acceso de administrador'
      });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error de autorización',
      error: error.message
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  isAdmin
};