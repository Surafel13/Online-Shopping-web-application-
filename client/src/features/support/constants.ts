import { formatOrderDate } from "../../lib/mappers";
import type { TicketCategory, TicketPriority, TicketStatus } from "../../types/support";

export const MAX_FILES = 5;
export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export const CATEGORIES: { value: TicketCategory; label: string }[] = [
  { value: "order", label: "Order issue" },
  { value: "payment", label: "Payment & billing" },
  { value: "shipping", label: "Shipping & delivery" },
  { value: "returns", label: "Returns & refunds" },
  { value: "product", label: "Product question" },
  { value: "account", label: "Account & login" },
  { value: "technical", label: "Technical problem" },
  { value: "other", label: "Other" },
];

export const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label])) as Record<TicketCategory, string>;

export const STATUS_META: Record<TicketStatus, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  in_progress: { label: "In progress", cls: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" },
  waiting_customer: { label: "Waiting for customer", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
  resolved: { label: "Resolved", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" },
  closed: { label: "Closed", cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
};

export const PRIORITY_META: Record<TicketPriority, { label: string; cls: string }> = {
  low: { label: "Low", cls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" },
  medium: { label: "Medium", cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
  high: { label: "High", cls: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  urgent: { label: "Urgent", cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" },
};

export const STATUSES = Object.keys(STATUS_META) as TicketStatus[];
export const PRIORITIES = Object.keys(PRIORITY_META) as TicketPriority[];
export const PROGRESS_STEPS: { key: TicketStatus; label: string }[] = [
  { key: "open", label: "Submitted" },
  { key: "in_progress", label: "In progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function timeAgo(iso?: string) {
  if (!iso) return "";
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days < 7 ? `${days}d ago` : formatOrderDate(iso);
}

export function formatDateTime(iso?: string) {
  return iso
    ? new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "";
}
