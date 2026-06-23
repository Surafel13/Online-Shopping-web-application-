import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../../components/layout/PageTransition';
import { motion } from 'framer-motion';
import { Search, Filter, MoreHorizontal, Mail } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { AdminLoadingState } from '../../components/shared/AdminLoadingState';
import { orderService, userService } from '../../services';
import { formatOrderDate } from '../../lib/mappers';
import type { ApiUser } from '../../types/api';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';
import { showError, showSuccess } from '../../redux/slices/uiSlice';
import { getApiErrorMessage } from '../../lib/errors';

interface CustomerRow {
  id: string;
  userId: string;
  name: string;
  email: string;
  spent: number;
  orders: number;
  joined: string;
  status: string;
  role: ApiUser['role'];
  isActive: boolean;
}

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'VIP': return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">VIP</span>;
    case 'Active': return <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">Active</span>;
    case 'Inactive': return <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">Inactive</span>;
    case 'New': return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">New</span>;
    case 'Admin': return <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">Admin</span>;
    default: return null;
  }
};

export function AdminCustomers() {
  const dispatch = useDispatch<AppDispatch>();
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const [users, orders] = await Promise.all([
        userService.getAllUsers(),
        orderService.getAll(),
      ]);

      const orderStats = new Map<string, { spent: number; orders: number }>();
      orders.forEach((order) => {
        const userId = typeof order.userId === 'object' ? order.userId._id : String(order.userId);
        const existing = orderStats.get(userId) || { spent: 0, orders: 0 };
        existing.spent += order.totalAmount;
        existing.orders += 1;
        orderStats.set(userId, existing);
      });

      setCustomers(
        users.map((user) => {
          const stats = orderStats.get(user._id) || { spent: 0, orders: 0 };
          let status = 'Active';
          if (user.role === 'admin') status = 'Admin';
          else if (!user.isActive) status = 'Inactive';
          else if (stats.orders >= 10) status = 'VIP';
          else if (stats.orders <= 1) status = 'New';

          return {
            id: `CUST-${user._id.slice(-4).toUpperCase()}`,
            userId: user._id,
            name: user.username,
            email: user.email,
            spent: stats.spent,
            orders: stats.orders,
            joined: formatOrderDate(user.createdAt),
            status,
            role: user.role,
            isActive: user.isActive,
          };
        }),
      );
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to load customers.')));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase();
    return customers.filter((customer) =>
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.id.toLowerCase().includes(query),
    );
  }, [customers, search]);

  const toggleUserStatus = async (customer: CustomerRow) => {
    try {
      await userService.updateUser(customer.userId, { isActive: !customer.isActive });
      dispatch(showSuccess(`User ${customer.isActive ? 'deactivated' : 'activated'}.`));
      await loadCustomers();
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to update user status.')));
    }
  };

  const totalSpent = filteredCustomers.reduce((sum, customer) => sum + customer.spent, 0);
  const avgLifetimeValue = filteredCustomers.length ? totalSpent / filteredCustomers.length : 0;
  const activeCustomers = filteredCustomers.filter((customer) => customer.isActive).length;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage your customer base.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm text-muted-foreground font-medium">Total Customers</h3>
            <p className="text-3xl font-bold mt-2">{filteredCustomers.length.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm text-muted-foreground font-medium">Active Accounts</h3>
            <p className="text-3xl font-bold mt-2">{activeCustomers.toLocaleString()}</p>
          </div>
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm text-muted-foreground font-medium">Avg. Lifetime Value</h3>
            <p className="text-3xl font-bold mt-2">${avgLifetimeValue.toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between bg-muted/10">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-2"><Filter className="h-4 w-4" /> Filter</Button>
          </div>

          {isLoading ? (
            <AdminLoadingState message="Loading customers..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Total Spent</th>
                    <th className="px-6 py-4">Orders</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y bg-card">
                  {filteredCustomers.map((cust) => (
                    <motion.tr key={cust.id} variants={itemVariants} className="hover:bg-muted/40 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium">{cust.name}</div>
                        <div className="text-xs text-muted-foreground">Joined {cust.joined}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {cust.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={cust.status} /></td>
                      <td className="px-6 py-4 font-semibold">${cust.spent.toFixed(2)}</td>
                      <td className="px-6 py-4">{cust.orders}</td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 border bg-background opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to="/admin/orders">View Orders</Link>
                            </DropdownMenuItem>
                            {cust.role !== 'admin' && (
                              <DropdownMenuItem onClick={() => toggleUserStatus(cust)}>
                                {cust.isActive ? 'Deactivate Account' : 'Activate Account'}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
