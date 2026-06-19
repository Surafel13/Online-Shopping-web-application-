import express from "express"
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "./product.controller.js"
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { restrictTo } from "../../middleware/role.middleware.js";
import { upload } from "../../config/multer.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createProductSchema } from "./product.validation.js";

const productRoute = express.Router();

productRoute.post("/", 
    upload.array("image", 5),
    validate(createProductSchema),
    createProduct)   



productRoute.get("/", getAllProducts)
productRoute.get("/:id", getProductById)
productRoute.put("/:id", authMiddleware, restrictTo("admin"), updateProduct)
productRoute.delete("/:id", authMiddleware, restrictTo("admin"), deleteProduct)

export default productRoute;