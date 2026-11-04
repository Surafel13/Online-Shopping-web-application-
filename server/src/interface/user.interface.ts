import type { Types } from "mongoose";

export interface IAddress {
  _id?: Types.ObjectId;
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

export interface IUser {
  _id?: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  phone?: string;
  role: "customer" | "admin" | "super_admin";
  isActive: boolean;
  addresses: IAddress[];
  profileImg?: string;
  status?: "active" | "suspended" | "inactive";
  adminRole?: Types.ObjectId | null;
  directPermissions?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
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
