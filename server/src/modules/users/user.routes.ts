import express from "express";
import { getProfile, updateProfile, deleteProfile } from "./user.controller.js";

const userRoute = express.Router();

userRoute.get("/:id", getProfile)
userRoute.put("/:id", updateProfile)
userRoute.delete("/:id", deleteProfile)

export default userRoute;