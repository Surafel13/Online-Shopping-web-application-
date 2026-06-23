import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, MoreHorizontal, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { orderService } from '../../services';
import { formatOrderDate, getProductFromRef } from '../../lib/mappers';
import type { ApiOrder, ApiUser } from '../../types/api';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completed':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle2 className="h-3 w-3" /> Completed</span>;
    case 'Processing':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"><Clock className="h-3 w-3" /> Processing</span>;
    case 'Pending':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium"><Clock className="h-3 w-3" /> Pending</span>;
    case 'Cancelled':
      return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium"><AlertCircle className="h-3 w-3" /> Cancelled</span>;
    default:
      return null;
  }
};

function mapAdminStatus(status: ApiOrder['orderStatus']) {
  switch (status) {
    case 'delivered': return 'Completed';
    case 'processing': return 'Processing';
    case 'shipped': return 'Processing';
    case 'cancelled': return 'Cancelled';
    default: return 'Pending';
  }
}

function mapOrderRow(order: ApiOrder) {
  const user = typeof order.userId === 'object' ? (order.userId as ApiUser) : null;
  const firstItem = order.items[0];
  const product = firstItem ? getProductFromRef(firstItem.productId) : null;

  return {
    id: `ORD-${order._id.slice(-4).toUpperCase()}`,
    customer: user?.username || 'Customer',
    product: product?.name || 'Order items',
    amount: order.totalAmount,
    status: mapAdminStatus(order.orderStatus),
    date: formatOrderDate(order.createdAt),
  };
}

export function AdminRecentOrders() {
  const [orders, setOrders] = useState<ReturnType<typeof mapOrderRow>[]>([]);

  useEffect(() => {
    orderService.getAll().then((data) => {
      setOrders(data.slice(0, 5).map(mapOrderRow));
    });
  }, []);

  return (
    <div className="w-full bg-card rounded-xl border shadow-sm overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center bg-muted/10">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Recent Transactions</h3>
          <p className="text-sm text-muted-foreground mt-0.5">Your latest sales across all channels.</p>
        </div>
        <Link to="/admin/orders">
          <Button variant="outline" size="sm" className="h-8">View All</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <motion.tbody
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="divide-y bg-card"
          >
            {orders.map((order) => (
              <motion.tr
                key={order.id}
                variants={itemVariants}
                className="hover:bg-muted/40 transition-colors group"
              >
                <td className="px-6 py-4 font-mono font-medium text-xs">{order.id}</td>
                <td className="px-6 py-4 font-medium">{order.customer}</td>
                <td className="px-6 py-4 text-muted-foreground">{order.product}</td>
                <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                <td className="px-6 py-4 font-semibold text-foreground">${order.amount.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white border"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white border"><MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
