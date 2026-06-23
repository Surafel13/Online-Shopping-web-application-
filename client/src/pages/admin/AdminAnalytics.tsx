import { useEffect, useMemo, useState } from 'react';
import { PageTransition } from '../../components/layout/PageTransition';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { AdminLoadingState } from '../../components/shared/AdminLoadingState';
import { orderService } from '../../services';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';
import { showError } from '../../redux/slices/uiSlice';
import { getApiErrorMessage } from '../../lib/errors';
import type { ApiUser } from '../../types/api';

const staggerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.5 } },
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function AdminAnalytics() {
  const dispatch = useDispatch<AppDispatch>();
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof orderService.getAll>>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderService.getAll()
      .then(setOrders)
      .catch((error) => dispatch(showError(getApiErrorMessage(error, 'Failed to load analytics.'))))
      .finally(() => setIsLoading(false));
  }, [dispatch]);

  const salesData = useMemo(() => {
    return DAYS.map((name, index) => ({
      name,
      online: orders
        .filter((order) => order.createdAt && new Date(order.createdAt).getDay() === (index + 1) % 7)
        .reduce((sum, order) => sum + order.totalAmount, 0),
      retail: 0,
    }));
  }, [orders]);

  const growthData = useMemo(() => {
    const customerCounts = MONTHS.map((name) => ({ name, users: 0 }));
    const seen = new Set<string>();

    orders.forEach((order) => {
      if (!order.createdAt) return;
      const user = typeof order.userId === 'object' ? (order.userId as ApiUser) : null;
      if (!user) return;
      const monthIndex = new Date(order.createdAt).getMonth();
      if (!seen.has(user._id)) {
        seen.add(user._id);
        customerCounts[monthIndex].users += 1;
      }
    });

    let cumulative = 0;
    return customerCounts.map((entry) => {
      cumulative += entry.users;
      return { name: entry.name, users: cumulative };
    });
  }, [orders]);

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">Deep dive into your store's metrics and growth.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 bg-background"><Calendar className="h-4 w-4" /> Last 30 Days</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 gap-2"><Download className="h-4 w-4" /> Export Report</Button>
          </div>
        </div>

        {isLoading ? (
          <AdminLoadingState message="Loading analytics..." />
        ) : (
        <motion.div variants={staggerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={staggerVariants} className="bg-card border rounded-xl shadow-sm p-6 flex flex-col h-[400px]">
            <div className="mb-6">
              <h3 className="text-lg font-semibold tracking-tight">Sales Trends</h3>
              <p className="text-sm text-muted-foreground">Online vs Retail performance.</p>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="online" fill="#2563eb" radius={[4, 4, 0, 0]} animationDuration={1500} />
                  <Bar dataKey="retail" fill="#93c5fd" radius={[4, 4, 0, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={staggerVariants} className="bg-card border rounded-xl shadow-sm p-6 flex flex-col h-[400px]">
            <div className="mb-6">
              <h3 className="text-lg font-semibold tracking-tight">Customer Growth</h3>
              <p className="text-sm text-muted-foreground">Cumulative active users over time.</p>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
