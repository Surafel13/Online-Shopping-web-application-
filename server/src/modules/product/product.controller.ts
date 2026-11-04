import { ProductService } from "./product.service.js";
import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";

const productService = new ProductService();

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
    const files = Array.isArray(req.files) ? req.files : [];
    const imagePaths = files.map((file) => file.path);
    const productData = {
        ...req.body,
        images: imagePaths
    }

    const result = await productService.createProduct(productData);
    res.status(201).json({ success: true, data: result });
});

export const getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const result = await productService.getAllProducts();
    res.status(200).json({ success: true, data: result });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id as string;
    const result = await productService.getProductById(productId);
    res.status(200).json({ success: true, data: result });
});


export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id as string;
    const files = Array.isArray(req.files) ? req.files : [];
    const productData = files.length > 0
      ? { ...req.body, images: files.map((file) => file.path) }
      : req.body;
    const result = await productService.updateProduct(productId, productData);
    res.status(200).json({ success: true, data: result });

});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id as string;
    await productService.deleteProduct(productId);
    res.status(204).json({ success: true, message: "Product deleted successfully" });
});
