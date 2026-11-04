export type UserRole = "customer" | "admin" | "super_admin";

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  country: string;
  city: string;
  state: string;
  street: string;
  postalCode: string;
  addressType: "home" | "work" | "other";
  isDefault: boolean;
}

export interface IUser {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isVerified: boolean;
  status: "active" | "suspended" | "deactivated" | "inactive";
  addresses: IAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateProfile {
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface IChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IRegister {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IUserState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
