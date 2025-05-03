# ⚙️ Configuración del Servidor - SaludPlus API

Este archivo documenta los dos módulos de configuración principales del servidor: `database.js` y `server.js`. Ambos son fundamentales para establecer la conexión con la base de datos y preparar el servidor Express con seguridad, logging y rutas.

---

## 🗄️ `database.js`

Archivo de configuración y conexión a la base de datos utilizando **Sequelize**.

### 📌 Funciones y exportaciones:

#### 1. `sequelize`
- Instancia principal de Sequelize configurada con:
  - Variables de entorno: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_SCHEMA`
  - Dialect: `postgres`
  - Configuración de `SSL` (para Supabase)
  - Pool de conexiones

#### 2. `testConnection`
- Función asíncrona que intenta autenticar la conexión con la base de datos.
- Devuelve `true` si es exitosa, o `false` si falla (e imprime el error).

### 🛠️ Uso:
Se importa y se llama desde el archivo principal del servidor para verificar que la base de datos esté lista antes de iniciar:
```js
const { sequelize, testConnection } = require('./src/config/database');
```

---

## 🌐 `server.js`

Define la función `setupServer(app)` que prepara el servidor Express.

### 📌 Funciones y responsabilidades:

#### 1. Seguridad y Headers:
```js
app.use(helmet());
```
- Añade cabeceras HTTP para proteger la API de ataques comunes.

#### 2. CORS:
```js
app.use(cors({ origin, methods, allowedHeaders }));
```
- Permite acceso solo desde dominios permitidos (distinto en `development` y `production`).

#### 3. Parsers:
```js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```
- Permite procesar datos `JSON` y de formularios.

#### 4. Logging:
```js
app.use(morgan('dev' | 'combined'));
```
- Imprime información de cada petición en consola (según entorno).

#### 5. Health Check:
```js
app.get('/health', ...);
```
- Ruta simple para verificar si el servidor está vivo.

#### 6. Rutas de la API:
```js
app.use('/api', routes);
```
- Registra todas las rutas principales bajo `/api`.

#### 7. Manejo de errores:
```js
app.use(errorMiddleware);
app.use('*', (req, res) => res.status(404)...);
```
- Captura errores globales y rutas no encontradas.

### 🔁 Retorno
```js
return app;
```
- Retorna la instancia de `Express` ya configurada.

---

## 🧩 Integración
En el archivo principal (`index.js`, `app.js` o `main.js`):

```js
const app = express();
setupServer(app);
await testConnection();
await sequelize.sync();
app.listen(PORT, ...);
```

---

## 📚 Recomendaciones
- Usar `.env` para mantener configuraciones sensibles fuera del código.
- Mantener `server.js` limpio, moviendo la lógica de rutas y errores a sus propios módulos.
- No sincronizar (`sequelize.sync`) en producción, usar migraciones en su lugar.

---

Con estos dos módulos bien configurados, la API puede funcionar de forma escalable, segura y con buenas prácticas desde el inicio.

