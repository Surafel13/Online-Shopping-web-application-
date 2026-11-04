import { Types } from "mongoose";
import { AppError } from "../../utils/appError.utils.js";
import { OrderRepository } from "./order.repo.js";
import { UserProfileRepository } from "../users/user.repo.js";
import { CartRepository } from "../cart/cart.repo.js";
import type { IOrder } from "../../interface/order.interface.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "./order.validation.js";

export class OrderService {
  private orderRepo = new OrderRepository();
  private userRepo = new UserProfileRepository();
  private cartRepo = new CartRepository();

  async createOrder(userId: string, addressId: string, paymentMethod: string) {
    const validatedInput = createOrderSchema.parse({ addressId, paymentMethod });
    addressId = validatedInput.addressId;
    paymentMethod = validatedInput.paymentMethod;

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
      (address) => address._id?.toString() === addressId,
    );

    if (!selectedAddress) {
      throw new AppError("Address not found", 404);
    }

    const cart = await this.cartRepo.getCartByUserId(userId);

    if (!cart) {
      throw new AppError("Cart not found", 404);
    }

    if (cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    const orderData: IOrder = {
      userId: new Types.ObjectId(userId),

      items: cart.items,

      totalAmount: cart.totalAmount,

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

    const order = await this.orderRepo.createOrder(orderData);

    await this.cartRepo.clearCart(cart._id.toString());

    return order;
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

    updateOrderStatusSchema.parse({orderStatus , });

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
    
    updatePaymentStatusSchema.parse({paymentStatus, });

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
