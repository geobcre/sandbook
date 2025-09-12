import Router from "express";


import{ createProduct, getProduct, getProductById, updateProduct, deleteProduct} from "../controllers/product.controller.js"


const router = Router();


//agregar productos


router.post("/", createProduct) 


//obtener productos

router.get("/", getProduct) 

//obtener productos por id

router.get("/:id", getProductById) 


// actualizar productos


router.put("/:id",updateProduct)

//eliminar productos


router.delete("/:id",deleteProduct)

export default router;

