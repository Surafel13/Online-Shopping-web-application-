import mongoose from "mongoose";
import type { ISupportTicket } from "../interface/support.interface.js";
import { AppError } from "../utils/appError.utils.js";
import {
  TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES,
} from "../modules/support/support.constants.js";

const ticketSchema = new mongoose.Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    category: { type: String, enum: [...TICKET_CATEGORIES], required: true },
    priority: { type: String, enum: [...TICKET_PRIORITIES], default: "medium" },
    status: { type: String, enum: [...TICKET_STATUSES], default: "open" },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Users", default: null },
    lastMessageAt: { type: Date, default: Date.now },
    lastMessagePreview: { type: String, default: "" },
    unreadForCustomer: { type: Boolean, default: false },
    unreadForAgents: { type: Boolean, default: true },
    firstResponseAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

ticketSchema.index({ user: 1, lastMessageAt: -1 });
ticketSchema.index({ status: 1, priority: 1, lastMessageAt: -1 });
ticketSchema.index({ assignedTo: 1, status: 1 });

const SupportTicket = mongoose.model<ISupportTicket>("SupportTicket", ticketSchema);
export default SupportTicket;

const counterSchema = new mongoose.Schema<{ _id: string; seq: number }>(
  { _id: { type: String }, seq: { type: Number, default: 0 } },
  { versionKey: false },
);
const Counter = mongoose.model("Counter", counterSchema);

export const nextTicketNumber = async (): Promise<string> => {
  const counter = await Counter.findOneAndUpdate(
    { _id: "supportTicket" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  );
  if (!counter) throw new AppError("Could not generate ticket number", 500);
  return `TKT-${String(counter.seq).padStart(6, "0")}`;
};
