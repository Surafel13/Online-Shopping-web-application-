import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Tags,
  Boxes,
  ShoppingBag,
  CreditCard,
  RotateCcw,
  Users,
  Store,
  Megaphone,
  Ticket,
  Star,
  HeadphonesIcon,
  Scale,
  Bell,
  TrendingUp,
  DollarSign,
  BarChart3,
  UserCog,
  Lock,
  type LucideIcon,
} from "lucide-react";

import { hasPermission } from "../../lib/permissions";
import type { AuthUser } from "../../redux/slices/authSlice";

export interface AdminNavItem {
  name: string;
  slug: string;
  icon: LucideIcon;
  description: string;
  group: string;
}

export const ADMIN_BASE = "/admin";

export const ADMIN_NAV: AdminNavItem[] = [
  // Dashboard
  {
    name: "Overview",
    slug: "overview",
    icon: LayoutDashboard,
    group: "Dashboard",
    description: "Store-wide snapshot of sales, orders and activity.",
  },

  // Catalog Management
  {
    name: "Products",
    slug: "products",
    icon: Package,
    group: "Catalog Management",
    description: "Manage your product catalog and listings.",
  },
  {
    name: "Add Product",
    slug: "add-product",
    icon: PlusCircle,
    group: "Catalog Management",
    description: "Create a new product listing.",
  },
  {
    name: "Categories",
    slug: "categories",
    icon: Tags,
    group: "Catalog Management",
    description: "Organize and manage product categories.",
  },
  {
    name: "Inventory",
    slug: "inventory",
    icon: Boxes,
    group: "Catalog Management",
    description: "Track stock levels and manage inventory.",
  },

  // Sales Management
  {
    name: "Orders",
    slug: "orders",
    icon: ShoppingBag,
    group: "Sales Management",
    description: "View and manage customer orders.",
  },
  {
    name: "Payments",
    slug: "payments",
    icon: CreditCard,
    group: "Sales Management",
    description: "Track payment transactions and statuses.",
  },
  {
    name: "Refunds",
    slug: "refunds",
    icon: RotateCcw,
    group: "Sales Management",
    description: "Process and manage customer refunds.",
  },

  // User Management
  {
    name: "Customers",
    slug: "customers",
    icon: Users,
    group: "User Management",
    description: "View and manage customer accounts.",
  },
  {
    name: "Sellers",
    slug: "sellers",
    icon: Store,
    group: "User Management",
    description: "Manage seller accounts and activity.",
  },

  // Marketing
  {
    name: "Promotions",
    slug: "promotions",
    icon: Megaphone,
    group: "Marketing",
    description: "Create and manage promotional campaigns.",
  },
  {
    name: "Coupons",
    slug: "coupons",
    icon: Ticket,
    group: "Marketing",
    description: "Generate and track discount coupons.",
  },

  // Customer Engagement
  {
    name: "Reviews & Ratings",
    slug: "reviews",
    icon: Star,
    group: "Customer Engagement",
    description: "Moderate customer reviews and product ratings.",
  },
  {
    name: "Customer Support",
    slug: "support",
    icon: HeadphonesIcon,
    group: "Customer Engagement",
    description: "Handle customer inquiries and support tickets.",
  },
  {
    name: "Disputes",
    slug: "disputes",
    icon: Scale,
    group: "Customer Engagement",
    description: "Manage and resolve customer disputes.",
  },
  {
    name: "Notifications",
    slug: "notifications",
    icon: Bell,
    group: "Customer Engagement",
    description: "Manage store and customer notifications.",
  },

  // Analytics
  {
    name: "Sales Reports",
    slug: "analytics/sales",
    icon: TrendingUp,
    group: "Analytics",
    description: "Detailed reports on sales performance and trends.",
  },
  {
    name: "Revenue Reports",
    slug: "analytics/revenue",
    icon: DollarSign,
    group: "Analytics",
    description: "Revenue breakdowns and financial summaries.",
  },
  {
    name: "Product Performance",
    slug: "analytics/products",
    icon: BarChart3,
    group: "Analytics",
    description: "Track individual product performance metrics.",
  },

  // Account Settings
  {
    name: "Profile Settings",
    slug: "settings",
    icon: UserCog,
    group: "Account Settings",
    description: "Manage your admin profile and preferences.",
  },
  {
    name: "Change Password",
    slug: "change-password",
    icon: Lock,
    group: "Account Settings",
    description: "Update your account password.",
  },
];

export const ADMIN_PERMISSION_BY_SLUG: Record<string, string> = {
  products: "products:view",
  "add-product": "products:create",
  categories: "products:view",
  inventory: "inventory:view",
  orders: "orders:view",
  payments: "payments:view",
  refunds: "payments:view",
  customers: "customers:view",
  sellers: "customers:view",
  promotions: "products:update",
  coupons: "products:update",
  reviews: "products:view",
  support: "orders:view",
  disputes: "orders:view",
  notifications: "orders:view",
  analytics: "reports:view",
  "analytics/sales": "reports:view",
  "analytics/revenue": "reports:view",
  "analytics/products": "reports:view",
};

export const getAdminSlugFromPath = (pathname: string) =>
  pathname.replace(/^\/admin\/?/, "").replace(/\/$/, "") || "overview";

export const canAccessAdminSlug = (
  user: Pick<AuthUser, "role" | "permissions"> | null | undefined,
  slug: string,
) => hasPermission(user, ADMIN_PERMISSION_BY_SLUG[slug]);

export const adminPath = (slug: string) => `${ADMIN_BASE}/${slug}`;
