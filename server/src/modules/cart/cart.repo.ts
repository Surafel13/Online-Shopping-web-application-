import Cart from "../../database/cart.model.js";
import type { HydratedDocument } from "mongoose";
import type { ICart } from "../../interface/cart.interface.js";

export class CartRepository {
  async createCart(cartData: ICart) {
    return await Cart.create(cartData);
  }

  async getCartByUserId(userId: string) {
    return await Cart.findOne({ userId });
  }

  async getCartById(cartId: string) {
    return await Cart.findById(cartId);
  }

  async saveCart(cart: HydratedDocument<ICart>) {
    return await cart.save();
  }

  async deleteCart(cartId: string) {
    return await Cart.findByIdAndDelete(cartId);
  }

  async clearCart(cartId: string) {
    return await Cart.findByIdAndUpdate(
      cartId,
      {
        items: [],
        totalAmount: 0,
        totalItems: 0,
      },
      { new: true }
    );
  }

  async getAllCarts() {
    return await Cart.find();
  }
}