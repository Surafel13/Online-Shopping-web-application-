import express from "express"
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json())
app.use(cookieParser());

// middlewares
import { ErrorHandler } from "./middleware/error.middleware.js";


// Routes

import authRoute from "./modules/auth/auth.routes.js";
import userRoute from "./modules/users/user.routes.js";
import productRoute from "./modules/product/product.route.js";
import catagoryRoute from "./modules/catagory/catagory.route.js";



app.use("/api/auth", authRoute)
app.use("/api/account", userRoute)
app.use("/api/categories", catagoryRoute)
app.use("/api/products", productRoute)


app.use(ErrorHandler)

export default app;