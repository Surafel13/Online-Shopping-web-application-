import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Users, BarChart3, Settings, LogOut, ChevronRight
} from 'lucide-react';
import gsap from 'gsap';

const NAV_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard },
  { name: 'Orders', icon: ShoppingBag },
  { name: 'Customers', icon: Users },
  { name: 'Analytics', icon: BarChart3 },
  { name: 'Settings', icon: Settings },
];

export function AdminSidebar() {
  const [active, setActive] = useState('Dashboard');

  useEffect(() => {
    gsap.fromTo(
      '.admin-sidebar-item',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out', delay: 0.2 }
    );
  }, []);

  return (
    <aside className="w-64 border-r bg-card/50 backdrop-blur-sm hidden lg:flex flex-col h-full min-h-[80vh]">
      <div className="p-6 border-b">
        <h2 className="font-bold text-lg text-foreground tracking-tight">Admin Portal</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage your store operations</p>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-2 px-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Main Menu</div>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.name;
          return (
            <motion.button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`admin-sidebar-item flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-700 font-medium' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : ''}`} />
                {item.name}
              </div>
              {isActive && <ChevronRight className="h-3.5 w-3.5 text-blue-600" />}
            </motion.button>
          );
        })}
      </div>

      <div className="p-4 border-t mt-auto">
        <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
