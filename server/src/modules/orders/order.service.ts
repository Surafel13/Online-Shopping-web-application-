import { Types } from "mongoose";
import { AppError } from "../../utils/appError.utils.js";
import { OrderRepository } from "./order.repo.js";
import { UserProfileRepository } from "../users/user.repo.js";
import Product from "../../database/product.model.js";
import type { IOrder } from "../../interface/order.interface.js";
import {
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  type OrderLineInput,
} from "./order.validation.js";

export class OrderService {
  private orderRepo = new OrderRepository();
  private userRepo = new UserProfileRepository();

  /**
   * Builds order lines from the client's cart using authoritative catalog data:
   * prices come from the database, stock and availability are enforced here.
   */
  private async buildOrderItems(lines: OrderLineInput[]) {
    const merged = new Map<string, number>();
    for (const line of lines) {
      merged.set(
        line.productId,
        (merged.get(line.productId) ?? 0) + line.quantity,
      );
    }

    const products = await Product.find({
      _id: { $in: [...merged.keys()] },
    }).select("name price stock isActive");
    const byId = new Map(products.map((p) => [String(p._id), p]));

    const items: IOrder["items"] = [];
    let totalCents = 0;

    for (const [productId, quantity] of merged) {
      const product = byId.get(productId);
      if (!product || product.isActive === false) {
        throw new AppError(
          "A product in your cart is no longer available",
          404,
        );
      }
      if (product.stock < quantity) {
        throw new AppError(
          product.stock > 0
            ? `Only ${product.stock} of "${product.name}" left in stock`
            : `"${product.name}" is out of stock`,
          409,
        );
      }

      items.push({
        productId: new Types.ObjectId(productId),
        quantity,
        price: product.price,
      });
      totalCents += Math.round(product.price * 100) * quantity;
    }

    return { items, totalAmount: totalCents / 100 };
  }

  async createOrder(
    userId: string,
    addressId: string,
    paymentMethod: string,
    lines: OrderLineInput[],
  ) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid User Id", 400);
    }
    if (!Types.ObjectId.isValid(addressId)) {
      throw new AppError("Invalid Address Id", 400);
    }

    const user = await this.userRepo.getProfile(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const selectedAddress = user.addresses.find(
      (address: any) => address._id?.toString() === addressId,
    );
    if (!selectedAddress) {
      throw new AppError("Address not found", 404);
    }

    const { items, totalAmount } = await this.buildOrderItems(lines);

    const orderData: IOrder = {
      userId: new Types.ObjectId(userId),
      items,
      totalAmount,
      shippingAddress: {
        street: selectedAddress.street,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postalCode: selectedAddress.postalCode,
        country: selectedAddress.country,
      },
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
    };

    return await this.orderRepo.createOrder(orderData);
  }

  async getOrderById(orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid Order Id", 400);
    }
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    return order;
  }

  async getUserOrders(userId: string) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid User Id", 400);
    }
    return await this.orderRepo.getOrdersByUserId(userId);
  }

  async getAllOrders() {
    return await this.orderRepo.getAllOrders();
  }

  async updateOrderStatus(orderId: string, orderStatus: IOrder["orderStatus"]) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid Order Id", 400);
    }
    updateOrderStatusSchema.parse({ orderStatus });
    const order = await this.orderRepo.updateOrderStatus(orderId, orderStatus);
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    return order;
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: IOrder["paymentStatus"],
  ) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid Order Id", 400);
    }
    updatePaymentStatusSchema.parse({ paymentStatus });
    const order = await this.orderRepo.updatePaymentStatus(
      orderId,
      paymentStatus,
    );
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    return order;
  }

  async deleteOrder(orderId: string) {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError("Invalid Order Id", 400);
    }
    const order = await this.orderRepo.deleteOrder(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }
    return order;
  }
}
