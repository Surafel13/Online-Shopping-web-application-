import mongoose from "mongoose";
import type { ISupportMessage } from "../interface/support.interface.js";

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false },
);

const messageSchema = new mongoose.Schema<ISupportMessage>(
  {
    ticket: { type: mongoose.Schema.Types.ObjectId, ref: "SupportTicket", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users", default: null },
    senderRole: { type: String, enum: ["customer", "agent", "system"], required: true },
    body: { type: String, default: "", maxlength: 5000 },
    attachments: { type: [attachmentSchema], default: [] },
    isInternal: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);
messageSchema.index({ ticket: 1, createdAt: 1 });

const SupportMessage = mongoose.model<ISupportMessage>("SupportMessage", messageSchema);
export default SupportMessage;
