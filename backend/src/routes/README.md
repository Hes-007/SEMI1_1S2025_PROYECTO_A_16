# 🌐 Rutas de la API - SaludPlus

Las rutas definen los puntos de entrada a la API REST. Cada módulo tiene su propio archivo de rutas que organiza los endpoints según el tipo de usuario o entidad.

---

## 🧭 `routes/index.js`
Archivo principal que monta todas las rutas bajo `/api`.

### 📌 Endpoints definidos:
- `/auth` → autenticación y registro.
- `/patient` → acciones del paciente.
- `/doctor` → acciones del médico.
- `/admin` → funciones del administrador.
- `/appointments` → citas y estadísticas generales.

También expone `/api` como ruta raíz con info básica de la API.

---

## 🔐 `auth.routes.js`
Módulo de autenticación y registro de usuarios.

### 📌 Endpoints:
- `POST /register/patient` → registro de paciente (con validación Joi).
- `POST /register/doctor` → registro de médico (con validación Joi).
- `POST /login` → login de usuario.
- `POST /admin/login` → login fase 1 del admin.
- `POST /admin/second-auth` → autenticación secundaria con archivo `auth2.ayd1` (requiere `authenticate` y `multer`).

---

## 🧍‍♂️ `patient.routes.js`
Rutas para pacientes autenticados (`authenticate + authorize('paciente')`).

### 📌 Búsqueda de médicos:
- `GET /doctors` → lista de médicos.
- `GET /doctors/specialty/:especialidad_id` → buscar por especialidad.
- `GET /doctors/:doctor_id/schedule` → obtener horario.
- `GET /doctors/:doctor_id/availability` → disponibilidad por fecha.

### 📋 Citas:
- `POST /appointments` → agendar cita.
- `GET /appointments/active` → ver activas.
- `PATCH /appointments/:id/cancel` → cancelar.
- `GET /appointments/history` → historial.

### 👤 Perfil:
- `GET /profile` / `PATCH /profile`

---

## 👨‍⚕️ `doctor.routes.js`
Rutas para médicos autenticados (`authenticate + authorize('medico')`).

### 📅 Citas:
- `GET /appointments/pending` → citas por atender.
- `PATCH /appointments/:id/attend` → marcar como atendida (con tratamiento).
- `PATCH /appointments/:id/cancel` → cancelar.
- `GET /appointments/history` → historial.

### ⏰ Horarios:
- `POST /schedule` → establecer horarios.
- `GET /schedule` → ver horarios.

### 👤 Perfil:
- `GET /profile` / `PATCH /profile`

---

## 🛠️ `admin.routes.js`
Rutas exclusivas para administradores (`authenticate + isAdmin`).

### 📝 Registros pendientes:
- `GET /pending/patients` / `doctors`
- `PATCH /pending/:tipo/:id/approve`
- `PATCH /pending/:tipo/:id/reject`

### 🧾 Gestión de usuarios:
- `GET /patients` / `doctors`
- `PATCH /:tipo/:id/deactivate`

### 📊 Reportes:
- `GET /reports/doctors/most-patients`
- `GET /reports/specialties/most-popular`

---

## 📅 `appointment.routes.js`
Rutas compartidas autenticadas para citas.

### 📌 Endpoints:
- `GET /:appointment_id` → ver detalles de una cita.
- `GET /stats/overview` → estadísticas (totales, por estado, etc).

---

Estas rutas están organizadas para reflejar claramente los permisos por rol (paciente, médico, admin) y facilitar el consumo desde un frontend o aplicación móvil.

