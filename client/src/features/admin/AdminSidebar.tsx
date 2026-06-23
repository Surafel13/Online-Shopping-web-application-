import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, Users, BarChart3, Settings, LogOut, ChevronRight, Package, Tags
} from 'lucide-react';
import gsap from 'gsap';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';
import { clearCartState } from '../../redux/slices/cartSlice';
import { clearWishlistState } from '../../redux/slices/wishlistSlice';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin/overview', icon: LayoutDashboard },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Categories', path: '/admin/categories', icon: Tags },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartState());
    dispatch(clearWishlistState());
    navigate('/login');
  };

  useEffect(() => {
    gsap.fromTo(
      '.admin-sidebar-item',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out', delay: 0.2 }
    );
  }, []);

  return (
    <aside className="w-64 border-r bg-background hidden lg:flex flex-col h-full min-h-[100dvh]">
      <div className="p-6 border-b">
        <h2 className="font-bold text-lg text-foreground tracking-tight">Admin Portal</h2>
        <p className="text-xs text-muted-foreground mt-1">Manage your store operations</p>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-2 px-4">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Main Menu</div>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.includes(item.path) || (item.name === 'Dashboard' && location.pathname === '/admin');
          return (
            <Link key={item.name} to={item.path}>
              <motion.div
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
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t mt-auto">
        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
