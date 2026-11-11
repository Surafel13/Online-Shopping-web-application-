import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Inbox, MessageSquarePlus, Paperclip, Search } from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PriorityBadge, StatusBadge } from "../../features/support/TicketBadges";
import { onSupportEvent } from "../../features/support/supportEvents";
import { CATEGORY_LABEL, timeAgo } from "../../features/support/constants";
import { supportService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { cn } from "../../lib/utils";
import type { SupportTicket } from "../../types/support";

const FILTERS = [
  { value: "", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "waiting_customer", label: "Awaiting your reply" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const upsert = (list: SupportTicket[], ticket: SupportTicket) =>
  [ticket, ...list.filter((t) => t._id !== ticket._id)].sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));

export function MyTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let current = true;
    supportService
      .listMine()
      .then((data) => current && setTickets(data))
      .catch((err: unknown) => current && setError(getApiErrorMessage(err, "Unable to load your tickets.")))
      .finally(() => current && setIsLoading(false));
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    const apply = (event: { ticket: SupportTicket }) => setTickets((list) => upsert(list, event.ticket));
    const offTicket = onSupportEvent<{ ticket: SupportTicket }>("ticket", apply);
    const offMessage = onSupportEvent<{ ticket: SupportTicket }>("message", apply);
    const offReconnect = onSupportEvent("reconnected", () => {
      supportService.listMine().then(setTickets).catch(() => undefined);
    });
    return () => {
      offTicket();
      offMessage();
      offReconnect();
    };
  }, []);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter(
      (t) =>
        (!filter || t.status === filter) &&
        (t.subject.toLowerCase().includes(q) || t.ticketNumber.toLowerCase().includes(q)),
    );
  }, [tickets, filter, search]);

  return (
    <PageTransition>
      <div className="container mx-auto max-w-screen-lg px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My support tickets</h1>
            <p className="mt-1 text-sm text-muted-foreground">Track your requests and chat with our team.</p>
          </div>
          <Link to="/support/tickets/new">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700"><MessageSquarePlus className="h-4 w-4" /> New ticket</Button>
          </Link>
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1.5 overflow-x-auto rounded-xl border bg-muted/40 p-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  filter === f.value ? "bg-blue-600 text-white shadow" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-10 pl-9" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />)}</div>
        ) : error ? (
          <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-600" role="alert">{error}</p>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <Inbox className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-semibold">{tickets.length === 0 ? "You have no tickets yet" : "No tickets match your filters"}</p>
            <p className="mt-1 text-sm text-muted-foreground">Need a hand? Open a ticket and we'll get back to you.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {visible.map((ticket) => {
              const agent = typeof ticket.assignedTo === "object" && ticket.assignedTo ? ticket.assignedTo.username : null;
              return (
                <li key={ticket._id}>
                  <Link
                    to={`/support/tickets/${ticket._id}`}
                    className="block rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono font-semibold">{ticket.ticketNumber}</span>
                          <span>·</span>
                          <span>{CATEGORY_LABEL[ticket.category]}</span>
                          {ticket.unreadForCustomer && <span className="h-2 w-2 rounded-full bg-blue-600" aria-label="Unread reply" />}
                        </div>
                        <h2 className={cn("mt-1 truncate text-base", ticket.unreadForCustomer ? "font-bold" : "font-semibold")}>{ticket.subject}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={ticket.priority} />
                        <StatusBadge status={ticket.status} />
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      {ticket.lastMessagePreview.startsWith("Sent an attachment") && <Paperclip className="h-3.5 w-3.5" />}
                      {ticket.lastMessagePreview}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Updated {timeAgo(ticket.lastMessageAt)}{agent ? ` · Handled by ${agent}` : " · Awaiting assignment"}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </PageTransition>
  );
}
