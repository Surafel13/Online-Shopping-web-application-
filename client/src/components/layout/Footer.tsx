import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background pt-16 pb-12 transition-colors">
      <div className="container grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 px-4 sm:px-6 max-w-screen-2xl mx-auto">
        {/* Brand & Mission */}
        <div className="md:col-span-4 lg:col-span-5 space-y-4">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/20 transition-transform duration-300 group-hover:scale-105">
              <span className="text-primary-foreground font-extrabold text-sm tracking-tight">
                N
              </span>
            </div>
            <span className="font-extrabold text-xl tracking-tight">
              Sheger Gebeya
            </span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
            Elevating your lifestyle with premium curated goods. Quality,
            sustainability, and exceptional design delivered straight to your
            door.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-muted-foreground font-medium">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 border border-border/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground/80">
              Shop
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/collections?filter=new"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  New Arrivals{" "}
                  <ArrowUpRight className="h-3 w-3 opacity-0 -translate-y-0.5 translate-x-[-2px] group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </li>
              <li>
                <Link
                  to="/collections?filter=bestsellers"
                  className="hover:text-primary transition-colors"
                >
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  to="/collections?category=men"
                  className="hover:text-primary transition-colors"
                >
                  Men
                </Link>
              </li>
              <li>
                <Link
                  to="/collections?category=women"
                  className="hover:text-primary transition-colors"
                >
                  Women
                </Link>
              </li>
              <li>
                <Link
                  to="/collections?category=accessories"
                  className="hover:text-primary transition-colors"
                >
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground/80">
              Support
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/help"
                  className="hover:text-primary transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-primary transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="hover:text-primary transition-colors"
                >
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="hover:text-primary transition-colors"
                >
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4 col-span-2 sm:col-span-1">
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-foreground/80">
              Company
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/sustainability"
                  className="hover:text-primary transition-colors"
                >
                  Sustainability
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/careers"
                  className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                >
                  Careers{" "}
                  <span className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    We're hiring
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="container px-4 sm:px-6 max-w-screen-2xl mx-auto mt-16 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-medium">
        <p>© 2026 Sheger Gebeya. All rights reserved.</p>
        <div className="flex items-center space-x-6">
          <Link to="/security" className="hover:text-primary transition-colors">
            Security
          </Link>
          <Link to="/privacy" className="hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link to="/cookies" className="hover:text-primary transition-colors">
            Cookies
          </Link>
        </div>
      </div>
    </footer>
  );
}
