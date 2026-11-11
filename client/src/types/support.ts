export type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketCategory =
  | "order" | "payment" | "shipping" | "returns" | "product" | "account" | "technical" | "other";

export interface SupportUserRef {
  _id: string;
  username: string;
  email?: string;
  profileImg?: string;
  role?: string;
}

export interface SupportAttachment {
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface SupportTicket {
  _id: string;
  ticketNumber: string;
  user: string | SupportUserRef;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  order?: null | string | { _id: string; totalAmount: number; orderStatus: string; paymentStatus: string; createdAt?: string };
  assignedTo?: null | string | SupportUserRef;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadForCustomer: boolean;
  unreadForAgents: boolean;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportMessage {
  _id: string;
  ticket: string;
  sender: SupportUserRef | null;
  senderRole: "customer" | "agent" | "system";
  body: string;
  attachments: SupportAttachment[];
  isInternal: boolean;
  createdAt: string;
}

export interface Faq {
  _id: string;
  question: string;
  answer: string;
  category: string;
  isPublished: boolean;
  sortOrder: number;
}

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SupportStats {
  total: number;
  open: number;
  inProgress: number;
  waiting: number;
  resolved: number;
  closed: number;
  unassigned: number;
  urgent: number;
  mine: number;
  avgFirstResponseMinutes: number | null;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  assigned?: string;
  search?: string;
}
