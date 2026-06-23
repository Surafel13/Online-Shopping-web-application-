import { useEffect, useMemo, useState } from 'react';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { Search, MapPin, Truck, RefreshCw, Clock } from 'lucide-react';
import { Input } from '../components/ui/input';
import { orderService } from '../services';
import {
  formatOrderDate,
  getProductFromRef,
  mapOrderStatusToUi,
  mapPaymentStatusToUi,
} from '../lib/mappers';
import type { ApiOrder } from '../types/api';

const FILTERS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_CONFIG: Record<string, { bg: string, text: string, border: string, icon: React.ReactNode }> = {
  DELIVERED: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: <Clock className="h-3.5 w-3.5 mr-1" /> },
  SHIPPED: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: <Truck className="h-3.5 w-3.5 mr-1" /> },
  PROCESSING: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: <Clock className="h-3.5 w-3.5 mr-1" /> },
  PENDING: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: <Clock className="h-3.5 w-3.5 mr-1" /> },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200', icon: <Clock className="h-3.5 w-3.5 mr-1" /> },
};

function mapOrderForUi(order: ApiOrder) {
  const address = order.shippingAddress;
  return {
    id: `#NEX-${order._id.slice(-6).toUpperCase()}`,
    date: formatOrderDate(order.createdAt),
    total: order.totalAmount,
    paymentStatus: mapPaymentStatusToUi(order.paymentStatus),
    status: mapOrderStatusToUi(order.orderStatus),
    address: `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`,
    tracking: '',
    items: order.items.map((item) => {
      const product = getProductFromRef(item.productId);
      return {
        name: product?.name || 'Product',
        variant: 'Default',
        price: item.price,
        qty: item.quantity,
        image: product?.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop',
      };
    }),
  };
}

export function Orders() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<ReturnType<typeof mapOrderForUi>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then((data) => setOrders(data.map(mapOrderForUi)))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter = activeFilter === 'All' || order.status === activeFilter.toUpperCase();
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

  return (
    <PageTransition>
      <div className="bg-slate-50/50 dark:bg-slate-900/20 min-h-screen pb-20 pt-10">
        <div className="container px-4 max-w-screen-xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">My Orders</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Check the status of recent orders, manage returns, and discover similar products.</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex bg-white dark:bg-slate-800 rounded-full p-1 border dark:border-slate-700 shadow-sm overflow-x-auto w-full sm:w-auto">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    activeFilter === filter
                      ? 'bg-slate-900 dark:bg-slate-700 text-white shadow'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg h-10 shadow-sm focus-visible:ring-slate-300 text-sm"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">Loading orders...</div>
          ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
              
              return (
                <div key={order.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  
                  <div className="flex flex-wrap items-start justify-between gap-4 p-6 sm:p-8 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex flex-wrap gap-8 sm:gap-16">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Order ID</span>
                        <span className="font-bold text-slate-900">{order.id}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Date Placed</span>
                        <span className="font-medium text-slate-700">{order.date}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
                        <span className="font-bold text-slate-900">${order.total.toFixed(2)}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Status</span>
                        <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full inline-flex self-start mt-1">
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                      {statusCfg.icon}
                      {order.status}
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <div className="h-16 w-16 rounded-lg border border-slate-100 dark:border-slate-700 overflow-hidden shrink-0 bg-slate-50 dark:bg-slate-900">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{item.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.variant} · Qty {item.qty}</p>
                          </div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">${item.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="lg:w-72 shrink-0 flex flex-col gap-4">
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
                          <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                          <span className="font-medium text-slate-700 dark:text-slate-300">Shipping Address</span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-6">{order.address}</p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" className="w-full justify-center gap-2 h-10 border-slate-200 dark:border-slate-700">
                          <RefreshCw className="h-3.5 w-3.5" /> Buy Again
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-center gap-2 h-10 border-slate-200 dark:border-slate-700">
                          View Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredOrders.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No orders found for the selected filter.
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
