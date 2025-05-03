const Joi = require('joi');

// Esquema de contraseña
const passwordSchema = Joi.string()
  .min(8)
  .pattern(/[a-z]/)  // Al menos una letra minúscula
  .pattern(/[A-Z]/)  // Al menos una letra mayúscula
  .pattern(/[0-9]/)  // Al menos un numero
  .required()
  .messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'string.pattern.base': 'La contraseña debe incluir al menos una letra minúscula, una letra mayúscula y un número'
  });

// Campos de usuario comunes
const userFields = {
  email: Joi.string().email().required().messages({
    'string.email': 'Correo electrónico inválido',
    'string.empty': 'El correo electrónico es obligatorio'
  }),
  password: passwordSchema,
  nombre: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'string.max': 'El nombre no puede exceder los 100 caracteres',
    'string.empty': 'El nombre es obligatorio'
  }),
  apellido: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El apellido debe tener al menos 2 caracteres',
    'string.max': 'El apellido no puede exceder los 100 caracteres',
    'string.empty': 'El apellido es obligatorio'
  }),
  dpi: Joi.string().length(13).pattern(/^[0-9]+$/).required().messages({
    'string.length': 'El DPI debe tener 13 dígitos',
    'string.pattern.base': 'El DPI debe contener solo números',
    'string.empty': 'El DPI es obligatorio'
  }),
  genero: Joi.string().valid('masculino', 'femenino', 'otro').required().messages({
    'any.only': 'El género debe ser masculino, femenino u otro',
    'string.empty': 'El género es obligatorio'
  }),
  direccion: Joi.string().min(5).max(255).required().messages({
    'string.min': 'La dirección debe tener al menos 5 caracteres',
    'string.max': 'La dirección no puede exceder los 255 caracteres',
    'string.empty': 'La dirección es obligatoria'
  }),
  telefono: Joi.string().pattern(/^[0-9]{8}$/).required().messages({
    'string.pattern.base': 'El teléfono debe contener 8 dígitos',
    'string.empty': 'El teléfono es obligatorio'
  }),
  fecha_nacimiento: Joi.date().max('now').required().messages({
    'date.max': 'La fecha de nacimiento no puede ser en el futuro',
    'date.base': 'La fecha de nacimiento debe ser una fecha válida',
    'any.required': 'La fecha de nacimiento es obligatoria'
  }),
};

// Esquema de registro de pacientes
const patientRegisterSchema = Joi.object({
  ...userFields,
  foto_url: Joi.string().uri().allow(null, '').messages({
    'string.uri': 'La URL de la foto debe ser una URL válida'
  })
});

// Esquema de registro de médicos
const doctorRegisterSchema = Joi.object({
  ...userFields,
  direccion_clinica: Joi.string().min(5).max(255).required().messages({
    'string.min': 'La dirección de la clínica debe tener al menos 5 caracteres',
    'string.max': 'La dirección de la clínica no puede exceder los 255 caracteres',
    'string.empty': 'La dirección de la clínica es obligatoria'
  }),
  numero_colegiado: Joi.string().min(4).max(50).required().messages({
    'string.min': 'El número de colegiado debe tener al menos 4 caracteres',
    'string.max': 'El número de colegiado no puede exceder los 50 caracteres',
    'string.empty': 'El número de colegiado es obligatorio'
  }),
  especialidad_id: Joi.number().integer().positive().required().messages({
    'number.base': 'La especialidad debe ser un número',
    'number.integer': 'La especialidad debe ser un número entero',
    'number.positive': 'La especialidad debe ser un número positivo',
    'any.required': 'La especialidad es obligatoria'
  }),
  foto_url: Joi.string().uri().required().messages({
    'string.uri': 'La URL de la foto debe ser una URL válida',
    'string.empty': 'La foto es obligatoria para médicos'
  })
});

// Esquema Inicio de Sesión
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Correo electrónico inválido',
    'string.empty': 'El correo electrónico es obligatorio'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña es obligatoria'
  })
});

// Admin login schema
const adminLoginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'El nombre de usuario es obligatorio'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña es obligatoria'
  })
});

// Esquema de inicio de sesión de administrador
const scheduleSchema = Joi.object({
  horarios: Joi.array().items(
    Joi.object({
      dia_semana: Joi.number().integer().min(0).max(6).required().messages({
        'number.base': 'El día de la semana debe ser un número',
        'number.integer': 'El día de la semana debe ser un número entero',
        'number.min': 'El día de la semana debe ser entre 0 (domingo) y 6 (sábado)',
        'number.max': 'El día de la semana debe ser entre 0 (domingo) y 6 (sábado)',
        'any.required': 'El día de la semana es obligatorio'
      }),
      hora_inicio: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern.base': 'La hora de inicio debe tener formato HH:MM',
        'string.empty': 'La hora de inicio es obligatoria'
      }),
      hora_fin: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
        'string.pattern.base': 'La hora de fin debe tener formato HH:MM',
        'string.empty': 'La hora de fin es obligatoria'
      })
    })
  ).min(1).required().messages({
    'array.min': 'Debe proporcionar al menos un horario',
    'any.required': 'Los horarios son obligatorios'
  })
});
// Esquema de citas
const appointmentSchema = Joi.object({
  medico_id: Joi.number().integer().positive().required().messages({
    'number.base': 'El ID del médico debe ser un número',
    'number.integer': 'El ID del médico debe ser un número entero',
    'number.positive': 'El ID del médico debe ser un número positivo',
    'any.required': 'El ID del médico es obligatorio'
  }),
  fecha: Joi.date().min('now').required().messages({
    'date.min': 'La fecha de la cita no puede ser en el pasado',
    'date.base': 'La fecha de la cita debe ser una fecha válida',
    'any.required': 'La fecha de la cita es obligatoria'
  }),
  hora: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required().messages({
    'string.pattern.base': 'La hora debe tener formato HH:MM',
    'string.empty': 'La hora es obligatoria'
  }),
  motivo: Joi.string().min(10).max(500).required().messages({
    'string.min': 'El motivo debe tener al menos 10 caracteres',
    'string.max': 'El motivo no puede exceder los 500 caracteres',
    'string.empty': 'El motivo es obligatorio'
  })
});

// Esquema de tratamiento de citas
const appointmentTreatmentSchema = Joi.object({
  tratamiento: Joi.string().min(10).max(1000).required().messages({
    'string.min': 'El tratamiento debe tener al menos 10 caracteres',
    'string.max': 'El tratamiento no puede exceder los 1000 caracteres',
    'string.empty': 'El tratamiento es obligatorio'
  })
});

module.exports = {
  patientRegisterSchema,
  doctorRegisterSchema,
  loginSchema,
  adminLoginSchema,
  scheduleSchema,
  appointmentSchema,
  appointmentTreatmentSchema
};