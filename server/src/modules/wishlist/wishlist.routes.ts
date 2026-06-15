import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from "./wishlist.controller.js";

const router = Router();

router.get("/:id", getWishlist);

router.post("/:id", addToWishlist);

router.delete("/:id/:productId", removeFromWishlist);

router.delete("/:id", clearWishlist);

export default router;
