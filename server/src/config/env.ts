export const env = {
  PORT: Number(process.env.PORT ?? 7000),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRES_IN || "1h",
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL,
};

if (!Number.isInteger(env.PORT) || env.PORT < 1 || env.PORT > 65_535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

if (!env.MONGO_URI) {
  throw new Error("MONGO_URI is not defined in environment variables");
}

if (!env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

if (!env.CLIENT_URL) {
  throw new Error("CLIENT_URL is not defined in environment variables");
}

const clientUrl = new URL(env.CLIENT_URL);
if (
  !["http:", "https:"].includes(clientUrl.protocol) ||
  clientUrl.origin !== env.CLIENT_URL.replace(/\/$/, "")
) {
  throw new Error("CLIENT_URL must be an HTTP(S) origin without a path");
}
env.CLIENT_URL = clientUrl.origin;
