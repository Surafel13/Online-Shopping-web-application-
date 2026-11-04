export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  result?: T;
  profile?: UserProfile;
  order?: ApiOrder;
  orders?: ApiOrder[];
  wishlist?: ApiWishlist;
  errors?: Array<{ field: string; message: string }>;
}

export interface ApiUser {
  _id: string;
  username: string;
  email: string;
  role: "customer" | "admin" | "super_admin";
  isActive: boolean;
  addresses?: ApiAddress[];
  profileImg?: string;
  phone?: string;
  permissionCodes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SuperAdminOverview {
  stats: {
    totalUsers: number;
    totalAdmins: number;
    totalProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
  monthlyRevenue: Array<{ name: string; revenue: number }>;
  recentOrders: ApiOrder[];
  recentUsers: ApiUser[];
}

export interface AuthResult {
  user: ApiUser;
  token: string;
}

export interface ApiAddress {
  _id: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  fullName?: string;
  phone?: string;
  addressType?: "home" | "work" | "other";
  isDefault?: boolean;
}



export type AdminStatus = 'active' | 'suspended' | 'inactive';

export interface ApiPermission {
  _id: string;
  name: string;
  code: string;
  module: string;
  action: string;
  description: string;
  isSystem: boolean;
  roleCount?: number;
  adminCount?: number;
}

export interface ApiRole {
  _id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: ApiPermission[];
  adminCount?: number;
}

export interface ApiAdmin {
  _id: string;
  username: string;
  email: string;
  role: 'admin';
  status: AdminStatus;
  isActive: boolean;
  adminRole: ApiRole | null;
  directPermissions: ApiPermission[];
  effectivePermissions: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type UserProfile = ApiUser;

export interface ApiCategory {
  _id: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  purchasePrice?: number;
  finalPrice?: number;
  discountPercentage?: number;
  category: string | ApiCategory;
  stock: number;
  images: string[];
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiReviewAuthor {
  _id: string;
  username: string;
  profileImg?: string;
}

export interface ApiReview {
  _id: string;
  user: string | ApiReviewAuthor;
  product: string | ApiProduct;
  rating: number;
  title: string;
  comment: string;
  isVerifiedPurchase: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiReviewSummary {
  reviews: ApiReview[];
  rating: number;
  reviewCount: number;
}

export interface ApiCartItem {
  productId: string | ApiProduct;
  quantity: number;
  price: number;
}

export interface ApiCart {
  _id: string;
  userId: string;
  items: ApiCartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiWishlist {
  _id: string;
  userId: string;
  products: Array<string | ApiProduct>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiOrderItem {
  productId: string | ApiProduct;
  quantity: number;
  price: number;
}

export interface ApiShippingAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface ApiOrder {
  _id: string;
  userId: string | ApiUser;
  items: ApiOrderItem[];
  totalAmount: number;
  shippingAddress: ApiShippingAddress;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt?: string;
  updatedAt?: string;
}
