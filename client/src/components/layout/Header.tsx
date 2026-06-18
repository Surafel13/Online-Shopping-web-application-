import { Link } from 'react-router-dom';
import { Search, Heart, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';

export function Header() {
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
            <Link to="/collections" className="transition-colors hover:text-foreground/80 text-foreground/60">Shop All</Link>
            <Link to="/collections?filter=new" className="transition-colors hover:text-foreground/80 text-foreground/60">New Arrivals</Link>
            <Link to="/collections" className="transition-colors hover:text-foreground/80 text-foreground/60">Collections</Link>
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
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Heart className="h-4 w-4" />
                <span className="sr-only">Wishlist</span>
              </Button>
            </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <ShoppingCart className="h-4 w-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" className="h-9 ml-2">
                Sign In
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
