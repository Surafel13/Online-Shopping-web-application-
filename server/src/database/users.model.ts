import mongoose from "mongoose";
import type { IUser } from "../interface/user.interface.js";
import { ADMIN_STATUSES } from "../modules/rbac/rbac.constants.js";

const addressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    street: {
        type: String,
        required: true
    },
    city: {
         type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    postalCode: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    addressType: {
        type: String,
        enum: ["home", "work", "other"],
        default: "home"
    },
    isDefault: {
        type: Boolean,
        default: false
    }
});

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ["customer", "admin", "super_admin"],
        message: "{VALUE} is not supported role.",
      },
      default: "customer",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: [...ADMIN_STATUSES],
      
      default: "active",
    },
    adminRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    directPermissions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Permission" },
    ],
    addresses: [addressSchema],
    profileImg: {
      type: String,
    },
  },
  { timestamps: true },
);

const Users = mongoose.model<IUser>("Users", userSchema)
export default Users
