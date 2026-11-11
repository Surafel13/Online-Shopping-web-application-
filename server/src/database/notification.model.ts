import mongoose from "mongoose";
import type { INotification } from "../interface/support.interface.js";
import { NOTIFICATION_TYPES } from "../modules/support/support.constants.js";

const notificationSchema = new mongoose.Schema<INotification>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    type: { type: String, enum: [...NOTIFICATION_TYPES], required: true },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, default: "", maxlength: 300 },
    link: { type: String, default: "" },
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "SupportTicket", default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;
