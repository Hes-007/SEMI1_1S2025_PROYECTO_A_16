# 🧠 Controladores - SaludPlus API

Los controladores son responsables de manejar la lógica de negocio y responder a las peticiones HTTP. A continuación se detallan los controladores principales de la API.

---

## 🔐 `auth.controller.js`
Maneja registro e inicio de sesión para pacientes, médicos y administradores.

### 📌 Funciones clave:
- `registerPatient(req, res)`: Crea un usuario y paciente pendiente de aprobación.
- `registerDoctor(req, res)`: Igual que paciente pero como médico, con validación de especialidad.
- `login(req, res)`: Login general (paciente o médico), genera token JWT.
- `adminLogin(req, res)`: Login de administrador (fase 1).
- `adminSecondAuth(req, res)`: Segunda fase con archivo para admin, devuelve token completo.

---

## 🧑‍⚕️ `doctor.controller.js`
Lógica de médicos autenticados: agenda, citas, historial y perfil.

### 📌 Funciones:
- `getPendingAppointments()`: Obtiene las citas pendientes del médico.
- `attendAppointment()`: Marca una cita como atendida con tratamiento.
- `cancelAppointment()`: Cancela cita y notifica por correo al paciente.
- `getAppointmentHistory()`: Historial de citas ya atendidas o canceladas.
- `setSchedule()`: Establece el horario de atención (valida formato y lógica).
- `getSchedule()`: Consulta el horario actual.
- `getProfile()` / `updateProfile()`: Perfil médico (datos personales y profesionales).

---

## 🧍‍♂️ `patient.controller.js`
Operaciones de paciente autenticado: ver médicos, agendar, cancelar.

### 📌 Funciones:
- `getAllDoctors()`: Lista médicos disponibles sin citas activas con este paciente.
- `searchDoctorsBySpecialty()`: Filtro por especialidad.
- `getDoctorSchedule()` / `getDoctorAvailability()`: Horario y disponibilidad del médico por fecha.
- `createAppointment()`: Agendar cita (verifica horario, disponibilidad y duplicados).
- `getActiveAppointments()` / `getAppointmentHistory()`: Citas activas y pasadas.
- `cancelAppointment()`: Cancela una cita si está pendiente.
- `getProfile()` / `updateProfile()`: Perfil del paciente.

---

## 📅 `appointment.controller.js`
Consultas y estadísticas generales de citas.

### 📌 Funciones:
- `getAppointmentById()`: Consulta una cita específica (autorización por rol).
- `getAppointmentsStats()`: Métricas: totales por estado, por mes, hoy, pendientes.

---

## 🛠️ `admin.controller.js`
Funcionalidades exclusivas del administrador.

### 📌 Aprobación y control de registros:
- `getPendingPatients()` / `getPendingDoctors()`: Muestra registros pendientes.
- `approvePatient()` / `approveDoctor()`: Activa cuentas.
- `rejectPatient()` / `rejectDoctor()`: Marca cuentas como inactivas.

### 📋 Gestión de usuarios activos:
- `getAllPatients()` / `getAllDoctors()`: Usuarios activos por rol.
- `deactivatePatient()` / `deactivateDoctor()`: Cambia estado a `inactivo`.

### 📊 Reportes:
- `getDoctorsWithMostPatients()`: Top 10 médicos con más pacientes atendidos.
- `getMostPopularSpecialties()`: Especialidades más demandadas.

---

## 🧪 Notas Técnicas
- Todos los controladores usan `async/await` con `try/catch` y delegan errores a `next()`.
- Se respeta el contexto del usuario (`req.user`) según su rol.
- Se usan transacciones para operaciones críticas (registro, cancelación, agendas).
- Muchos controladores aplican validaciones manuales o con regex para asegurar consistencia.

---

Con esta estructura de controladores, el backend de SaludPlus se mantiene modular, claro y seguro, listo para ser consumido por un frontend o app móvil.

