# 🛠️ Utilidades y Validadores - SaludPlus API

Este módulo contiene funciones utilitarias para autenticación, seguridad, correos y validación de datos. Se encuentran en la carpeta `utils/` y `validators/`, y son esenciales para mantener la API robusta, segura y bien estructurada.

---

## 🔐 `jwt.js` - Manejo de Tokens JWT

### 📌 Funciones exportadas:

#### 1. `generateToken(payload)`
- Genera un token JWT firmado.
- Usa la clave `JWT_SECRET` y la expiración `JWT_EXPIRATION` desde `.env`.

#### 2. `verifyToken(token)`
- Verifica y decodifica un token.
- Retorna `null` si es inválido o expirado.

#### 3. `extractToken(req)`
- Extrae el token desde el header `Authorization` (formato `Bearer <token>`).
- Retorna el token o `null` si no está bien formado.

---

## ✉️ `mailer.js` - Envío de Correos

### 📌 Función principal:

#### `sendCancellationEmail({ to, patientName, doctorName, date, time, reason })`
- Envía un correo HTML notificando la cancelación de una cita.
- Utiliza configuración SMTP definida en `.env` (`EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`).
- Maneja errores y retorna `true` o `false`.

---

## 🔒 `password.js` - Seguridad de Contraseñas

### 📌 Funciones exportadas:

#### 1. `hashPassword(password)`
- Cifra una contraseña con `bcrypt` usando 10 salt rounds.

#### 2. `comparePassword(password, hashedPassword)`
- Compara una contraseña ingresada con la versión cifrada.

#### 3. `validatePasswordStrength(password)`
- Verifica que la contraseña tenga:
  - Mínimo 8 caracteres
  - Una letra mayúscula, una minúscula y un número
- Retorna `true` o `false`.

---

## 📋 `validator.js` - Validación con Joi

Centraliza todos los esquemas de validación para entradas del cliente. Cada esquema incluye mensajes personalizados en español.

### 📌 Esquemas exportados:

#### 🧑 Paciente:
- `patientRegisterSchema`: incluye campos comunes más `foto_url` opcional.

#### 👨‍⚕️ Médico:
- `doctorRegisterSchema`: incluye campos comunes más `direccion_clinica`, `numero_colegiado`, `especialidad_id`, y `foto_url` obligatoria.

#### 🔑 Login:
- `loginSchema`: `email` y `password`.
- `adminLoginSchema`: `username` y `password`.

#### 📆 Horarios:
- `scheduleSchema`: lista de días (`0-6`), `hora_inicio` y `hora_fin` en formato HH:MM.

#### 📅 Citas:
- `appointmentSchema`: `medico_id`, `fecha`, `hora`, `motivo`.
- `appointmentTreatmentSchema`: `tratamiento`.

#### 🧩 Campos comunes (`userFields`):
- `nombre`, `apellido`, `dpi`, `email`, `password`, `genero`, `direccion`, `telefono`, `fecha_nacimiento`

---

## 🧪 Uso con el Middleware de Validación
```js
const validate = require('../middlewares/validate.middleware');
const { patientRegisterSchema } = require('../validators/validator');

router.post('/registro/paciente', validate(patientRegisterSchema), controlador);
```

---

## 📚 Recomendaciones
- Mantener validaciones en `validator.js` para estandarización.
- Reutilizar `password.js` tanto en registro como en login.
- Usar `mailer.js` para cualquier tipo de notificación por correo.
- Siempre verificar y extraer tokens con `jwt.js` en rutas protegidas.

---

Con estas herramientas bien organizadas, tu servidor puede garantizar validaciones estrictas, autenticación segura y una experiencia de usuario clara.

