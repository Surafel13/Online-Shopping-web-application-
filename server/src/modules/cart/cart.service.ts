import { CartRepository } from "./cart.repo.js";
import { AppError } from "../../utils/appError.utils.js";
import Product from "../../database/product.model.js";
import { Types } from "mongoose";

export class CartService {
  private cartRepo = new CartRepository();

  async addItemToCart(
    userId: string,
    productId: string,
    quantity: number
  ) {
    this.validateQuantity(quantity);
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      throw new AppError("Product not found", 404);
    }

    let cart = await this.cartRepo.getCartByUserId(userId);

    if (!cart) {
      cart = await this.cartRepo.createCart({
        userId: new Types.ObjectId(userId),
        items: [],
        totalAmount: 0,
        totalItems: 0,
      });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    const updatedQuantity = (existingItem?.quantity ?? 0) + quantity;
    if (updatedQuantity > product.stock) {
      throw new AppError("Requested quantity exceeds available stock.", 400);
    }

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId: product._id,
        quantity,
        price: product.finalPrice ?? product.price,
      });
    }

    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    return await this.cartRepo.saveCart(cart);
  }

  async getCartByUserId(userId: string) {
    const cart = await this.cartRepo.getCartByUserId(userId);

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    return cart;
  }

  async getCartById(cartId: string) {
    const cart = await this.cartRepo.getCartById(cartId);

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    return cart;
  }

  async removeItemFromCart(userId: string, productId: string) {
    const cart = await this.cartRepo.getCartByUserId(userId);

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    return await this.cartRepo.saveCart(cart);
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    quantity: number
  ) {
    this.validateQuantity(quantity);
    const cart = await this.cartRepo.getCartByUserId(userId);

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (!item) {
      throw new AppError("Item not found in cart", 404);
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      throw new AppError("Product not found", 404);
    }
    if (quantity > product.stock) {
      throw new AppError("Requested quantity exceeds available stock.", 400);
    }

    item.quantity = quantity;

    cart.totalItems = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );

    cart.totalAmount = cart.items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );

    return await this.cartRepo.saveCart(cart);
  }

  async clearCart(cartId: string) {
    const cart = await this.cartRepo.getCartById(cartId);

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    return await this.cartRepo.clearCart(cartId);
  }

  async deleteCart(cartId: string) {
    const cart = await this.cartRepo.getCartById(cartId);

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    return await this.cartRepo.deleteCart(cartId);
  }

  async getAllCarts() {
    return await this.cartRepo.getAllCarts();
  }

  private validateQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError("Quantity must be a positive whole number.", 400);
    }
  }
}