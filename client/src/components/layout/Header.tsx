import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, LogOut, Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../redux/store';
import { logout } from '../../redux/slices/authSlice';
import { clearCartState } from '../../redux/slices/cartSlice';
import { clearWishlistState } from '../../redux/slices/wishlistSlice';
import { toggleTheme } from '../../redux/slices/themeSlice';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

export function Header() {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { totalItems } = useSelector((state: RootState) => state.cart);
  const theme = useSelector((state: RootState) => state.theme.theme);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCartState());
    dispatch(clearWishlistState());
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <div className="h-6 w-6 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">N</span>
            </div>
            <span className="hidden font-bold sm:inline-block">
              Nexa Commerce
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/" className="transition-colors hover:text-foreground/80 text-foreground/60">Home</Link>
            <Link to="/collections" className="transition-colors hover:text-foreground/80 text-foreground/60">Shop All</Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin/overview" className="transition-colors hover:text-foreground/80 text-foreground/60">
                Admin
              </Link>
            )}
            {isAuthenticated && (
              <>
                <Link to="/orders" className="transition-colors hover:text-foreground/80 text-foreground/60">My Orders</Link>
                <Link to="/cart" className="transition-colors hover:text-foreground/80 text-foreground/60">My Cart</Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search products, brands..."
                className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8 md:w-[300px]"
              />
            </div>
          </div>
          <nav className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9" 
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {!isAuthenticated ? (
              <>
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <ShoppingCart className="h-4 w-4" />
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {totalItems}
                      </span>
                    )}
                    <span className="sr-only">Cart</span>
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="ghost" className="h-9 px-3">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="h-9 px-4 ml-1 bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
                </Link>
              </>
            ) : (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <div className="flex items-center justify-start gap-2 p-3 pb-2">
                      <div className="flex flex-col space-y-1">
                        <p className="font-medium text-sm leading-none">{user?.name || 'Customer'}</p>
                        <p className="w-[180px] truncate text-xs text-muted-foreground">{user?.email || 'customer@example.com'}</p>
                      </div>
                    </div>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer flex w-full items-center py-2"><User className="mr-2 h-4 w-4" /> Profile Info</Link>
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem className="cursor-pointer text-red-600 py-2 focus:text-red-600 focus:bg-red-50" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
