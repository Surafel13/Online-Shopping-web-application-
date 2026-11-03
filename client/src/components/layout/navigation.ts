import {
  Home,
  Store,
  LayoutGrid,
  Info,
  Mail,
  User,
  Package,
  Heart,
  MapPin,
  Settings,
  ShieldCheck,
  Crown,
  type LucideIcon,
} from 'lucide-react';
import type { AuthUser } from '../../redux/slices/authSlice';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Match the route exactly (needed for "/"). */
  end?: boolean;
}

const HOME: NavItem = { label: 'Home', to: '/', icon: Home, end: true };
const SHOP: NavItem = { label: 'Shop', to: '/collections', icon: Store };
const CATEGORIES: NavItem = { label: 'Categories', to: '/categories', icon: LayoutGrid };
const ABOUT: NavItem = { label: 'About Us', to: '/about', icon: Info };
const CONTACT: NavItem = { label: 'Contact', to: '/contact', icon: Mail };

const ADMIN: NavItem = { label: 'Admin', to: '/admin/overview', icon: ShieldCheck };
const SUPER_ADMIN: NavItem = { label: 'Super Admin', to: '/super-admin/overview', icon: Crown };

/** Primary navigation links, depending on auth state and role. */
export function getNavLinks(isAuthenticated: boolean, role?: AuthUser['role']): NavItem[] {
  const links = isAuthenticated
    ? [HOME, SHOP, CATEGORIES]
    : [HOME, SHOP, CATEGORIES, ABOUT, CONTACT];

  if (isAuthenticated && role === 'admin') links.push(ADMIN);
  if (isAuthenticated && role === 'super_admin') links.push(SUPER_ADMIN);

  return links;
}

/** Links shown in the profile dropdown and the mobile "Account" section. */
export const ACCOUNT_LINKS: NavItem[] = [
  { label: 'My Profile', to: '/profile', icon: User },
  { label: 'My Orders', to: '/orders', icon: Package },
  { label: 'Wishlist', to: '/wishlist', icon: Heart },
  { label: 'Addresses', to: '/account/addresses', icon: MapPin },
  { label: 'Account Settings', to: '/account/settings', icon: Settings },
];
