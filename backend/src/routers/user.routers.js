import Router from "express";
import { authenticateToken, isAdmin } from "../middlewares/auth.js";

import {
  createUser,
  getUsers,
  getUserById,
  deleteUserById,
  updateUser,
} from "../controllers/user.controller.js";

const router = Router();

// create user - Solo admin puede crear usuarios
router.post("/", authenticateToken, isAdmin, createUser);

// get users - Solo admin puede ver todos los usuarios
router.get("/", authenticateToken, isAdmin, getUsers);

// get user by id - Solo admin puede ver usuarios específicos
router.get("/:id", authenticateToken, isAdmin, getUserById);

// delete user by id - Solo admin puede eliminar usuarios
router.delete("/:id", authenticateToken, isAdmin, deleteUserById);

// update user by id - Solo admin puede actualizar usuarios
router.put("/:id", authenticateToken, isAdmin, updateUser);

export default router;