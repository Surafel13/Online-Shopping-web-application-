import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";

import morganMiddleware from "./utils/logger/morgan.middleware.js";
import { ErrorHandler } from "./middleware/error.middleware.js";
import { authMiddleware } from "./middleware/auth.middleware.js";
import {
    globalRateLimit,
    authRateLimiter,
} from "./utils/rateLimiter.middlware.js";

// Routes
import authRoute from "./modules/auth/auth.routes.js";
import userRoute from "./modules/users/user.routes.js";
import productRoute from "./modules/product/product.route.js";
import categoryRoute from "./modules/catagory/catagory.route.js";
import cartRoute from "./modules/cart/cart.route.js";
import orderRoute from "./modules/orders/order.routes.js";
import wishlistRoute from "./modules/wishlist/wishlist.routes.js";

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(globalRateLimit);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morganMiddleware);


// Auth routes (rate limited)
app.use("/api/auth", authRateLimiter, authRoute);

// Public routes (NO auth required for browsing)
app.use("/api/products", productRoute);
app.use("/api/categories", categoryRoute);

// Protected user/account routes
app.use("/api/account", authMiddleware, userRoute);
app.use("/api/cart", authMiddleware, cartRoute);
app.use("/api/orders", authMiddleware, orderRoute);
app.use("/api/wishlist", authMiddleware, wishlistRoute);


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});;



app.use(ErrorHandler);

export default app;