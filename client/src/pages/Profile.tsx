import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import {
  User, Package, Heart, MapPin, CreditCard,
  Bell, ChevronRight, Star, Gift, Settings, LogOut
} from 'lucide-react';

const RECENT_ORDERS = [
  { id: 'NC-10284', date: 'Jun 12, 2024', total: 499.00, status: 'Delivered', items: 3 },
  { id: 'NC-10271', date: 'May 28, 2024', total: 189.00, status: 'In Transit', items: 1 },
  { id: 'NC-10248', date: 'May 5, 2024',  total: 840.00, status: 'Delivered', items: 4 },
];

const STATUS_COLORS: Record<string, string> = {
  'Delivered': 'bg-green-100 text-green-700 border-green-200',
  'In Transit': 'bg-blue-100 text-blue-700 border-blue-200',
  'Processing': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Cancelled':  'bg-red-100 text-red-700 border-red-200',
};

const NAV_LINKS = [
  { icon: User,       label: 'Profile',           active: true  },
  { icon: Package,    label: 'Orders',             active: false },
  { icon: Heart,      label: 'Wishlist',           active: false },
  { icon: MapPin,     label: 'Addresses',          active: false },
  { icon: CreditCard, label: 'Payment Methods',    active: false },
  { icon: Bell,       label: 'Notifications',      active: false },
  { icon: Settings,   label: 'Account Settings',   active: false },
];

export function Profile() {
  const [activeNav, setActiveNav] = useState('Profile');

  return (
    <PageTransition>
      <div className="container px-4 py-10 max-w-screen-xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-4">
            {/* Avatar Card */}
            <div className="border rounded-xl p-6 bg-card shadow-sm flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl font-bold">A</span>
                </div>
                <button className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs shadow">✏</button>
              </div>
              <h2 className="font-bold text-xl">Alex Johnson</h2>
              <p className="text-sm text-muted-foreground">alex.johnson@example.com</p>
              <div className="mt-4 w-full bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-blue-700 dark:text-blue-300 font-semibold flex items-center"><Gift className="h-3 w-3 mr-1" /> Loyalty Points</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">2,850</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1.5 text-right">1,150 pts to Gold status</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="border rounded-xl bg-card shadow-sm overflow-hidden">
              {NAV_LINKS.map(({ icon: Icon, label }) => (
                <button
                  key={label}
                  onClick={() => setActiveNav(label)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-sm transition-colors hover:bg-muted/60 ${
                    activeNav === label ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold border-l-2 border-blue-600' : 'text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {label}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                </button>
              ))}
              <Separator />
              <button className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Orders', value: '24', icon: Package, color: 'text-blue-600' },
                { label: 'Wishlist Items', value: '12', icon: Heart, color: 'text-pink-500' },
                { label: 'Loyalty Points', value: '2,850', icon: Star, color: 'text-yellow-500' },
                { label: 'Saved Addresses', value: '3', icon: MapPin, color: 'text-green-500' },
              ].map((stat) => (
                <div key={stat.label} className="border rounded-xl p-4 bg-card shadow-sm flex flex-col gap-1">
                  <stat.icon className={`h-5 w-5 ${stat.color} mb-1`} />
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* Personal Information */}
            <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="font-bold text-lg">Personal Information</h3>
                <Button variant="outline" size="sm">Edit Profile</Button>
              </div>
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                {[
                  { label: 'First Name', value: 'Alex' },
                  { label: 'Last Name', value: 'Johnson' },
                  { label: 'Email Address', value: 'alex.johnson@example.com' },
                  { label: 'Phone Number', value: '+1 (555) 212-8453' },
                  { label: 'Date of Birth', value: 'March 15, 1990' },
                  { label: 'Gender', value: 'Male' },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
                    <p className="font-medium mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="font-bold text-lg">Recent Orders</h3>
                <Link to="/orders">
                  <Button variant="ghost" size="sm" className="text-blue-600">View All <ChevronRight className="ml-1 h-3 w-3" /></Button>
                </Link>
              </div>
              <div className="divide-y">
                {RECENT_ORDERS.map((order) => (
                  <div key={order.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.date} · {order.items} item{order.items > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:gap-8">
                      <span className="font-semibold">${order.total.toFixed(2)}</span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                      <Button variant="ghost" size="sm" className="text-xs hidden sm:flex">Track</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </PageTransition>
  );
}
