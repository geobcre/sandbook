import Router from "express";
import { createCart,getCartByUser, addProductToCart, updateCartItem, removeProductFromCart } from "../controllers/cart.controler.js";

const router = Router()


// crear carrito 

router.post("/",createCart)


// obtener carrito

router.get("/:userId",getCartByUser)


//agregar producto al carrito

router.post("/add",addProductToCart)

//actualizar carrito

router.put("/update",updateCartItem)

//borrar carrito 

router.delete("/remove",removeProductFromCart)


export default router