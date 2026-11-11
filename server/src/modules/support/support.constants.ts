export const TICKET_CATEGORIES = [
  "order", "payment", "shipping", "returns", "product", "account", "technical", "other",
] as const;
export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export const TICKET_STATUSES = [
  "open", "in_progress", "waiting_customer", "resolved", "closed",
] as const;
export const NOTIFICATION_TYPES = [
  "support_new_ticket", "support_customer_reply", "support_agent_reply",
  "support_status", "support_assigned",
] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  waiting_customer: "Waiting for customer",
  resolved: "Resolved",
  closed: "Closed",
};

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
export const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg", "image/png", "image/webp", "application/pdf",
];
export const MAX_OPEN_TICKETS = 10;
export const REOPEN_WINDOW_DAYS = 30;

// Reuses the existing RBAC modules: agents need orders:view to read, orders:update to act.
export const SUPPORT_VIEW_PERMISSION = "orders:view";
export const SUPPORT_MANAGE_PERMISSION = "orders:update";
