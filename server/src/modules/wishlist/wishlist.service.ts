import mongoose from "mongoose";
import { WishlistRepository } from "./wishlist.repo.js";
import Users from "../../database/users.model.js";
import Product from "../../database/product.model.js";
import { AppError } from "../../utils/appError.utils.js";
import {
  addToWishlistSchema,
  removeFromWishlistSchema,
  objectIdSchema,
} from "./wishlist.validation.js";

export class WishlistService {
  constructor(private repo = new WishlistRepository()) {}

  private toObjectId(id: string) {
    return new mongoose.Types.ObjectId(id);
  }

  async getWishlist(userId: string) {
    const validUserId = objectIdSchema.parse(userId);

    const user = await Users.findById(validUserId);
    if (!user) throw new AppError("User not found", 404);

    let wishlist = await this.repo.findByUser(this.toObjectId(validUserId));

    if (!wishlist) {
      wishlist = await this.repo.create(this.toObjectId(validUserId));
    }

    return wishlist;
  }

  async addToWishlist(userId: string, productId: string) {
    const validUserId = objectIdSchema.parse(userId);
    const { productId: validProductId } = addToWishlistSchema.parse({
      productId,
    });

    const user = await Users.findById(validUserId);
    if (!user) throw new AppError("User not found", 404);

    const product = await Product.findById(validProductId);
    if (!product) throw new AppError("Product not found", 404);

    return this.repo.add(
      this.toObjectId(validUserId),
      this.toObjectId(validProductId)
    );
  }

  async removeFromWishlist(userId: string, productId: string) {
    const validUserId = objectIdSchema.parse(userId);
    const { productId: validProductId } = removeFromWishlistSchema.parse({
      productId,
    });

    const user = await Users.findById(validUserId);
    if (!user) throw new AppError("User not found", 404);

    const product = await Product.findById(validProductId);
    if (!product) throw new AppError("Product not found", 404);

    return this.repo.remove(
      this.toObjectId(validUserId),
      this.toObjectId(validProductId)
    );
  }

  async clearWishlist(userId: string) {
    const validUserId = objectIdSchema.parse(userId);

    const user = await Users.findById(validUserId);
    if (!user) throw new AppError("User not found", 404);

    return this.repo.clear(this.toObjectId(validUserId));
  }
}