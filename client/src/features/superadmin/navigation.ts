import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Package,
  Tags,
  ShoppingBag,
  CreditCard,
  Star,
  BarChart3,
  Boxes,
  ScrollText,
  Settings,
  UserCog,
  type LucideIcon,
  KeyRound,
} from "lucide-react";

export interface SuperAdminNavItem {
  name: string;
  slug: string;
  icon: LucideIcon;
  description: string;
  group: string;
}

export const SUPER_ADMIN_BASE = "/super-admin";

export const SUPER_ADMIN_NAV: SuperAdminNavItem[] = [
  {
    name: "Overview",
    slug: "overview",
    icon: LayoutDashboard,
    group: "Main",
    description: "Platform-wide snapshot of users, sales and system health.",
  },
  {
    name: "User Management",
    slug: "users",
    icon: Users,
    group: "People",
    description: "View, search, activate and deactivate customer accounts.",
  },
  {
    name: "Admin Management",
    slug: "admins",
    icon: ShieldCheck,
    group: "People",
    description: "Create, promote and revoke administrator access.",
  },
  {
    name: "Permissions",
    slug: "permissions",
    icon: KeyRound,
    group: "People",
    description: "Create permissions and roles and control admin access.",
  },
  {
    name: "Product Management",
    slug: "products",
    icon: Package,
    group: "Commerce",
    description: "Oversee the full product catalog across the platform.",
  },
  {
    name: "Category Management",
    slug: "categories",
    icon: Tags,
    group: "Commerce",
    description: "Organize and maintain storefront categories.",
  },
  {
    name: "Order Management",
    slug: "orders",
    icon: ShoppingBag,
    group: "Commerce",
    description: "Monitor, update and audit all customer orders.",
  },
  {
    name: "Payment Management",
    slug: "payments",
    icon: CreditCard,
    group: "Commerce",
    description: "Track transactions, payment statuses and refunds.",
  },
  {
    name: "Reviews & Ratings",
    slug: "reviews",
    icon: Star,
    group: "Commerce",
    description: "Moderate customer reviews and product ratings.",
  },
  {
    name: "Reports & Analytics",
    slug: "reports",
    icon: BarChart3,
    group: "Insights",
    description: "Deep-dive reports on revenue, growth and performance.",
  },
  {
    name: "Inventory Management",
    slug: "inventory",
    icon: Boxes,
    group: "Insights",
    description: "Stock levels, low-stock alerts and replenishment.",
  },
  {
    name: "Activity Logs",
    slug: "activity-logs",
    icon: ScrollText,
    group: "Insights",
    description: "Audit trail of administrative and system actions.",
  },
  {
    name: "System Settings",
    slug: "settings",
    icon: Settings,
    group: "System",
    description: "Global store configuration and platform preferences.",
  },
  {
    name: "Profile Settings",
    slug: "profile",
    icon: UserCog,
    group: "System",
    description: "Manage your super admin profile and security.",
  },
];

export const superAdminPath = (slug: string) => `${SUPER_ADMIN_BASE}/${slug}`;
