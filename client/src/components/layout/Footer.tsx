import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t bg-background py-12 md:py-16">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8 px-4 md:px-8 max-w-screen-2xl">
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center space-x-2 mb-4">
            <div className="h-6 w-6 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">N</span>
            </div>
            <span className="font-bold text-xl">Nexa Commerce</span>
          </Link>
          <p className="text-sm text-muted-foreground mb-6">
            Elevating your lifestyle with premium curated goods. Quality, sustainability, and style delivered to your door.
          </p>
        </div>
        
        <div>
          <h3 className="font-medium mb-4">SHOP</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/collections?filter=new" className="hover:text-primary">New Arrivals</Link></li>
            <li><Link to="/collections?filter=bestsellers" className="hover:text-primary">Best Sellers</Link></li>
            <li><Link to="/collections?category=men" className="hover:text-primary">Men</Link></li>
            <li><Link to="/collections?category=women" className="hover:text-primary">Women</Link></li>
            <li><Link to="/collections?category=accessories" className="hover:text-primary">Accessories</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-4">SUPPORT</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/help" className="hover:text-primary">Help Center</Link></li>
            <li><Link to="/shipping" className="hover:text-primary">Shipping Policy</Link></li>
            <li><Link to="/returns" className="hover:text-primary">Returns & Exchanges</Link></li>
            <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
            <li><Link to="/faq" className="hover:text-primary">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-4">COMPANY</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-primary">About Us</Link></li>
            <li><Link to="/sustainability" className="hover:text-primary">Sustainability</Link></li>
            <li><Link to="/terms" className="hover:text-primary">Terms of Service</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link to="/careers" className="hover:text-primary">Careers</Link></li>
          </ul>
        </div>
      </div>
      <div className="container px-4 md:px-8 max-w-screen-2xl mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
        <p>© 2024 Nexa Commerce. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <Link to="/security" className="hover:text-primary">Security</Link>
          <Link to="/privacy" className="hover:text-primary">Privacy</Link>
          <Link to="/cookies" className="hover:text-primary">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}
