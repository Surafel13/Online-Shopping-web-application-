import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { Package, ChevronRight, Search } from 'lucide-react';
import { Input } from '../components/ui/input';

const ORDERS = [
  {
    id: 'NC-10284', date: 'Jun 12, 2024', total: 499.00, status: 'Delivered',
    items: [
      { name: 'Aether Performance Tee', variant: 'Blue / L', price: 65, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=80&auto=format&fit=crop' },
      { name: 'Precision Chronograph Watch', variant: 'Steel', price: 249, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=80&auto=format&fit=crop' },
      { name: 'Vanguard Leather Weekender', variant: 'Cognac', price: 185, image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=80&auto=format&fit=crop' },
    ],
    steps: ['Order Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'],
    currentStep: 4,
  },
  {
    id: 'NC-10271', date: 'May 28, 2024', total: 189.00, status: 'In Transit',
    items: [
      { name: 'Premium Essential Cashmere', variant: 'Gray / M', price: 189, image: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=80&auto=format&fit=crop' },
    ],
    steps: ['Order Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'],
    currentStep: 2,
  },
];

const STATUS_STYLES: Record<string, string> = {
  'Delivered': 'bg-green-100 text-green-700 border-green-200',
  'In Transit': 'bg-blue-100 text-blue-700 border-blue-200',
  'Processing': 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export function Orders() {
  return (
    <PageTransition>
      <div className="container px-4 py-10 max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Order History</h1>
            <p className="text-muted-foreground mt-1">Track and manage all your past purchases</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search orders..." className="pl-9" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {['All Orders', 'Active', 'Delivered', 'Returns', 'Cancelled'].map((tab, i) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                i === 0 ? 'bg-blue-600 text-white shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {ORDERS.map((order) => (
            <div key={order.id} className="border rounded-xl bg-card shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-5 border-b bg-muted/20">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold">{order.id}</p>
                    <p className="text-xs text-muted-foreground">Placed on {order.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-14 sm:ml-0">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_STYLES[order.status]}`}>{order.status}</span>
                  <span className="font-bold text-lg">${order.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Tracking Progress */}
              <div className="px-5 py-5 border-b">
                <div className="flex items-center">
                  {order.steps.map((step, i) => (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className={`flex flex-col items-center gap-1 shrink-0`}>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          i <= order.currentStep
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {i < order.currentStep ? '✓' : i + 1}
                        </div>
                        <span className={`text-[9px] text-center leading-tight hidden sm:block ${i <= order.currentStep ? 'text-blue-700 font-medium' : 'text-muted-foreground'}`}>
                          {step}
                        </span>
                      </div>
                      {i < order.steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 mb-5 rounded-full ${i < order.currentStep ? 'bg-blue-600' : 'bg-muted'}`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Items */}
              <div className="p-5 space-y-4">
                {order.items.map((item) => (
                  <div key={item.name} className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.variant}</p>
                    </div>
                    <span className="font-semibold text-sm shrink-0">${item.price}.00</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 px-5 py-4 border-t bg-muted/10">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Track Order</Button>
                <Button size="sm" variant="outline">View Details <ChevronRight className="ml-1 h-3 w-3" /></Button>
                {order.status === 'Delivered' && (
                  <Button size="sm" variant="ghost" className="text-muted-foreground">Return / Refund</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
