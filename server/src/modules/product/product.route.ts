import express from "express"
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "./product.controller.js"
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { restrictTo } from "../../middleware/role.middleware.js";

const productRoute = express.Router();

productRoute.post("/",authMiddleware, restrictTo("admin"), createProduct)   
productRoute.get("/", getAllProducts)
productRoute.get("/:id", getProductById)
productRoute.put("/:id", authMiddleware, restrictTo("admin"), updateProduct)
productRoute.delete("/:id", authMiddleware, restrictTo("admin"), deleteProduct)

export default productRoute;