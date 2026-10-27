


export const env = {
  PORT: process.env.PORT || "7000",
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRES_IN || "1h",
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL,
};

if (!env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

if (!env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}
