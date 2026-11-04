import { ProductRepo } from "./product.repo.js";
import { AppError } from "../../utils/appError.utils.js";
import { Types } from "mongoose";
import {
  createProductSchema,
  updateProductSchema,
} from "./product.validation.js";
import Catagory from "../../database/catagory.model.js";
import { randomUUID } from "node:crypto";
import type { IProduct } from "../../interface/product.interface.js";

export class ProductService {
  private productRepo = new ProductRepo();
  async createProduct(productData: unknown) {
    const validation = createProductSchema.parse(productData);
    if (!Types.ObjectId.isValid(validation.category)) {
      throw new AppError("Invalid Category Id", 400);
    }
    const categoryExists = await Catagory.findById(validation.category);
    if (!categoryExists) {
      throw new AppError("Category not found", 404);
    }
    const sku = `PRD-${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
    const slugBase = validation.name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "product";
    const product: IProduct = {
      ...validation,
      category: new Types.ObjectId(validation.category),
      slug: `${slugBase}-${sku.slice(-12).toLowerCase()}`,
      sku,
      lowStockThreshold: 5,
      isFeatured: false,
      isActive: true,
    };
    const result = await this.productRepo.createProduct(product);
    return result;
  }

  async getAllProducts() {
    const result = await this.productRepo.getAllProducts();
    return result;
  }

  async getProductById(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid Object Id", 400);
    }
    const result = await this.productRepo.getProductById(productId);
    if (!result) {
      throw new AppError("Product not found", 404);
    }
    return result;
  }

  async updateProduct(productId: string, productData: unknown) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid Object Id", 400);
    }
    const validation = updateProductSchema.parse(productData);
    const { category } = validation;
    let categoryId: Types.ObjectId | undefined;
    if (category !== undefined) {
      if (!Types.ObjectId.isValid(category)) {
        throw new AppError("Invalid Category Id", 400);
      }
      const categoryExists = await Catagory.findById(category);
      if (!categoryExists) {
        throw new AppError("Category not found", 404);
      }
      categoryId = new Types.ObjectId(category);
    }
    const productDataToUpdate: Partial<IProduct> = {};
    if (validation.name !== undefined) productDataToUpdate.name = validation.name;
    if (validation.description !== undefined) {
      productDataToUpdate.description = validation.description;
    }
    if (validation.price !== undefined) productDataToUpdate.price = validation.price;
    if (validation.purchasePrice !== undefined) {
      productDataToUpdate.purchasePrice = validation.purchasePrice;
    }
    if (validation.stock !== undefined) productDataToUpdate.stock = validation.stock;
    if (validation.images !== undefined) productDataToUpdate.images = validation.images;
    if (categoryId !== undefined) productDataToUpdate.category = categoryId;
    const result = await this.productRepo.updateProduct(productId, productDataToUpdate);
    if (!result) {
      throw new AppError("Product not found", 404);
    }
    return result;
  }

  async deleteProduct(productId: string) {
    if (!Types.ObjectId.isValid(productId)) {
      throw new AppError("Invalid Object Id", 400);
    }
    const result = await this.productRepo.deleteProduct(productId);
    if (!result) {
      throw new AppError("Product not found", 404);
    }
    return result;
  }
}
