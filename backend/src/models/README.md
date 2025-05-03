# 🧩 Modelos de Datos - SaludPlus API

Este módulo contiene todos los modelos Sequelize que representan las entidades y relaciones principales del sistema SaludPlus, incluyendo usuarios, doctores, pacientes, citas, horarios y más.

---

## 🔧 Inicialización (index.js)

### 📌 Funcionalidades:
- Importa y exporta todos los modelos.
- Define las **relaciones** entre modelos con `belongsTo`, `hasOne`, `hasMany`.
- Expone `initializeData()` para poblar:
  - Roles (`initRoles`)
  - Especialidades (`initSpecialties`)
  - Estados de cita (`initAppointmentStatuses`)
  - Cuenta admin (`initAdmin`)

---

## 👤 `User`
Modelo base de usuarios.

| Campo               | Tipo        | Notas                          |
|--------------------|-------------|--------------------------------|
| `email`            | STRING      | Único, requerido               |
| `password`         | STRING      | Hasheado con bcrypt            |
| `rol_id`           | INTEGER     | FK a `Role`                    |
| `estado`           | STRING      | `pendiente`, `activo`, `inactivo` |
| `fecha_registro`   | DATE        | Por defecto: ahora             |
| `ultima_actualizacion` | DATE   | Se actualiza con hook          |

### 🪝 Hooks:
- Hasheo automático de contraseñas en `create` y `update`.

---

## 👨‍💼 `Admin`
Cuenta especial para administración del sistema.

| Campo             | Tipo    | Notas                            |
|-------------------|---------|----------------------------------|
| `username`        | STRING  | Único, requerido                 |
| `password`        | STRING  | Hasheado                         |
| `auth2_password`  | STRING  | Segundo factor, también hasheado |
| `ultima_sesion`   | DATE    | Opcional                         |

### 🪝 Función:
- `initAdmin()` crea una cuenta admin inicial si no existe.

---

## 🧾 `Role`
Define tipos de usuarios.

| Campo       | Tipo    | Notas               |
|-------------|---------|----------------------|
| `nombre`    | STRING  | Único, requerido     |
| `descripcion` | STRING | Opcional             |

### 🪝 Función:
- `initRoles()` crea roles por defecto (`paciente`, `medico`).

---

## 🩺 `Specialty`
Especialidades médicas disponibles.

| Campo       | Tipo    | Notas                 |
|-------------|---------|------------------------|
| `nombre`    | STRING  | Único, requerido       |
| `descripcion` | STRING | Opcional               |

### 🪝 Función:
- `initSpecialties()` agrega especialidades comunes como Pediatría, Cardiología, etc.

---

## 👨‍⚕️ `Doctor`
Información extendida de usuarios tipo médico.

| Campo              | Tipo      | Validaciones                              |
|--------------------|-----------|-------------------------------------------|
| `usuario_id`        | INTEGER   | Único, FK a `User`                        |
| `nombre`, `apellido` | STRING | Requeridos                                |
| `dpi`               | STRING    | 13 dígitos, numérico, único               |
| `genero`            | STRING    | `masculino`, `femenino`, `otro`          |
| `direccion`, `direccion_clinica` | STRING | Requeridos     |
| `telefono`          | STRING    | Numérico                                  |
| `fecha_nacimiento`  | DATE      | No futura                                 |
| `numero_colegiado`  | STRING    | Único                                     |
| `especialidad_id`   | INTEGER   | FK a `Specialty`                          |
| `foto_url`          | STRING    | Requerido                                 |

---

## 🧑 `Patient`
Información extendida de usuarios tipo paciente.

| Campo             | Tipo      | Validaciones                             |
|-------------------|-----------|------------------------------------------|
| `usuario_id`       | INTEGER   | Único, FK a `User`                       |
| `nombre`, `apellido` | STRING | Requeridos                               |
| `dpi`              | STRING    | 13 dígitos, numérico, único              |
| `genero`           | STRING    | `masculino`, `femenino`, `otro`         |
| `direccion`        | STRING    | Requerido                                |
| `telefono`         | STRING    | Numérico                                 |
| `fecha_nacimiento` | DATE      | No futura                                |
| `foto_url`         | STRING    | Opcional                                 |

---

## ⏰ `Schedule`
Horarios de disponibilidad médica.

| Campo         | Tipo    | Notas                                     |
|---------------|---------|--------------------------------------------|
| `medico_id`    | INTEGER | FK a `Doctor`                             |
| `dia_semana`   | INTEGER | 0 (domingo) a 6 (sábado)                  |
| `hora_inicio`  | TIME    | Requerido                                 |
| `hora_fin`     | TIME    | Requerido y mayor que inicio              |

🔐 Índice único: `medico_id` + `dia_semana`

---

## 📅 `Appointment`
Modelo de citas médicas entre pacientes y doctores.

| Campo             | Tipo       | Validaciones/Notas                                |
|------------------|------------|---------------------------------------------------|
| `paciente_id`     | INTEGER    | FK a `Patient`                                    |
| `medico_id`       | INTEGER    | FK a `Doctor`                                     |
| `fecha`           | DATEONLY   | No puede ser en el pasado                        |
| `hora`            | TIME       | Requerido                                         |
| `motivo`          | TEXT       | Requerido                                         |
| `tratamiento`     | TEXT       | Opcional                                          |
| `estado_id`       | INTEGER    | FK a `AppointmentStatus`                         |
| `fecha_creacion`  | DATE       | Default: NOW                                      |
| `fecha_actualizacion` | DATE   | Se actualiza con hook en `update`                |

🔐 Índice único: `medico_id`, `fecha`, `hora`

---

## 📋 `AppointmentStatus`
Estados posibles de una cita.

| Campo     | Tipo    | Notas                         |
|-----------|---------|-------------------------------|
| `nombre`  | STRING  | `pendiente`, `atendida`, etc. |
| `descripcion` | STRING | Opcional                    |

### 🪝 Función:
- `initAppointmentStatuses()` inserta estados por defecto.

---

## 🔗 Relaciones clave
- `User` → `Role` (N:1)
- `User` → `Doctor` / `Patient` (1:1, `CASCADE`)
- `Doctor` → `Specialty` / `Schedule` (1:N)
- `Doctor` ↔ `Appointment` / `Patient` ↔ `Appointment` (1:N)
- `Appointment` → `AppointmentStatus` (N:1)

---

## ✅ Recomendaciones
- No usar `sequelize.sync()` en producción, reemplazar por migraciones.
- Asegurar que todas las claves foráneas y relaciones estén bien definidas.
- Mantener los hooks para seguridad (hashing, timestamps).
- Reutilizar `initializeData()` para ambientes de testing o staging.

---

Con esta arquitectura, los modelos cubren toda la lógica de datos necesaria para la gestión clínica, autenticación y control de citas en el sistema SaludPlus.

