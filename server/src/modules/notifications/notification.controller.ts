import type { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { getAuthenticatedUser } from "../../middleware/auth.middleware.js";
import { notificationService } from "./notification.service.js";

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { items, unreadCount, pagination } = await notificationService.list(
    getAuthenticatedUser(req).id,
    req.query,
  );
  res.status(200).json({ success: true, data: items, unreadCount, pagination });
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.unreadCount(getAuthenticatedUser(req).id);
  res.status(200).json({ success: true, data: { count } });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.markRead(
    getAuthenticatedUser(req).id,
    req.params.id as string,
  );
  res.status(200).json({ success: true, data: { count } });
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const count = await notificationService.markAllRead(getAuthenticatedUser(req).id);
  res.status(200).json({ success: true, data: { count } });
});
