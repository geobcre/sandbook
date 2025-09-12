import express from "express";
import userRouter from "./routers/user.routers.js";
import productRouter from "./routers/product.routers.js";
import cartRouter from "./routers/cart.routers.js";
import authRouter from "./routers/auth.routers.js";
import rolesRouter from "./routers/roles.routers.js";
import cors from "cors";
import categoryRoutes from './routers/category.routers.js';


const app = express();

app.use(cors()); // Habilita CORS para todas las rutas
app.use(express.json());

app.use("/api/users", userRouter);

app.use("/api/products", productRouter);

app.use("/api/carts", cartRouter);

app.use("/api/auth", authRouter);

app.use("/api/admin", rolesRouter);

app.use('/api/categories', categoryRoutes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

export default app;