import express from "express";
import userRouter from "./routers/user.routers.js";
import productRouter from "./routers/product.routers.js";
import cartRouter from "./routers/cart.routers.js";
import authRouter from "./routers/auth.routers.js";
import rolesRouter from "./routers/roles.routers.js";
import cors from "cors";
import categoryRoutes from './routers/category.routers.js';
import { PrismaClient } from './generated/prisma/index.js';
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// Configurar Prisma con manejo de errores
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Función para probar la conexión a la base de datos
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos exitosa');
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message);
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Configurada' : 'No configurada');
  }
}

// Probar conexión al iniciar
testDatabaseConnection();

app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

app.use("/api/users", userRouter);

app.use("/api/products", productRouter);

app.use("/api/carts", cartRouter);

app.use("/api/auth", authRouter);

app.use("/api/admin", rolesRouter);

app.use('/api/categories', categoryRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const totalUsuarios = await prisma.user.count();
    const totalProductos = await prisma.product.count();
    const totalCarritos = await prisma.cart.count();
    // Agrega más métricas según tus modelos

    res.json({
      usuarios: totalUsuarios,
      productos: totalProductos,
      carritos: totalCarritos,
      // otras métricas aquí
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener datos del dashboard" });
  }
});


// Ruta catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});


export default app;