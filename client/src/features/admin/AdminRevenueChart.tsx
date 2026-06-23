import { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { orderService } from '../../services';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function AdminRevenueChart() {
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof orderService.getAll>>>([]);

  useEffect(() => {
    orderService.getAll().then(setOrders);
  }, []);

  const data = useMemo(() => {
    const totals = MONTHS.map((name) => ({ name, revenue: 0 }));
    orders.forEach((order) => {
      if (!order.createdAt) return;
      const monthIndex = new Date(order.createdAt).getMonth();
      totals[monthIndex].revenue += order.totalAmount;
    });
    return totals;
  }, [orders]);

  const formatYAxis = (tickItem: number) => `$${tickItem / 1000}k`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="w-full h-[350px] bg-card rounded-xl border p-6 shadow-sm flex flex-col"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Revenue Over Time</h3>
          <p className="text-sm text-muted-foreground">Monthly gross volume for the year.</p>
        </div>
        <select className="border text-sm rounded-md px-3 py-1.5 bg-transparent">
          <option>2024</option>
          <option>2023</option>
        </select>
      </div>
      
      <div className="flex-1 w-full h-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#111827', fontWeight: 600 }}
              formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, 'Revenue']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRev)"
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
