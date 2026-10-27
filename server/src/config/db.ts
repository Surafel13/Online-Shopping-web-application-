import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDb = async (): Promise<void> => {
  await mongoose.connect(env.MONGO_URI);
  console.log("MongoDB connected successfully");
};
