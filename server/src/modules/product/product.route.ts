import express from "express"
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "./product.controller.js"

const productRoute = express.Router();

productRoute.post("/", createProduct)   
productRoute.get("/", getAllProducts)
productRoute.get("/:id", getProductById)
productRoute.put("/:id", updateProduct)
productRoute.delete("/:id", deleteProduct)

export default productRoute;