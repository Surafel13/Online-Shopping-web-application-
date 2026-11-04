import Product from "../../database/product.model.js";
import type { IProduct } from "../../interface/product.interface.js";

export class ProductRepo {
  async createProduct(productData: IProduct) {
    return await Product.create(productData);
  }

  async getAllProducts() {
    return await Product.find();
  }

  async getProductById(productId: string) {
    return await Product.findById(productId);
  }

  async updateProduct(productId: string, productData: Partial<IProduct>) {
    return await Product.findByIdAndUpdate(productId, productData, {
      new: true,
    });
  }

  async deleteProduct(productId: string) {
    return await Product.findByIdAndDelete(productId);
  }

  async findById(productId: string) {
    return await Product.findById(productId);
  }


  async updateRating(productId: string, rating: number, reviewCount: number) {
    return await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          rating,
          reviewCount,
        },
      },
      { new: true },
    );
  }
}

export default new ProductRepo();
