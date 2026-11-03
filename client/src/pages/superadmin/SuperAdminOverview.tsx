import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Users,
  ShieldCheck,
  Package,
  Clock,
  AlertTriangle,
  PackageX,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { AdminLoadingState } from "../../components/shared/AdminLoadingState";
import { Button } from "../../components/ui/button";
import { superAdminService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { formatOrderDate } from "../../lib/mappers";
import {
  SUPER_ADMIN_NAV,
  superAdminPath,
} from "../../features/superadmin/navigation";
import type {
  ApiOrder,
  ApiUser,
  SuperAdminOverview as OverviewData,
} from "../../types/api";

const ORDER_STATUS_STYLES: Record<
  ApiOrder["orderStatus"],
  { cls: string; label: string }
> = {
  pending: { cls: "bg-yellow-100 text-yellow-700", label: "Pending" },
  processing: { cls: "bg-blue-100 text-blue-700", label: "Processing" },
  shipped: { cls: "bg-indigo-100 text-indigo-700", label: "Shipped" },
  delivered: { cls: "bg-green-100 text-green-700", label: "Delivered" },
  cancelled: { cls: "bg-red-100 text-red-700", label: "Cancelled" },
};

const ROLE_STYLES: Record<ApiUser["role"], string> = {
  customer: "bg-slate-100 text-slate-700",
  admin: "bg-indigo-100 text-indigo-700",
  super_admin: "bg-purple-100 text-purple-700",
};

const money = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export function SuperAdminOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const overview = await superAdminService.getOverview();
        if (cancelled) return;
        setData(overview);
        setError(null);
      } catch (err) {
        if (!cancelled)
          setError(getApiErrorMessage(err, "Failed to load overview."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const handleRefresh = () => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  const statCards = useMemo(() => {
    if (!data) return [];
    const { stats } = data;
    return [
      {
        label: "Total Revenue",
        value: money(stats.totalRevenue),
        icon: DollarSign,
        color: "text-blue-600 bg-blue-100 dark:bg-blue-900/20",
      },
      {
        label: "Total Orders",
        value: stats.totalOrders.toLocaleString(),
        icon: ShoppingCart,
        color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20",
      },
      {
        label: "Total Users",
        value: stats.totalUsers.toLocaleString(),
        icon: Users,
        color: "text-violet-600 bg-violet-100 dark:bg-violet-900/20",
      },
      {
        label: "Administrators",
        value: stats.totalAdmins.toLocaleString(),
        icon: ShieldCheck,
        color: "text-purple-600 bg-purple-100 dark:bg-purple-900/20",
      },
      {
        label: "Products",
        value: stats.totalProducts.toLocaleString(),
        icon: Package,
        color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/20",
      },
      {
        label: "Pending Orders",
        value: stats.pendingOrders.toLocaleString(),
        icon: Clock,
        color: "text-amber-600 bg-amber-100 dark:bg-amber-900/20",
      },
      {
        label: "Low Stock",
        value: stats.lowStockProducts.toLocaleString(),
        icon: AlertTriangle,
        color: "text-orange-600 bg-orange-100 dark:bg-orange-900/20",
      },
      {
        label: "Out of Stock",
        value: stats.outOfStockProducts.toLocaleString(),
        icon: PackageX,
        color: "text-rose-600 bg-rose-100 dark:bg-rose-900/20",
      },
    ];
  }, [data]);

  if (isLoading && !data) {
    return (
      <PageTransition>
        <AdminLoadingState message="Loading super admin dashboard..." />
      </PageTransition>
    );
  }

  if (error && !data) {
    return (
      <PageTransition>
        <div className="max-w-md mx-auto py-24 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-lg mb-1">
            Unable to load dashboard
          </h3>
          <p className="text-sm text-muted-foreground mb-5">{error}</p>
          <Button
            onClick={handleRefresh}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-2" /> Try again
          </Button>
        </div>
      </PageTransition>
    );
  }

  if (!data) return null;

  const quickLinks = SUPER_ADMIN_NAV.filter((item) => item.slug !== "overview");

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold tracking-tight">
              Super Admin Overview
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Platform-wide view of users, sales, catalog and inventory health.
            </p>
          </motion.div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="gap-2 bg-background"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </h3>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Chart + quick access */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="xl:col-span-2 bg-card border rounded-xl shadow-sm p-6 h-[380px] flex flex-col"
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold tracking-tight">
                Revenue Over Time
              </h3>
              <p className="text-sm text-muted-foreground">
                Monthly gross revenue for {new Date().getFullYear()} (excluding
                cancelled orders).
              </p>
            </div>
            <div className="flex-1 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.monthlyRevenue}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="saRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${v / 1000}k` : `$${v}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                    itemStyle={{ color: "#111827", fontWeight: 600 }}
                    formatter={(value) => [
                      `$${Number(value ?? 0).toLocaleString()}`,
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#saRevenue)"
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card border rounded-xl shadow-sm p-6 h-[380px] flex flex-col"
          >
            <h3 className="text-lg font-semibold tracking-tight mb-4">
              Quick Access
            </h3>
            <div className="flex-1 overflow-y-auto -mx-2 pr-1 space-y-0.5">
              {quickLinks.map((item) => (
                <Link
                  key={item.slug}
                  to={superAdminPath(item.slug)}
                  className="group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="h-8 w-8 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-sm font-medium truncate">
                    {item.name}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent orders + recent users */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-muted/10">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  Recent Orders
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Latest activity across the platform.
                </p>
              </div>
              <Link to={superAdminPath("orders")}>
                <Button variant="outline" size="sm" className="h-8">
                  View All
                </Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.recentOrders.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-10 text-center text-muted-foreground"
                      >
                        No orders yet.
                      </td>
                    </tr>
                  )}
                  {data.recentOrders.map((order) => {
                    const customer =
                      typeof order.userId === "object" ? order.userId : null;
                    const status = ORDER_STATUS_STYLES[order.orderStatus];
                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-muted/40 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-medium text-xs">
                          ORD-{order._id.slice(-4).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {customer?.username || "Customer"}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {formatOrderDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.cls}`}
                          >
                            {order.orderStatus === "delivered" ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <Clock className="h-3 w-3" />
                            )}
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold">
                          ${order.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-muted/10">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">
                  New Users
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Most recent sign-ups.
                </p>
              </div>
              <Link to={superAdminPath("users")}>
                <Button variant="outline" size="sm" className="h-8">
                  View All
                </Button>
              </Link>
            </div>
            <div className="divide-y flex-1">
              {data.recentUsers.length === 0 && (
                <p className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No users yet.
                </p>
              )}
              {data.recentUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 px-6 py-4"
                >
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${ROLE_STYLES[user.role]}`}
                  >
                    {user.role.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
