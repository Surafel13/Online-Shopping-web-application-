import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { WishlistService } from "./wishlist.service.js";

const wishlistService = new WishlistService();

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const wishlist = await wishlistService.getWishlist(userId);

  res.status(200).json({
    success: true,
    wishlist,
  });
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const productId = req.body.productId as string;

  const wishlist = await wishlistService.addToWishlist(userId, productId);

  res.status(200).json({
    success: true,
    wishlist,
  });
});

export const removeFromWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const productId = req.params.productId as string;

  const wishlist = await wishlistService.removeFromWishlist(userId, productId);

  res.status(200).json({
    success: true,
    wishlist,
  });
});

export const clearWishlist = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user.id ;

  const wishlist = await wishlistService.clearWishlist(userId);

  res.status(200).json({
    success: true,
    wishlist,
  });
});