import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient();

export const createCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const newCart = await prisma.cart.create({
      data: { userId: parseInt(userId) },
    });
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await prisma.cart.findFirst({
      where: { userId: parseFloat(userId) },
      include: { items: { include: { product: true } } },
    });

    if (!cart)
      return res.status(404).json({ message: "Carrito no encontrado" });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addProductToCart = async (req, res) => {
  try {
    // Cambiamos: ahora recibimos userId en lugar de cartId
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || !quantity) {
      return res
        .status(400)
        .json({ message: "userId, productId y quantity son requeridos" });
    }

    // 1. Encontrar o crear el carrito del usuario
    let cart = await prisma.cart.findFirst({
      where: { userId: parseInt(userId) },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: parseInt(userId) },
      });
    }

    const cartId = cart.id;

    // 2. Verificar si el producto ya está en el carrito
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cartId,
        productId: parseInt(productId),
      },
    });

    if (existingItem) {
      // Si existe, actualizar la cantidad
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parseInt(quantity) },
      });
      return res.json(updatedItem);
    } else {
      // Si no existe, crear un nuevo item en el carrito
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cartId,
          productId: parseInt(productId),
          quantity: parseInt(quantity),
        },
      });
      res.status(201).json(newItem);
    }
  } catch (error) {
    // Usamos console.error para un mejor log en el backend
    console.error("Error en addProductToCart:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const updateItem = await prisma.cartItem.update({
      where: { id: parseInt(itemId) },
      data: { quantity: parseInt(quantity) },
    });
    res.json(updateItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeProductFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: "itemId es requerido" });
    }

    const parsedItemId = parseInt(itemId);

    if (isNaN(parsedItemId)) {
      return res
        .status(400)
        .json({ message: "itemId debe ser un número válido" });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: { id: parsedItemId },
    });

    if (!existingItem) {
      return res
        .status(404)
        .json({ message: "Item del carrito no encontrado" });
    }

    await prisma.cartItem.delete({
      where: { id: parsedItemId },
    });

    res.json({ message: "Producto eliminado del carrito ):" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};