import { cartService } from './cartService';
import { orderService } from './orderService';
import { productService } from './productService';
import { userService } from './userService';
import type { ApiUser } from '../types/api';

export interface AdminDashboardStats {
  revenue: number;
  orderCount: number;
  customerCount: number;
  productCount: number;
  avgOrderValue: number;
  activeCarts: number;
}

export const adminService = {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [orders, products, users, carts] = await Promise.all([
      orderService.getAll(),
      productService.getAll(),
      userService.getAllUsers(),
      cartService.getAllCarts(),
    ]);

    const revenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const customerCount = users.filter((user: ApiUser) => user.role === 'customer').length;

    return {
      revenue,
      orderCount: orders.length,
      customerCount,
      productCount: products.length,
      avgOrderValue: orders.length ? revenue / orders.length : 0,
      activeCarts: carts.filter((cart) => cart.items.length > 0).length,
    };
  },
};
