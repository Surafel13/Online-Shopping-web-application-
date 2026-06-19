import { PageTransition } from '../../components/layout/PageTransition';
import { motion } from 'framer-motion';
import { Search, Filter, MoreHorizontal, Mail, Phone } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';

const MOCK_CUSTOMERS = [
  { id: 'CUST-001', name: 'Emma Watson', email: 'emma.w@example.com', phone: '+1 234 567 890', spent: 1240.50, orders: 12, joined: 'Mar 2023', status: 'Active' },
  { id: 'CUST-002', name: 'Liam Thorne', email: 'liam.t@example.com', phone: '+1 987 654 321', spent: 850.00, orders: 4, joined: 'Jun 2023', status: 'Active' },
  { id: 'CUST-003', name: 'Sophia Chen', email: 'sophia.c@example.com', phone: '+1 555 123 456', spent: 2100.00, orders: 18, joined: 'Jan 2022', status: 'VIP' },
  { id: 'CUST-004', name: 'Noah Patel', email: 'noah.p@example.com', phone: '+1 444 987 654', spent: 65.00, orders: 1, joined: 'Oct 2024', status: 'New' },
  { id: 'CUST-005', name: 'Isabella Kim', email: 'bella.k@example.com', phone: '+1 333 444 555', spent: 320.00, orders: 3, joined: 'Aug 2024', status: 'Active' },
];

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'VIP': return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">VIP</span>;
    case 'Active': return <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">Active</span>;
    case 'New': return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">New</span>;
    default: return null;
  }
};

export function AdminCustomers() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
            <p className="text-sm text-muted-foreground mt-1">View and manage your customer base.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20">Add Customer</Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm text-muted-foreground font-medium">Total Customers</h3>
            <p className="text-3xl font-bold mt-2">12,482</p>
          </div>
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm text-muted-foreground font-medium">Active (30 Days)</h3>
            <p className="text-3xl font-bold mt-2">3,104</p>
          </div>
          <div className="bg-card border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm text-muted-foreground font-medium">Avg. Lifetime Value</h3>
            <p className="text-3xl font-bold mt-2">$845</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b flex flex-wrap gap-4 items-center justify-between bg-muted/10">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-9" placeholder="Search customers..." />
            </div>
            <Button variant="outline" size="sm" className="h-9 gap-2"><Filter className="h-4 w-4" /> Filter</Button>
          </div>

          {/* Table */}
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
                {MOCK_CUSTOMERS.map((cust) => (
                  <motion.tr key={cust.id} variants={itemVariants} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{cust.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">{cust.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground"><Mail className="h-3 w-3" /> {cust.email}</div>
                      <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3 w-3" /> {cust.phone}</div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={cust.status} /></td>
                    <td className="px-6 py-4 font-semibold">${cust.spent.toFixed(2)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{cust.orders}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 border bg-background opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">Delete Customer</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
