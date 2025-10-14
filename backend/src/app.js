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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const prisma = new PrismaClient();

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
  res.send("Hello World");
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