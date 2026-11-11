import { cn } from "../../lib/utils";
import { PRIORITY_META, STATUS_META } from "./constants";
import type { TicketPriority, TicketStatus } from "../../types/support";

const base = "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium";

export const StatusBadge = ({ status, className }: { status: TicketStatus; className?: string }) => (
  <span className={cn(base, STATUS_META[status].cls, className)}>{STATUS_META[status].label}</span>
);

export const PriorityBadge = ({ priority, className }: { priority: TicketPriority; className?: string }) => (
  <span className={cn(base, PRIORITY_META[priority].cls, className)}>{PRIORITY_META[priority].label}</span>
);
