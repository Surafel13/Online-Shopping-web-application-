import { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Heart,
  LogOut,
  ShoppingCart,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { CountBadge } from "../shared/CountBadge";
import { UserAvatar } from "../shared/UserAvatar";
import { HeaderSearch } from "./HeaderSearch";
import { ACCOUNT_LINKS, type NavItem } from "./navigation";
import { cn } from "../../lib/utils";
import type { AuthUser } from "../../redux/slices/authSlice";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  links: NavItem[];
  isAuthenticated: boolean;
  user: AuthUser | null;
  counts: { cart: number; wishlist: number; notifications: number };
  onLogoutClick: () => void;
}

interface DrawerLinkProps {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  count?: number;
  tone?: "primary" | "danger";
  onClick: () => void;
}

function DrawerLink({
  to,
  label,
  icon: Icon,
  end,
  count,
  tone,
  onClick,
}: DrawerLinkProps) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
          isActive
            ? "bg-blue-600/10 font-medium text-blue-700 dark:text-blue-400"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      {count !== undefined && <CountBadge count={count} tone={tone} />}
    </NavLink>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

export function MobileNav({
  open,
  onClose,
  links,
  isAuthenticated,
  user,
  counts,
  onLogoutClick,
}: MobileNavProps) {
  // Escape to close + lock page scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-nav-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {open && (
        <motion.aside
          key="mobile-nav-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Main navigation"
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          className="fixed inset-y-0 left-0 z-[61] flex w-80 max-w-[85vw] flex-col bg-background shadow-2xl lg:hidden"
        >
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b px-4">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center space-x-2"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary">
                <span className="text-xs font-bold text-primary-foreground">
                  N
                </span>
              </div>
              <span className="font-bold">Sheger Gebeya</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-1 space-y-6 overflow-y-auto p-4">
            <HeaderSearch />

            {isAuthenticated && user && (
              <Link
                to="/profile"
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
              >
                <UserAvatar
                  name={user.name}
                  src={user.avatar}
                  className="h-10 w-10 shrink-0 text-sm"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </Link>
            )}

            <Section title="Menu">
              {links.map((item) => (
                <DrawerLink key={item.to} {...item} onClick={onClose} />
              ))}
            </Section>

            {isAuthenticated && (
              <>
                <Section title="Shopping">
                  <DrawerLink
                    to="/wishlist"
                    label="Wishlist"
                    icon={Heart}
                    count={counts.wishlist}
                    onClick={onClose}
                  />
                  <DrawerLink
                    to="/cart"
                    label="Cart"
                    icon={ShoppingCart}
                    count={counts.cart}
                    onClick={onClose}
                  />
                  <DrawerLink
                    to="/notifications"
                    label="Notifications"
                    icon={Bell}
                    count={counts.notifications}
                    tone="danger"
                    onClick={onClose}
                  />
                </Section>

                <Section title="Account">
                  {ACCOUNT_LINKS.filter((l) => l.to !== "/wishlist").map(
                    (item) => (
                      <DrawerLink key={item.to} {...item} onClick={onClose} />
                    ),
                  )}
                </Section>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t p-4">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  onClose();
                  onLogoutClick();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={onClose}>
                  <Button variant="outline" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={onClose}>
                  <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
