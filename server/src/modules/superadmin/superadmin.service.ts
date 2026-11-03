import Users from "../../database/users.model.js";
import Product from "../../database/product.model.js";
import Order from "../../database/order.model.js";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export class SuperAdminService {
  async getOverview() {
    const year = new Date().getFullYear();
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year + 1, 0, 1);
    const notCancelled = { orderStatus: { $ne: "cancelled" } };

    const [
      totalUsers,
      totalAdmins,
      totalProducts,
      totalOrders,
      pendingOrders,
      revenueAgg,
      monthlyAgg,
      lowStockProducts,
      outOfStockProducts,
      recentOrders,
      recentUsers,
    ] = await Promise.all([
      Users.countDocuments(),
      Users.countDocuments({ role: { $in: ["admin", "super_admin"] } }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "pending" }),
      Order.aggregate([
        { $match: notCancelled },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.aggregate([
        {
          $match: {
            ...notCancelled,
            createdAt: { $gte: yearStart, $lt: yearEnd },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$totalAmount" },
          },
        },
      ]),
      Product.countDocuments({
        $expr: {
          $and: [
            { $gt: ["$stock", 0] },
            { $lte: ["$stock", "$lowStockThreshold"] },
          ],
        },
      }),
      Product.countDocuments({ stock: { $lte: 0 } }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "username email")
        .lean(),
      Users.find().select("-password").sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    const monthlyRevenue = MONTHS.map((name, index) => ({
      name,
      revenue:
        monthlyAgg.find((entry: { _id: number }) => entry._id === index + 1)
          ?.revenue ?? 0,
    }));

    return {
      stats: {
        totalUsers,
        totalAdmins,
        totalProducts,
        totalOrders,
        pendingOrders,
        totalRevenue: revenueAgg[0]?.total ?? 0,
        lowStockProducts,
        outOfStockProducts,
      },
      monthlyRevenue,
      recentOrders,
      recentUsers,
    };
  }
}
