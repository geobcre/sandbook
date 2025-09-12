import { Router } from "express";
import { authenticateToken, isAdmin } from "../middlewares/auth.js";
import { createProduct, updateProduct, deleteProduct } from "../controllers/product.controller.js";

const router = Router();

// Rutas protegidas que requieren autenticación y rol de admin
router.post("/", authenticateToken, isAdmin, createProduct);
router.put("/:id", authenticateToken, isAdmin, updateProduct);
router.delete("/:id", authenticateToken, isAdmin, deleteProduct);

export default router;