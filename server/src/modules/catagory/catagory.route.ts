import express from "express";
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from "./catagory.controller.js"
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { restrictTo } from "../../middleware/role.middleware.js";

const catagoryRoute = express.Router();

catagoryRoute.post("/", authMiddleware, restrictTo("admin"), createCategory)
catagoryRoute.get("/", getAllCategories)
catagoryRoute.get("/:id", getCategoryById)
catagoryRoute.put("/:id", authMiddleware, restrictTo("admin"), updateCategory)
catagoryRoute.delete("/:id", authMiddleware, restrictTo("admin"), deleteCategory)

export default catagoryRoute;