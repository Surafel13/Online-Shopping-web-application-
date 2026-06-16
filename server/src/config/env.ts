import dotenv from "dotenv";

const result = dotenv.config();

if (result.error) {
  throw result.error;
}

export const env = {
  PORT: process.env.PORT || "4000",
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || "90d",
};

if (!env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

if (!env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}