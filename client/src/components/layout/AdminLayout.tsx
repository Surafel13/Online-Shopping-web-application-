import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AdminSidebar } from '../../features/admin/AdminSidebar';
import { Menu, Search, Bell, Store } from 'lucide-react';
import { Input } from '../ui/input';
import { ADMIN_NAV, adminPath, ADMIN_BASE } from '../../features/admin/navigation';
import type { RootState } from '../../redux/store';

export function AdminLayout() {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'A';
  const current = ADMIN_NAV.find(
    (item) =>
      location.pathname === adminPath(item.slug) ||
      (item.slug === 'overview' && location.pathname === ADMIN_BASE),
  );

  return (
    <div className="flex h-screen bg-muted/10 overflow-hidden w-full">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <header className="h-16 border-b bg-background flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-semibold text-base tracking-tight sm:hidden">
              {current?.name ?? 'Admin'}
            </h2>
            <div className="relative w-96 max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-transparent" placeholder="Search orders, customers, products..." />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Store className="h-4 w-4" /> View Store
            </Link>
            <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
              {initial}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
