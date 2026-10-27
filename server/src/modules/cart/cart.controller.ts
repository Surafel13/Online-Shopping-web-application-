import { CartService } from "./cart.service.js";
import asyncHandler from "express-async-handler";
import type { Request, Response } from "express";

const cartService = new CartService();

export const addItemToCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id as string


    const cart = await cartService.addItemToCart(userId, productId, quantity);

    res.status(200).json({
      success: true,
      data: cart,
    });
  },
);

export const getCartByUserId = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id as string;

    const cart = await cartService.getCartByUserId(userId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  },
);

export const getCartById = asyncHandler(async (req: Request, res: Response) => {
  const cartId = req.params.cartId as string;

  const cart = await cartService.getCartById(cartId);

  res.status(200).json({
    success: true,
    data: cart,
  });
});

export const removeItemFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = req.body;
    const userId = req.user.id as string

    const cart = await cartService.removeItemFromCart(userId, productId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  },
);

export const updateItemQuantity = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId, quantity } = req.body;
    const userId = req.user.id as string
    
    const cart = await cartService.updateItemQuantity(
      userId,
      productId,
      quantity,
    );

    res.status(200).json({
      success: true,
      data: cart,
    });
  },
);

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cartId = req.params.cartId as string;

  const cart = await cartService.clearCart(cartId);

  res.status(200).json({
    success: true,
    data: cart,
  });
});

export const deleteCart = asyncHandler(async (req: Request, res: Response) => {
  const cartId = req.params.cartId as string;

  await cartService.deleteCart(cartId);

  res.status(200).json({
    success: true,
    message: "Cart deleted successfully",
  });
});

export const getAllCarts = asyncHandler(
  async (_req: Request, res: Response) => {
    const carts = await cartService.getAllCarts();

    res.status(200).json({
      success: true,
      data: carts,
    });
  },
);
