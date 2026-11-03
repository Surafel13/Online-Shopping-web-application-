import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Menu, Store } from "lucide-react";
import { SuperAdminSidebar } from "../../features/superadmin/SuperAdminSidebar";
import {
  SUPER_ADMIN_NAV,
  superAdminPath,
  SUPER_ADMIN_BASE,
} from "../../features/superadmin/navigation";
import type { RootState } from "../../redux/store";

export function SuperAdminLayout() {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const initial = user?.name?.charAt(0)?.toUpperCase() || "S";
  const current = SUPER_ADMIN_NAV.find(
    (item) =>
      location.pathname === superAdminPath(item.slug) ||
      (item.slug === "overview" && location.pathname === SUPER_ADMIN_BASE),
  );

  return (
    <div className="flex h-screen bg-muted/10 overflow-hidden w-full">
      <SuperAdminSidebar
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
            <h2 className="font-semibold text-base tracking-tight">
              {current?.name ?? "Super Admin"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Store className="h-4 w-4" /> View Store
            </Link>
            <span className="hidden sm:inline-flex bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800/50 tracking-wider">
              Super Admin
            </span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
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
