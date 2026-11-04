import mongoose from "mongoose";
import { PERMISSION_MODULES } from "../modules/rbac/rbac.constants.js";

const permissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    module: { type: String, enum: [...PERMISSION_MODULES], required: true },
    action: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String, trim: true, default: "" },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Permission = mongoose.model("Permission", permissionSchema);
export default Permission;
