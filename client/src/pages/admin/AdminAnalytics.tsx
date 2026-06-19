import { PageTransition } from '../../components/layout/PageTransition';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Download, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';

const SALES_DATA = [
  { name: 'Mon', online: 4000, retail: 2400 },
  { name: 'Tue', online: 3000, retail: 1398 },
  { name: 'Wed', online: 2000, retail: 9800 },
  { name: 'Thu', online: 2780, retail: 3908 },
  { name: 'Fri', online: 1890, retail: 4800 },
  { name: 'Sat', online: 2390, retail: 3800 },
  { name: 'Sun', online: 3490, retail: 4300 },
];

const GROWTH_DATA = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 800 },
  { name: 'Mar', users: 1200 },
  { name: 'Apr', users: 1800 },
  { name: 'May', users: 2400 },
  { name: 'Jun', users: 3100 },
];

const staggerVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.5 } }
};

export function AdminAnalytics() {
  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
            <p className="text-sm text-muted-foreground mt-1">Deep dive into your store's metrics and growth.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 bg-background"><Calendar className="h-4 w-4" /> Last 30 Days</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 gap-2"><Download className="h-4 w-4" /> Export Report</Button>
          </div>
        </div>

        <motion.div variants={staggerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sales Trends Bar Chart */}
          <motion.div variants={staggerVariants} className="bg-card border rounded-xl shadow-sm p-6 flex flex-col h-[400px]">
            <div className="mb-6">
              <h3 className="text-lg font-semibold tracking-tight">Sales Trends</h3>
              <p className="text-sm text-muted-foreground">Online vs Retail performance.</p>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SALES_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `$${val/1000}k`} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="online" fill="#2563eb" radius={[4, 4, 0, 0]} animationDuration={1500} />
                  <Bar dataKey="retail" fill="#93c5fd" radius={[4, 4, 0, 0]} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Customer Growth Area Chart */}
          <motion.div variants={staggerVariants} className="bg-card border rounded-xl shadow-sm p-6 flex flex-col h-[400px]">
            <div className="mb-6">
              <h3 className="text-lg font-semibold tracking-tight">Customer Growth</h3>
              <p className="text-sm text-muted-foreground">Cumulative active users over time.</p>
            </div>
            <div className="flex-1 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={GROWTH_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </PageTransition>
  );
}
