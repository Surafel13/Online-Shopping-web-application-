import express from "express";
import { getProfile, updateProfile, deleteProfile, addAddress, updateAddress, deleteAddress } from "./user.controller.js";

const userRoute = express.Router();

userRoute.get("/:id", getProfile)
userRoute.put("/:id", updateProfile)
userRoute.delete("/:id", deleteProfile)
userRoute.post("/:id/address", addAddress)
userRoute.put("/:id/address/:addressId", updateAddress)
userRoute.delete("/:id/address/:addressId", deleteAddress)

export default userRoute;