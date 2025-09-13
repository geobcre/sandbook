import { PrismaClient } from "../generated/prisma/client.js";
import { hashPassword } from "../utils/hashPassword.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

// ==================== REGISTER ====================
export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está en uso" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: "USER", // por defecto
      },
    });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(201).json({ message: "User created successfully", user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== LOGIN ====================
export const login = async (req, res) => {
  try {
    console.log("=== LOGIN DEBUG ===");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("Content-Type:", req.headers["content-type"]);

    const { email, password } = req.body;

    if (!email || !password) {
      console.log(
        ":x: Validación fallida - email:",
        email,
        "password:",
        password,
      );
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ message: "Credenciales inválidas" });

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({ message: "Login exitoso", user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true, // Añadido para que se muestre en el frontend
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    
    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Cart: {
          include: {
            items: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    
    // Eliminar en cascada: primero los items del carrito, luego los carritos, y finalmente el usuario
    await prisma.$transaction(async (tx) => {
      // Eliminar todos los elementos de los carritos del usuario
      for (const cart of user.Cart) {
        await tx.cartItem.deleteMany({
          where: { cartId: cart.id }
        });
      }
      
      // Eliminar todos los carritos del usuario
      await tx.cart.deleteMany({
        where: { userId: userId }
      });
      
      // Finalmente, eliminar el usuario
      await tx.user.delete({
        where: { id: userId }
      });
    });
    
    res.status(200).json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, password, role } = req.body;

    const dataUpdate = {};

    if (email) dataUpdate.email = email;
    if (name) dataUpdate.name = name;
    if (password) dataUpdate.password = await hashPassword(password);
    if (role) {
      // Validar que el rol sea uno de los permitidos (p. ej., USER o ADMIN)
      if (["USER", "ADMIN"].includes(role)) {
        dataUpdate.role = role;
      } else {
        return res.status(400).json({ message: "Rol no válido." });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataUpdate,

      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};