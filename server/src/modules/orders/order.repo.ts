import Order from "../../database/order.model.js";
import type { IOrder } from "../../interface/order.interface.js";

export class OrderRepository {
  async createOrder(orderData: IOrder) {
    return await Order.create(orderData);
  }

  async getOrderById(orderId: string) {
    return await Order.findById(orderId)
      .populate("userId", "-password")
      .populate("items.productId");
  }

  async getOrdersByUserId(userId: string) {
    return await Order.find({ userId }).populate("items.productId");
  }

  async getAllOrders() {
    return await Order.find()
      .populate("userId", "-password")
      .populate("items.productId");
  }

  async updateOrderStatus(orderId: string, orderStatus: IOrder["orderStatus"]) {
    return await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true },
    );
  }

  async updatePaymentStatus(
    orderId: string,
    paymentStatus: IOrder["paymentStatus"],
  ) {
    return await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true },
    );
  }

  async deleteOrder(orderId: string) {
    return await Order.findByIdAndDelete(orderId);
  }
}
