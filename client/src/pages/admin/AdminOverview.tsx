import { PageTransition } from '../../components/layout/PageTransition';
import { AdminRevenueChart } from '../../features/admin/AdminRevenueChart';
import { AdminRecentOrders } from '../../features/admin/AdminRecentOrders';
import { Button } from '../../components/ui/button';
import { DollarSign, ShoppingCart, Users, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const STATS = [
  { label: 'Gross Revenue', value: '$128,430', change: '+12.5%', isUp: true, icon: DollarSign, color: 'text-blue-600 bg-blue-100' },
  { label: 'Total Orders', value: '2,841', change: '+8.2%', isUp: true, icon: ShoppingCart, color: 'text-indigo-600 bg-indigo-100' },
  { label: 'Active Customers', value: '1,203', change: '+3.1%', isUp: true, icon: Users, color: 'text-violet-600 bg-violet-100' },
  { label: 'Avg. Order Value', value: '$452', change: '-2.3%', isUp: false, icon: TrendingUp, color: 'text-rose-600 bg-rose-100' },
];

export function AdminOverview() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        <div className="flex justify-between items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
            <p className="text-muted-foreground text-sm mt-1">Monitor your store's performance and recent activity.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20">Generate Report</Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-card border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${stat.isUp ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">{stat.value}</h3>
              <p className="text-sm text-muted-foreground font-medium mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AdminRevenueChart />
          </div>
          <div className="xl:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-card border rounded-xl shadow-sm p-6 h-[350px] flex flex-col"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold tracking-tight">Top Performers</h3>
                <button className="text-sm text-blue-600 hover:underline">View All</button>
              </div>
              <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                {[
                  { name: 'Aura Hybrid Jacket', sales: '342 sales', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=100&auto=format&fit=crop' },
                  { name: 'Precision Chronograph', sales: '128 sales', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop' },
                  { name: 'Cashmere Essential', sales: '490 sales', img: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?q=80&w=100&auto=format&fit=crop' },
                  { name: 'Leather Tote Bag', sales: '215 sales', img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=100&auto=format&fit=crop' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <img src={p.img} alt={p.name} className="h-10 w-10 rounded-md object-cover border group-hover:border-blue-500 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground line-clamp-1">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sales}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <AdminRecentOrders />
        
      </div>
    </PageTransition>
  );
}
