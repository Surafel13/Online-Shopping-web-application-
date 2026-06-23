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
  role: 'customer' | 'admin';
  isActive: boolean;
  addresses?: ApiAddress[];
  profileImg?: string;
  createdAt?: string;
  updatedAt?: string;
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
  category: string | ApiCategory;
  stock: number;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
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
