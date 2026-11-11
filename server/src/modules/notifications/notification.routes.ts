import { Router } from "express";
import {
  getUnreadCount, listNotifications, markAllNotificationsRead, markNotificationRead,
} from "./notification.controller.js";

const notificationRoute = Router();

notificationRoute.get("/", listNotifications);
notificationRoute.get("/unread-count", getUnreadCount);
notificationRoute.patch("/read-all", markAllNotificationsRead);
notificationRoute.patch("/:id/read", markNotificationRead);

export default notificationRoute;
