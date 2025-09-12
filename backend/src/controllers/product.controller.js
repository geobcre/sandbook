import { PrismaClient } from "../generated/prisma/client.js";


const prisma = new PrismaClient()

export const createProduct = async(req, res) => {
try {
    const{name, description, price, stock, imageUrl, categoryId} = req.body
    const product = await prisma.product.create({
        data: {
          name, 
          description, 
          price: parseFloat(price), 
          stock: parseInt(stock), 
          imageUrl,
          categoryId: categoryId ? parseInt(categoryId) : null
        },
        include: {
          category: true
        }
    })
    res.json(product)

}catch(error){
    res.status(500).json({ message: error.message });
}
}

export const getProduct = async (req, res) => {
    try{
        const { category } = req.query;
        const whereClause = category ? { categoryId: parseInt(category) } : {};
        
        const products = await prisma.product.findMany({
          where: whereClause,
          include: {
            category: true
          }
        });
        res.json(products);
    }catch(error){
        res.status(500).json({ message: error.message });
}
    }


export const getProductById = async (req, res) => {
    try{
        const product = await prisma.product.findUnique({
            where: {id: parseInt(req.params.id)}
        }) 
        
if (!product) return res.status(404).json({ message: "Producto no encontrado" });
        res.json(product)

    }catch(error){
        res.status(500).json({ message: error.message });
    }
    }


    export const updateProduct = async (req,res) => {
        try{
            const{name, description, price, stock, imageUrl, categoryId} = req.body
            const product = await prisma.product.update({
                where: {id: parseInt(req.params.id)},
                data: {
                  name, 
                  description, 
                  price: parseFloat(price), 
                  stock: parseInt(stock), 
                  imageUrl,
                  categoryId: categoryId ? parseInt(categoryId) : null
                },
                include: {
                  category: true
                }
            })
            res.json(product)

        }catch(error){
            res.status(500).json({ message: error.message });
    }
        }
    


        export const deleteProduct = async (req,res) => {
            try{
                await prisma.product.delete({
                    where: {id: parseInt(req.params.id)}

                })
                res.json({message: "Producto eliminado :)"})


            }catch(error){
                res.status(500).json({ message: error.message });

            }
        }