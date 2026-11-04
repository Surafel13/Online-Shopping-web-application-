import { useCallback, useEffect, useMemo, useState } from 'react';
import { PageTransition } from '../../components/layout/PageTransition';
import { motion } from 'framer-motion';
import { Search, Filter, MoreHorizontal, Eye, Clock, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { AdminLoadingState } from '../../components/shared/AdminLoadingState';
import { orderService } from '../../services';
import { formatOrderDate, getProductFromRef, mapPaymentStatusToUi } from '../../lib/mappers';
import type { ApiOrder, ApiUser, OrderStatus, PaymentStatus } from '../../types/api';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';
import { showSuccess, showError } from '../../redux/slices/uiSlice';
import { getApiErrorMessage } from '../../lib/errors';

interface AdminOrderRow {
  id: string;
  orderId: string;
  customer: string;
  email: string;
  product: string;
  amount: number;
  status: string;
  paymentStatus: string;
  date: string;
}

function mapAdminStatus(status: ApiOrder['orderStatus']) {
  switch (status) {
    case 'delivered': return 'Completed';
    case 'processing': return 'Processing';
    case 'shipped': return 'Processing';
    case 'cancelled': return 'Cancelled';
    default: return 'Pending';
  }
}

function mapOrder(order: ApiOrder): AdminOrderRow {
  const user = typeof order.userId === 'object' ? (order.userId as ApiUser) : null;
  return {
    id: `ORD-${order._id.slice(-4).toUpperCase()}`,
    orderId: order._id,
    customer: user?.username || 'Customer',
    email: user?.email || 'customer@example.com',
    product: order.items.length > 1 ? `${order.items.length} items` : 'Single item order',
    amount: order.totalAmount,
    status: mapAdminStatus(order.orderStatus),
    paymentStatus: mapPaymentStatusToUi(order.paymentStatus),
    date: formatOrderDate(order.createdAt),
  };
}

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'Completed': return <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium"><CheckCircle2 className="h-3 w-3" /> Completed</span>;
    case 'Processing': return <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"><Clock className="h-3 w-3" /> Processing</span>;
    case 'Pending': return <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium"><Clock className="h-3 w-3" /> Pending</span>;
    case 'Cancelled': return <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium"><AlertCircle className="h-3 w-3" /> Cancelled</span>;
    default: return null;
  }
};

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

export function AdminOrders() {
  const dispatch = useDispatch<AppDispatch>();
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<ApiOrder | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const loadOrders = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await orderService.getAll();
      setOrders(data.map(mapOrder));
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to load orders.')));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    let isCurrent = true;
    orderService.getAll()
      .then((data) => {
        if (isCurrent) setOrders(data.map(mapOrder));
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          dispatch(showError(getApiErrorMessage(error, 'Failed to load orders.')));
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase();
    return orders.filter((order) =>
      order.id.toLowerCase().includes(query) ||
      order.customer.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query),
    );
  }, [orders, search]);

  const updateStatus = async (orderId: string, orderStatus: OrderStatus) => {
    try {
      await orderService.updateStatus(orderId, orderStatus);
      dispatch(showSuccess('Order status updated.'));
      await loadOrders();
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to update order status.')));
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    try {
      await orderService.updatePaymentStatus(orderId, paymentStatus);
      dispatch(showSuccess('Payment status updated.'));
      await loadOrders();
      if (selectedOrderId === orderId) {
        const order = await orderService.getById(orderId);
        setSelectedOrderDetail(order);
      }
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to update payment status.')));
    }
  };

  const openOrderDetail = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsDetailLoading(true);
    try {
      const order = await orderService.getById(orderId);
      setSelectedOrderDetail(order);
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, 'Failed to load order details.')));
      setSelectedOrderId(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage and track all customer orders.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20">Export CSV</Button>
        </div>

        <div className="bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between bg-muted/10">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9 h-9"
                placeholder="Search by order ID or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-2"><Filter className="h-4 w-4" /> Filter</Button>
            </div>
          </div>

          {isLoading ? (
            <AdminLoadingState message="Loading orders..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Total</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y bg-card">
                  {filteredOrders.map((order) => (
                    <motion.tr key={order.id} variants={itemVariants} className="hover:bg-muted/40 transition-colors group">
                      <td className="px-6 py-4 font-mono font-medium">{order.id}</td>
                      <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-xs text-muted-foreground">{order.email}</div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                      <td className="px-6 py-4 text-muted-foreground">{order.paymentStatus}</td>
                      <td className="px-6 py-4 font-semibold">${order.amount.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 border bg-background" onClick={() => openOrderDetail(order.orderId)}>
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 border bg-background">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => updateStatus(order.orderId, 'processing')}>Mark as Processing</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(order.orderId, 'delivered')}>Mark as Completed</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updatePaymentStatus(order.orderId, 'paid')}>Mark Payment Paid</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => updateStatus(order.orderId, 'cancelled')}>Cancel Order</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          )}

          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-muted/10">
            <div>Showing {filteredOrders.length} entries</div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedOrderId} onOpenChange={(open: boolean) => !open && setSelectedOrderId(null)}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              Order Details
            </DialogTitle>
          </DialogHeader>
          {isDetailLoading ? (
            <AdminLoadingState message="Loading order details..." />
          ) : selectedOrderDetail && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Order ID</span><span className="font-mono font-medium">ORD-{selectedOrderDetail._id.slice(-4).toUpperCase()}</span></div>
                <div><span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Date</span><span>{formatOrderDate(selectedOrderDetail.createdAt)}</span></div>
                <div><span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Payment</span><span>{mapPaymentStatusToUi(selectedOrderDetail.paymentStatus)}</span></div>
                <div><span className="text-muted-foreground block text-xs uppercase tracking-wider mb-1">Method</span><span>{selectedOrderDetail.paymentMethod}</span></div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-sm">Items</h4>
                {selectedOrderDetail.items.map((item, index) => {
                  const product = getProductFromRef(item.productId);
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{product?.name || 'Product'} x{item.quantity}</span>
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border rounded-lg p-4 text-sm">
                <h4 className="font-semibold mb-2">Shipping Address</h4>
                <p className="text-muted-foreground">
                  {selectedOrderDetail.shippingAddress.street}, {selectedOrderDetail.shippingAddress.city}, {selectedOrderDetail.shippingAddress.state} {selectedOrderDetail.shippingAddress.postalCode}
                </p>
              </div>

              <div className="border-t pt-4 flex justify-between items-center font-semibold">
                <span>Total Amount</span>
                <span className="text-lg text-blue-600">${selectedOrderDetail.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
