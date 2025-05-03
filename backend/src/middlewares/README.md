# 🧰 Middlewares del Servidor - SaludPlus API

Este proyecto utiliza tres middlewares personalizados esenciales para la seguridad, validación y manejo de errores de la API. A continuación se documentan sus responsabilidades y cómo utilizarlos correctamente.

---

## 🔐 `auth.middleware.js`

Middleware de **autenticación y autorización**.

### 📌 Funciones exportadas:

#### 1. `authenticate`
- Verifica que el usuario tenga un token JWT válido.
- Si es un admin, carga su información desde `Admin`.
- Si es un usuario regular, valida que su cuenta esté activa.
- Guarda la info del usuario en `req.user`.

#### 2. `authorize(roles)`
- Asegura que el usuario autenticado tenga uno de los roles permitidos.
- Los admins siempre tienen acceso total.
- Requiere que el modelo `User` tenga relación con el modelo `Rol`.

#### 3. `isAdmin`
- Permite acceso solo a usuarios autenticados como administradores.

---

## ✅ `validate.middleware.js`

Middleware de **validación de datos** usando [Joi](https://joi.dev/).

### 📌 Uso:
```js
validate(schema, property = 'body')
```

- `schema`: Esquema Joi para validar.
- `property`: Qué parte del `req` validar (`body`, `params`, `query`).

### 📥 Respuesta si hay errores:
- Status `400`
- Mensaje: "Validation failed"
- Detalles por campo con:
  - `field`
  - `message`

### ✅ Si no hay errores:
- Llama a `next()` para continuar con el flujo normal.

---

## 💥 `error.middleware.js`

Middleware centralizado para **manejo de errores**.

### 📌 Características:
- Maneja errores comunes como:
  - `SequelizeValidationError`
  - `SequelizeUniqueConstraintError`
  - `JsonWebTokenError` y `TokenExpiredError`
- Soporta errores personalizados con `err.statusCode` y `err.message`.
- En entorno `development`, incluye el `stack trace` para depuración.

### 📤 Respuesta típica:
```json
{
  "status": "error",
  "message": "Validation error | Invalid token | etc.",
  "errors": [ { "field": "email", "message": "Email is required" } ],
  "stack": "..." // Solo en desarrollo
}
```

---

## 🧩 Integración en el servidor
En el archivo `server.js`:

```js
const setupServer = (app) => {
  app.use(authenticate); // Para rutas protegidas
  app.use('/api', routes); // Rutas principales
  app.use(errorMiddleware); // Captura cualquier error
};
```

Para rutas específicas:
```js
router.post('/usuarios', authenticate, authorize('admin'), validate(userSchema), controlador);
```

---

## 📚 Recomendaciones
- Siempre colocar `errorMiddleware` al final.
- Usar `validate()` antes del controlador para validar entradas.
- Encadenar `authenticate` y `authorize` para proteger rutas sensibles.

---

Con estos middlewares, la API mantiene una estructura segura, consistente y robusta frente a errores y validaciones.

