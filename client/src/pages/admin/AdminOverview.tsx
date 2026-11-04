import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../../components/layout/PageTransition';
import { AdminRevenueChart } from '../../features/admin/AdminRevenueChart';
import { AdminRecentOrders } from '../../features/admin/AdminRecentOrders';
import { AdminLoadingState } from '../../components/shared/AdminLoadingState';
import { Button } from '../../components/ui/button';
import { DollarSign, ShoppingCart, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService, orderService, productService } from '../../services';
import { getProductFromRef } from '../../lib/mappers';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';
import { showError } from '../../redux/slices/uiSlice';
import { getApiErrorMessage } from '../../lib/errors';

export function AdminOverview() {
  const dispatch = useDispatch<AppDispatch>();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    orderCount: 0,
    customerCount: 0,
    avgOrderValue: 0,
  });
  const [topPerformers, setTopPerformers] = useState<Array<{ name: string; sales: string; img: string }>>([]);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.allSettled([
          adminService.getDashboardStats(),
          orderService.getAll(),
          productService.getAll(),
        ]);

        const dashboardStats =
          statsRes.status === 'fulfilled'
            ? statsRes.value
            : {
                revenue: 0,
                orderCount: 0,
                customerCount: 0,
                avgOrderValue: 0,
              };

        const orders =
          ordersRes.status === 'fulfilled' ? ordersRes.value : [];

        const products =
          productsRes.status === 'fulfilled' ? productsRes.value : [];

        setStats({
          revenue: dashboardStats.revenue,
          orderCount: dashboardStats.orderCount,
          customerCount: dashboardStats.customerCount,
          avgOrderValue: dashboardStats.avgOrderValue,
        });

        const counts = new Map<string, { name: string; sales: number; image: string }>();

        orders.forEach((order) => {
          order.items.forEach((item) => {
            const product = getProductFromRef(item.productId);
            if (!product) return;

            const existing = counts.get(product._id) || {
              name: product.name,
              sales: 0,
              image: product.images?.[0] || '',
            };

            existing.sales += item.quantity;
            counts.set(product._id, existing);
          });
        });

        const performers = Array.from(counts.values())
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 4)
          .map((entry) => ({
            name: entry.name,
            sales: `${entry.sales} sales`,
            img: entry.image || products[0]?.images?.[0] || '',
          }));

        setTopPerformers(performers);
      } catch (error) {
        dispatch(showError(getApiErrorMessage(error, 'Failed to load dashboard data.')));
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [dispatch]);

  const statCards = useMemo(() => ([
    { label: 'Gross Revenue', value: `$${stats.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, icon: DollarSign, color: 'text-blue-600 bg-blue-100' },
    { label: 'Total Orders', value: stats.orderCount.toLocaleString(), icon: ShoppingCart, color: 'text-indigo-600 bg-indigo-100' },
    { label: 'Active Customers', value: stats.customerCount.toLocaleString(), icon: Users, color: 'text-violet-600 bg-violet-100' },
    { label: 'Avg. Order Value', value: `$${stats.avgOrderValue.toFixed(0)}`, icon: TrendingUp, color: 'text-rose-600 bg-rose-100' },
  ]), [stats]);

  if (isLoading) {
    return (
      <PageTransition>
        <AdminLoadingState message="Loading dashboard..." />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">

        <div className="flex justify-between items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground text-sm mt-1">Monitor your store's performance and recent activity.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Link to="/admin/analytics">
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20">Generate Report</Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</h3>
              <p className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AdminRevenueChart />
          </div>
          <div className="xl:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-card border rounded-xl shadow-sm p-6 h-[350px] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold tracking-tight">Top Performers</h3>
                <Link to="/admin/products" className="text-sm text-blue-600 hover:underline">View All</Link>
              </div>
              <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                {topPerformers.length > 0 ? topPerformers.map((p, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <img src={p.img} alt={p.name} className="h-10 w-10 rounded-md object-cover border group-hover:border-blue-500 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground line-clamp-1">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sales}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground">No sales data yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        <AdminRecentOrders />
      </div>
    </PageTransition>
  );
}
