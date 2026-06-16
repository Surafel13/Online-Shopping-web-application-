import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "./wishlist.controller.js";

const router = Router();

router.get("/", getWishlist);

router.post("/", addToWishlist);

router.delete("/:productId", removeFromWishlist);

router.delete("/", clearWishlist);

export default router;
