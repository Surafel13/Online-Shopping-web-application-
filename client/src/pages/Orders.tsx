import { useState } from 'react';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { Search, MapPin, Truck, RefreshCw, Clock } from 'lucide-react';
import { Input } from '../components/ui/input';

const ORDERS = [
  {
    id: '#NEX-890214',
    date: 'May 12, 2024',
    total: 245.00,
    paymentStatus: 'Paid',
    status: 'DELIVERED',
    address: '123 Modern Ave, Tech City, NY 10001',
    tracking: '',
    items: [
      { name: 'Luxe Minimalist Watch', variant: 'Midnight Silver', price: 185.00, qty: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop' },
      { name: 'Premium Cotton Tee', variant: 'Alabaster White / Large', price: 60.00, qty: 1, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=100&auto=format&fit=crop' },
    ],
  },
  {
    id: '#NEX-890155',
    date: 'May 08, 2024',
    total: 120.50,
    paymentStatus: 'Paid',
    status: 'SHIPPED',
    address: '123 Modern Ave, Tech City, NY 10001',
    tracking: 'TRK1122334455',
    items: [
      { name: 'Leather Bound Journal', variant: 'Cognac Brown', price: 45.50, qty: 2, image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=100&auto=format&fit=crop' },
    ],
  },
  {
    id: '#NEX-889902',
    date: 'April 28, 2024',
    total: 890.00,
    paymentStatus: 'Paid',
    status: 'PROCESSING',
    address: '123 Modern Ave, Tech City, NY 10001',
    tracking: '',
    items: [
      { name: 'Ergonomic Office Chair', variant: 'Carbon Fiber / Mesh', price: 890.00, qty: 1, image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?q=80&w=100&auto=format&fit=crop' },
    ],
  },
];

const FILTERS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const STATUS_CONFIG: Record<string, { bg: string, text: string, border: string, icon: React.ReactNode }> = {
  'DELIVERED': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: <Clock className="h-3.5 w-3.5 mr-1" /> },
  'SHIPPED': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: <Truck className="h-3.5 w-3.5 mr-1" /> },
  'PROCESSING': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: <Clock className="h-3.5 w-3.5 mr-1" /> },
};

export function Orders() {
  const [activeFilter, setActiveFilter] = useState('All');

  return (
    <PageTransition>
      <div className="bg-slate-50/50 dark:bg-slate-900/20 min-h-screen pb-20 pt-10">
        <div className="container px-4 max-w-screen-xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">My Orders</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Check the status of recent orders, manage returns, and discover similar products.</p>
          </div>

          {/* Filters & Search */}
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
                className="pl-9 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg h-10 shadow-sm focus-visible:ring-slate-300 text-sm"
              />
            </div>
          </div>

          {/* Order List */}
          <div className="space-y-6">
            {ORDERS.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status];
              
              return (
                <div key={order.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                  
                  {/* Order Header */}
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
                    <div className={`flex items-center px-3 py-1.5 rounded-full border text-[10px] sm:text-xs font-bold uppercase tracking-wider ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
                      {statusCfg.icon}
                      {order.status}
                    </div>
                  </div>

                  {/* Order Body */}
                  <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8 lg:gap-12">
                    
                    {/* Items */}
                    <div className="flex-1 flex flex-col gap-6">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex gap-4 sm:gap-6">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 overflow-hidden shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover p-1 mix-blend-multiply" />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">{item.name}</h4>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-2">{item.variant}</p>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-900 dark:text-slate-100">${item.price.toFixed(2)}</span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">Qty: {item.qty}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    <div className="lg:w-80 shrink-0">
                      <div className="bg-slate-50 dark:bg-slate-900/30 rounded-xl p-5 border border-slate-100 dark:border-slate-700 h-full flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Shipping To</span>
                        <div className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>{order.address}</span>
                        </div>
                        {order.tracking && (
                          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-xs text-slate-500 dark:text-slate-400">Tracking: <span className="font-semibold text-slate-700 dark:text-slate-300">{order.tracking}</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-5 sm:px-8 sm:py-6 border-t border-slate-100 dark:border-slate-700 flex flex-wrap justify-end gap-3 sm:gap-4 bg-white dark:bg-slate-800">
                    <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg h-10 px-6 font-medium">
                      View Details
                    </Button>
                    {order.status === 'SHIPPED' && (
                      <Button variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg h-10 px-6 font-medium flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Track Shipment
                      </Button>
                    )}
                    <Button className="bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-lg h-10 px-6 font-medium flex items-center gap-2 shadow-sm">
                      <RefreshCw className="w-4 h-4" /> Reorder
                    </Button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-sm text-slate-500 dark:text-slate-400">Showing <span className="font-bold text-slate-900 dark:text-slate-100">3</span> results</span>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="rounded-lg border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 h-10 px-4">Previous</Button>
              <Button className="rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white h-10 w-10 p-0">1</Button>
              <Button variant="outline" className="rounded-lg border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 h-10 px-4">Next</Button>
            </div>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
