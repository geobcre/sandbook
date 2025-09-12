# 📚 Sandbook - Librería Online

Una aplicación web completa de librería online desarrollada con Node.js, Express, Prisma y MySQL para el backend, y HTML/CSS/JavaScript para el frontend.

## 🚀 Características

- **Autenticación de usuarios** con JWT
- **Gestión de productos** y categorías
- **Carrito de compras** funcional
- **Panel de administración**
- **API REST** completa
- **Base de datos MySQL** con Prisma ORM

## ��️ Tecnologías

### Backend
- Node.js
- Express.js
- Prisma ORM
- MySQL
- JWT para autenticación
- bcryptjs para hash de contraseñas
- CORS habilitado

### Frontend
- HTML5
- CSS3
- JavaScript Vanilla
- Diseño responsivo

## 📁 Estructura del Proyecto

```
Sandbook/
├── backend/                 # API REST
│   ├── src/
│   │   ├── controllers/     # Controladores
│   │   ├── routers/         # Rutas
│   │   ├── middlewares/     # Middlewares
│   │   └── utils/           # Utilidades
│   ├── prisma/              # Esquema y migraciones
│   └── package.json
├── frontend/                # Aplicación web
│   ├── css/                 # Estilos
│   ├── js/                  # JavaScript
│   └── *.html               # Páginas
└── README.md
```

## 🚀 Despliegue

Este proyecto está configurado para desplegarse en Railway conectando el repositorio de GitHub.

### Variables de Entorno Requeridas

```env
DATABASE_URL="mysql://usuario:contraseña@host:puerto/base_de_datos"
SHADOW_DATABASE_URL="mysql://usuario:contraseña@host:puerto/shadow_db"
JWT_SECRET="tu_jwt_secret_aqui"
PORT=3000
```

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrarse

### Usuarios
- `GET /api/users` - Obtener usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario

### Productos
- `GET /api/products` - Obtener productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto (Admin)
- `PUT /api/products/:id` - Actualizar producto (Admin)
- `DELETE /api/products/:id` - Eliminar producto (Admin)

### Carrito
- `GET /api/carts/:userId` - Obtener carrito del usuario
- `POST /api/carts/:userId/items` - Agregar item al carrito
- `PUT /api/carts/:userId/items/:itemId` - Actualizar cantidad
- `DELETE /api/carts/:userId/items/:itemId` - Eliminar item

### Categorías
- `GET /api/categories` - Obtener categorías
- `POST /api/categories` - Crear categoría (Admin)

## 🏃‍♂️ Desarrollo Local

### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend
Abrir los archivos HTML directamente en el navegador o usar un servidor local.

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

```json:/Users/joaquin/Downloads/Sandbook/backend/railway.json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}

```dockerfile:/Users/joaquin/Downloads/Sandbook/backend/Dockerfile
# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

```env:/Users/joaquin/Downloads/Sandbook/backend/.env.example
# Database
DATABASE_URL="mysql://usuario:contraseña@host:puerto/base_de_datos"
SHADOW_DATABASE_URL="mysql://usuario:contraseña@host:puerto/shadow_db"

# JWT
JWT_SECRET="tu_jwt_secret_muy_seguro_aqui"

# Server
PORT=3000
NODE_ENV=production

# CORS (opcional)
CORS_ORIGIN="https://tu-dominio-frontend.com"

```

##  Pasos para el Despliegue

### 1. **Subir a GitHub**
```bash
# En la raíz del proyecto
git add .
git commit -m "Initial commit: Sandbook e-commerce app"
git branch -M main
git remote add origin https://github.com/tu-usuario/sandbook.git
git push -u origin main
```

### 2. **Configurar Railway**
1. Ve a [Railway.app](https://railway.app)
2. Conecta tu cuenta de GitHub
3. Selecciona tu repositorio `sandbook`
4. Railway detectará automáticamente que es un proyecto Node.js

### 3. **Configurar Variables de Entorno en Railway**
En el dashboard de Railway, agrega estas variables:
- `DATABASE_URL`: URL de tu base de datos MySQL (Railway puede crear una automáticamente)
- `JWT_SECRET`: Un string aleatorio y seguro
- `PORT`: 3000 (Railway lo maneja automáticamente)
- `NODE_ENV`: production

### 4. **Configurar la Base de Datos**
Railway puede crear automáticamente una base de datos MySQL para ti. Una vez creada:
1. Copia la URL de conexión
2. Agrégala como `DATABASE_URL` en las variables de entorno
3. Railway ejecutará automáticamente `npx prisma db push` durante el despliegue

### 5. **Desplegar el Frontend**
Para el frontend, puedes:
- **Opción A**: Usar Railway también (crear un segundo servicio)
- **Opción B**: Usar Vercel, Netlify o GitHub Pages
- **Opción C**: Servir el frontend desde el mismo backend

## 🔧 Consideraciones Importantes

1. **CORS**: Tu backend ya tiene CORS habilitado, pero asegúrate de configurar el dominio correcto en producción.

2. **Base de Datos**: Railway puede crear una base de datos MySQL automáticamente, o puedes usar una externa como PlanetScale.

3. **Variables de Entorno**: Nunca subas el archivo `.env` a GitHub. Usa `.env.example` como plantilla.

4. **Frontend**: Necesitarás actualizar las URLs de la API en el frontend para que apunten a tu backend desplegado.

¿Te gustaría que proceda con algún paso específico o necesitas ayuda con alguna configuración particular? 
