import express from "express"
import { signup, login } from "./auth.controller.js";

const authRoute = express.Router();

authRoute.post("/signup", signup)
authRoute.post("/login", login)

export default authRoute
