import express from "express";
import { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } from "./catagory.controller.js"

const catagoryRoute = express.Router();

catagoryRoute.post("/", createCategory)
catagoryRoute.get("/", getAllCategories)
catagoryRoute.get("/:id", getCategoryById)
catagoryRoute.put("/:id", updateCategory)
catagoryRoute.delete("/:id", deleteCategory)

export default catagoryRoute;