import { Types } from "mongoose";
import Notification from "../../database/notification.model.js";
import { AppError } from "../../utils/appError.utils.js";
import { logger } from "../../utils/logger/logger.winston.js";
import { emitToUsers } from "../support/support.realtime.js";
import type { NotificationType } from "../support/support.constants.js";
import { pageQuerySchema } from "../support/support.validation.js";

export interface NotifyInput {
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  ticket?: Types.ObjectId | string;
}

export class NotificationService {
  /** Never throws: a failed notification must not fail the main action. */
  async notify(userIds: string[], input: NotifyInput) {
    try {
      const unique = [...new Set(userIds)];
      if (!unique.length) return;
      const docs = await Notification.insertMany(
        unique.map((id) => ({
          user: new Types.ObjectId(id),
          type: input.type,
          title: input.title,
          body: input.body.slice(0, 300),
          link: input.link,
          ticket: input.ticket ? new Types.ObjectId(String(input.ticket)) : null,
        })),
      );
      docs.forEach((doc) => emitToUsers([String(doc.user)], "notification", doc.toObject()));
    } catch (error) {
      logger.warn(`Failed to create notification: ${(error as Error).message}`);
    }
  }

  async list(userId: string, rawQuery: unknown) {
    const { page, limit, unreadOnly } = pageQuerySchema.parse(rawQuery);
    const filter = { user: new Types.ObjectId(userId), ...(unreadOnly ? { isRead: false } : {}) };
    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Notification.countDocuments(filter),
      this.unreadCount(userId),
    ]);
    return { items, unreadCount, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  unreadCount(userId: string) {
    return Notification.countDocuments({ user: userId, isRead: false });
  }

  async markRead(userId: string, id: string) {
    if (!Types.ObjectId.isValid(id)) throw new AppError("Invalid notification id", 400);
    const result = await Notification.updateOne({ _id: id, user: userId }, { $set: { isRead: true } });
    if (!result.matchedCount) throw new AppError("Notification not found", 404);
    return this.unreadCount(userId);
  }

  async markAllRead(userId: string) {
    await Notification.updateMany({ user: userId, isRead: false }, { $set: { isRead: true } });
    return 0;
  }
}

export const notificationService = new NotificationService();
