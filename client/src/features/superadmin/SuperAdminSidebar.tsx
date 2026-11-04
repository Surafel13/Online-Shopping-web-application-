import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, ChevronRight, Crown, X } from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import { logout } from "../../redux/slices/authSlice";
import { clearCartState } from "../../redux/slices/cartSlice";
import { clearWishlistState } from "../../redux/slices/wishlistSlice";
import {
  SUPER_ADMIN_NAV,
  SUPER_ADMIN_BASE,
  superAdminPath,
} from "./navigation";

interface SuperAdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const GROUPS = SUPER_ADMIN_NAV.reduce<
  Array<{ name: string; items: typeof SUPER_ADMIN_NAV }>
>((acc, item) => {
  const existing = acc.find((group) => group.name === item.group);
  if (existing) existing.items.push(item);
  else acc.push({ name: item.group, items: [item] });
  return acc;
}, []);

export function SuperAdminSidebar({ isOpen, onClose }: SuperAdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartState());
    dispatch(clearWishlistState());
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r bg-background flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base text-foreground tracking-tight leading-tight">
                Super Admin
              </h2>
              <p className="text-xs text-muted-foreground">Sheger Gebeya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-muted-foreground hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-6">
          {GROUPS.map((group) => (
            <div key={group.name}>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2 px-2">
                {group.name}
              </div>
              <div className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const to = superAdminPath(item.slug);
                  const isActive =
                    location.pathname === to ||
                    (item.slug === "overview" &&
                      location.pathname === SUPER_ADMIN_BASE);

                  return (
                    <Link
                      key={item.slug}
                      to={to}
                      onClick={onClose}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600/10 text-blue-700 dark:text-blue-400 font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <item.icon
                          className={`h-4 w-4 ${isActive ? "text-blue-600 dark:text-blue-400" : ""}`}
                        />
                        {item.name}
                      </span>
                      {isActive && (
                        <ChevronRight className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
