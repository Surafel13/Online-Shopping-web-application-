import { useCallback, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  Heart,
  Menu,
  Moon,
  ShoppingCart,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { CountBadge } from "../shared/CountBadge";
import { HeaderSearch } from "./HeaderSearch";
import { LogoutDialog } from "./LogoutDialog";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { getNavLinks } from "./navigation";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { logout } from "../../redux/slices/authSlice";
import { clearCartState } from "../../redux/slices/cartSlice";
import { clearWishlistState } from "../../redux/slices/wishlistSlice";
import { clearNotificationState } from "../../redux/slices/notificationSlice";
import { toggleTheme } from "../../redux/slices/themeSlice";
import { cn } from "../../lib/utils";

interface HeaderIconLinkProps {
  to: string;
  label: string;
  icon: LucideIcon;
  count: number;
  tone?: "primary" | "danger";
  className?: string;
}

function HeaderIconLink({
  to,
  label,
  icon: Icon,
  count,
  tone,
  className,
}: HeaderIconLinkProps) {
  return (
    <NavLink
      to={to}
      title={label}
      aria-label={count > 0 ? `${label} (${count})` : label}
      className={({ isActive }) =>
        cn(
          "relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors",
          isActive
            ? "bg-accent text-accent-foreground"
            : "text-foreground/70 hover:bg-accent hover:text-accent-foreground",
          className,
        )
      }
    >
      <Icon className="h-4 w-4" />
      <CountBadge
        count={count}
        tone={tone}
        className="absolute -right-0.5 -top-0.5"
      />
    </NavLink>
  );
}

export function Header() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const cartCount = useAppSelector((state) => state.cart.totalItems);
  const wishlistCount = useAppSelector(
    (state) => state.wishlist.productIds.length,
  );
  const unreadCount = useAppSelector(
    (state) => state.notifications.unreadCount,
  );
  const theme = useAppSelector((state) => state.theme.theme);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const loggedInUser = isAuthenticated ? user : null;
  const navLinks = getNavLinks(Boolean(loggedInUser), loggedInUser?.role);

  const confirmLogout = () => {
    dispatch(logout());
    dispatch(clearCartState());
    dispatch(clearWishlistState());
    dispatch(clearNotificationState());
    setLogoutOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center gap-2 px-4 md:px-8">
          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary">
              <span className="text-xs font-bold text-primary-foreground">
                N
              </span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              Nexa Commerce
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            aria-label="Primary"
            className="ml-6 hidden items-center space-x-6 lg:flex"
          >
            {navLinks.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "relative inline-flex h-16 items-center text-sm font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary after:transition-opacity",
                    isActive
                      ? "text-foreground after:opacity-100"
                      : "text-foreground/60 after:opacity-0 hover:text-foreground/80",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right cluster */}
          <div className="ml-auto flex items-center gap-1.5">
            <HeaderSearch className="mr-2 hidden lg:block lg:w-40 xl:w-72" />

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {loggedInUser ? (
              <>
                <HeaderIconLink
                  to="/wishlist"
                  label="Wishlist"
                  icon={Heart}
                  count={wishlistCount}
                  className="hidden lg:inline-flex"
                />
                <HeaderIconLink
                  to="/cart"
                  label="Cart"
                  icon={ShoppingCart}
                  count={cartCount}
                />
                <HeaderIconLink
                  to="/notifications"
                  label="Notifications"
                  icon={Bell}
                  count={unreadCount}
                  tone="danger"
                />
                <div className="ml-1 hidden lg:block">
                  <UserMenu
                    user={loggedInUser}
                    onLogoutClick={() => setLogoutOpen(true)}
                  />
                </div>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="h-9 px-3">
                    Login
                  </Button>
                </Link>
                <Link to="/register" className="hidden sm:block">
                  <Button className="h-9 bg-blue-600 px-4 text-white hover:bg-blue-700">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileOpen}
        onClose={closeMobile}
        links={navLinks}
        isAuthenticated={Boolean(loggedInUser)}
        user={loggedInUser}
        counts={{
          cart: cartCount,
          wishlist: wishlistCount,
          notifications: unreadCount,
        }}
        onLogoutClick={() => setLogoutOpen(true)}
      />

      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={confirmLogout}
      />
    </>
  );
}
