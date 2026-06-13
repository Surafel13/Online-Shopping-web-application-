import { CatagoryService } from "./catagoty.service.js";
import type{ Request, Response } from "express";
import asyncHandler from "express-async-handler";

const catagoryService = new CatagoryService();

export const createCategory = asyncHandler(async(req: Request, res: Response) => {
    const result = await catagoryService.createCatagory(req.body);
    res.status(201).json({ success: true, data: result });
});

export const getAllCategories = asyncHandler(async(req: Request, res: Response) => {
    const result = await catagoryService.getAllCatagory();
    res.status(200).json({ success: true, data: result });
});

export const getCategoryById = asyncHandler(async(req: Request, res: Response) => {
    const categoryId = req.params.id as string;
    const result = await catagoryService.getCatagoryById(categoryId);   
    res.status(200).json({ success: true, data: result });
});

export const updateCategory = asyncHandler(async(req: Request, res: Response) => {
    const categoryId = req.params.id as string;
    const result = await catagoryService.updateCatagory(categoryId, req.body);
    res.status(200).json({ success: true, data: result });
});

export const deleteCategory = asyncHandler(async(req: Request, res: Response) => {   
    const categoryId = req.params.id as string;
    await catagoryService.deleteCatagory(categoryId);
    res.status(204).json({ success: true, message: "Category deleted successfully" });
});

