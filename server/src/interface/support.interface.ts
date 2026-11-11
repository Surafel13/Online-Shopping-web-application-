import type { Types } from "mongoose";
import type {
  NotificationType, TicketCategory, TicketPriority, TicketStatus,
} from "../modules/support/support.constants.js";

export interface IAttachment {
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface ISupportTicket {
  ticketNumber: string;
  user: Types.ObjectId;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  order?: Types.ObjectId | null;
  assignedTo?: Types.ObjectId | null;
  lastMessageAt: Date;
  lastMessagePreview: string;
  unreadForCustomer: boolean;
  unreadForAgents: boolean;
  firstResponseAt?: Date | null;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISupportMessage {
  ticket: Types.ObjectId;
  sender?: Types.ObjectId | null;
  senderRole: "customer" | "agent" | "system";
  body: string;
  attachments: IAttachment[];
  isInternal: boolean;
  createdAt?: Date;
}

export interface IFaq {
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface INotification {
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  ticket?: Types.ObjectId | null;
  isRead: boolean;
}
