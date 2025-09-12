import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecreto";

// Middleware para autenticar usuarios
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: "Token de acceso requerido" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token inválido" });
    }
    req.user = user; // Establecer el usuario en req.user
    next();
  });
};

// Middleware para verificar si es admin
export const isAdmin = (req, res, next) => {
  const user = req.user;
  if (user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Acceso denegado. Se requiere rol de administrador" });
  }
  next();
};