import { Wishlist } from "../../database/wishlist.model.js";
import type { Types } from "mongoose";

export class WishlistRepository {
  async findByUser(userId: Types.ObjectId) {
    return Wishlist.findOne({ userId }).populate("products");
  }

  async create(userId: Types.ObjectId) {
    return Wishlist.create({ userId, products: [] });
  }

  async add(userId: Types.ObjectId, productId: Types.ObjectId) {
    return Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { products: productId } },
      { new: true, upsert: true }
    );
  }

  async remove(userId: Types.ObjectId, productId: Types.ObjectId) {
    return Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { products: productId } },
      { new: true }
    );
  }

  async clear(userId: Types.ObjectId) {
    return Wishlist.findOneAndUpdate(
      { userId },
      { $set: { products: [] } },
      { new: true }
    );
  }
}