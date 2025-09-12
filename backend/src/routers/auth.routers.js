import { Router } from "express";
import { register, login } from "../controllers/user.controller.js"; // tu controller actualizado

const router = Router();

// Endpoints de auth
router.post("/register", register);
router.post("/login", login);

export default router;