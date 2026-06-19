import { useState } from 'react';
import { PageTransition } from '../../components/layout/PageTransition';
import { motion } from 'framer-motion';
import { Search, Filter, MoreHorizontal, Eye, Clock, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

const MOCK_ORDERS = [
  { id: 'ORD-9302', customer: 'Emma Watson', email: 'emma.w@example.com', product: 'Minimalist Overcoat', amount: 320.00, status: 'Completed', date: 'Oct 24, 2024' },
  { id: 'ORD-9301', customer: 'Liam Thorne', email: 'liam.t@example.com', product: 'Hybrid Backpack', amount: 185.00, status: 'Processing', date: 'Oct 24, 2024' },
  { id: 'ORD-9300', customer: 'Sophia Chen', email: 'sophia.c@example.com', product: 'Merino Wool Sweater', amount: 145.00, status: 'Pending', date: 'Oct 23, 2024' },
  { id: 'ORD-9299', customer: 'Noah Patel', email: 'noah.p@example.com', product: 'Leather Wallet', amount: 65.00, status: 'Completed', date: 'Oct 23, 2024' },
  { id: 'ORD-9298', customer: 'Isabella Kim', email: 'bella.k@example.com', product: 'Canvas Sneakers', amount: 110.00, status: 'Cancelled', date: 'Oct 22, 2024' },
  { id: 'ORD-9297', customer: 'Oliver Smith', email: 'oliver.s@example.com', product: 'Cashmere Beanie', amount: 45.00, status: 'Completed', date: 'Oct 22, 2024' },
];

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
  const [selectedOrder, setSelectedOrder] = useState<typeof MOCK_ORDERS[0] | null>(null);

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
          {/* Toolbar */}
          <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between bg-muted/10">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-9" placeholder="Search by order ID or customer name..." />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 gap-2"><Filter className="h-4 w-4" /> Filter</Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="show" className="divide-y bg-card">
                {MOCK_ORDERS.map((order) => (
                  <motion.tr key={order.id} variants={itemVariants} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-6 py-4 font-mono font-medium">{order.id}</td>
                    <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customer}</div>
                      <div className="text-xs text-muted-foreground">{order.email}</div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 font-semibold">${order.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 border bg-background" onClick={() => setSelectedOrder(order)}>
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 border bg-background">
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Mark as Processing</DropdownMenuItem>
                            <DropdownMenuItem>Mark as Completed</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Cancel Order</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground bg-muted/10">
            <div>Showing 1 to 6 of 142 entries</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open: boolean) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 pt-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-mono font-bold text-lg">{selectedOrder.id}</h3>
                  <p className="text-sm text-muted-foreground">{selectedOrder.date}</p>
                </div>
                <StatusBadge status={selectedOrder.status} />
              </div>
              
              <div className="border rounded-lg p-4 bg-muted/20 space-y-3 text-sm">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium text-right">{selectedOrder.customer}<br/><span className="text-xs text-muted-foreground font-normal">{selectedOrder.email}</span></span>
                </div>
                <div className="flex justify-between border-b pb-3">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="font-medium">Visa ending in 4242</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="font-semibold">Total Amount</span>
                  <span className="font-bold text-lg text-blue-600">${selectedOrder.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Order Items</h4>
                <div className="flex justify-between items-center border rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-muted rounded flex items-center justify-center"><ShoppingBag className="h-4 w-4 text-muted-foreground" /></div>
                    <div>
                      <p className="font-medium">{selectedOrder.product}</p>
                      <p className="text-xs text-muted-foreground">Qty: 1</p>
                    </div>
                  </div>
                  <span className="font-medium">${selectedOrder.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
