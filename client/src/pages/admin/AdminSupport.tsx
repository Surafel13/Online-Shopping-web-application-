import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Inbox,
  Search,
  UserX,
} from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { AdminLoadingState } from "../../components/shared/AdminLoadingState";
import { Pagination } from "../../components/shared/Pagination";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { AdminFaqManager } from "../../features/support/AdminFaqManager";
import { AdminTicketPanel } from "../../features/support/AdminTicketPanel";
import {
  PriorityBadge,
  StatusBadge,
} from "../../features/support/TicketBadges";
import { onSupportEvent } from "../../features/support/supportEvents";
import {
  CATEGORIES,
  CATEGORY_LABEL,
  PRIORITIES,
  PRIORITY_META,
  STATUSES,
  STATUS_META,
  timeAgo,
} from "../../features/support/constants";
import { supportService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { useAppDispatch } from "../../hooks/useRedux";
import { showError } from "../../redux/slices/uiSlice";
import { cn } from "../../lib/utils";
import type {
  Pagination as PaginationInfo,
  SupportStats,
  SupportTicket,
  SupportUserRef,
} from "../../types/support";

const filterSelectCls =
  "flex h-9 w-full rounded-lg border border-border/70 bg-background px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto";

function StatPill({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Inbox;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3.5 px-5 py-3.5">
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
          tone,
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-lg font-bold tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function TicketList({ onOpen }: { onOpen: (id: string) => void }) {
  const dispatch = useAppDispatch();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 15,
    total: 0,
    pages: 1,
  });
  const [stats, setStats] = useState<SupportStats | null>(null);
  const [agents, setAgents] = useState<SupportUserRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    category: "",
    assigned: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let current = true;
    supportService
      .adminAgents()
      .then((a) => current && setAgents(a))
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    let current = true;
    Promise.all([
      supportService.adminList({ page, limit: 15, search, ...filters }),
      supportService.adminStats(),
    ])
      .then(([list, s]) => {
        if (!current) return;
        setTickets(list.tickets);
        setPagination(list.pagination);
        setStats(s);
      })
      .catch(
        (err: unknown) =>
          current &&
          dispatch(
            showError(getApiErrorMessage(err, "Failed to load tickets.")),
          ),
      )
      .finally(() => current && setIsLoading(false));
    return () => {
      current = false;
    };
  }, [page, search, filters, reloadKey, dispatch]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setReloadKey((k) => k + 1), 600);
    };
    const offs = ["ticket", "message", "reconnected"].map((e) =>
      onSupportEvent(e, refresh),
    );
    return () => {
      clearTimeout(timer);
      offs.forEach((off) => off());
    };
  }, []);

  const setFilter = (key: keyof typeof filters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const cards = useMemo(
    () =>
      stats
        ? [
            {
              label: "Open",
              value: stats.open + stats.inProgress + stats.waiting,
              icon: Inbox,
              tone: "bg-blue-500/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
            },
            {
              label: "Unassigned",
              value: stats.unassigned,
              icon: UserX,
              tone: "bg-amber-500/10 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400",
            },
            {
              label: "Urgent",
              value: stats.urgent,
              icon: AlertTriangle,
              tone: "bg-rose-500/10 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400",
            },
            {
              label: "Resolved",
              value: stats.resolved + stats.closed,
              icon: CheckCircle2,
              tone: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
            },
            {
              label: "Avg response",
              value:
                stats.avgFirstResponseMinutes === null
                  ? "—"
                  : stats.avgFirstResponseMinutes < 60
                    ? `${stats.avgFirstResponseMinutes}m`
                    : `${(stats.avgFirstResponseMinutes / 60).toFixed(1)}h`,
              icon: Clock,
              tone: "bg-purple-500/10 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
            },
          ]
        : [],
    [stats],
  );

  return (
    <div className="space-y-6">
      {/* Metric Cards Banner */}
      {cards.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
          <div className="grid grid-cols-2 divide-y divide-border/60 sm:grid-cols-3 sm:divide-y-0 sm:divide-x xl:grid-cols-5">
            {cards.map((c) => (
              <StatPill
                key={c.label}
                label={c.label}
                value={String(c.value)}
                icon={c.icon}
                tone={c.tone}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Table & Filter Container */}
      <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
        {/* Toolbar Header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/20 p-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 rounded-lg border-border/70 bg-background pl-9 text-xs"
              placeholder="Search ticket, subject, user..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Status"
              className={filterSelectCls}
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>

            <select
              aria-label="Priority"
              className={filterSelectCls}
              value={filters.priority}
              onChange={(e) => setFilter("priority", e.target.value)}
            >
              <option value="">All Priorities</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_META[p].label}
                </option>
              ))}
            </select>

            <select
              aria-label="Category"
              className={filterSelectCls}
              value={filters.category}
              onChange={(e) => setFilter("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>

            <select
              aria-label="Assignee"
              className={filterSelectCls}
              value={filters.assigned}
              onChange={(e) => setFilter("assigned", e.target.value)}
            >
              <option value="">All Assignees</option>
              <option value="me">Assigned to me</option>
              <option value="unassigned">Unassigned</option>
              {agents.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Stream */}
        {isLoading ? (
          <AdminLoadingState message="Loading tickets..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Ticket</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Agent</th>
                  <th className="px-6 py-3.5">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {tickets.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      No tickets match your filters.
                    </td>
                  </tr>
                )}
                {tickets.map((t) => {
                  const customer = typeof t.user === "object" ? t.user : null;
                  const agent =
                    typeof t.assignedTo === "object" && t.assignedTo
                      ? t.assignedTo.username
                      : null;

                  return (
                    <tr
                      key={t._id}
                      tabIndex={0}
                      onClick={() => onOpen(t._id)}
                      onKeyDown={(e) => e.key === "Enter" && onOpen(t._id)}
                      className="group cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
                    >
                      <td className="max-w-[300px] px-6 py-4">
                        <div className="flex items-center gap-2">
                          {t.unreadForAgents && (
                            <span
                              className="h-2 w-2 shrink-0 rounded-full bg-blue-600 ring-4 ring-blue-600/10"
                              aria-label="Unread"
                            />
                          )}
                          <span className="font-mono text-xs font-bold text-muted-foreground">
                            {t.ticketNumber}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "truncate text-sm",
                            t.unreadForAgents
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground/80",
                          )}
                        >
                          {t.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">
                          {customer?.username ?? "Customer"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {customer?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                        {CATEGORY_LABEL[t.category]}
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="px-6 py-4 text-xs font-medium">
                        {agent ? (
                          <span className="text-foreground">{agent}</span>
                        ) : (
                          <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {timeAgo(t.lastMessageAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Pagination */}
        <div className="border-t border-border/60 px-4 py-2">
          <Pagination
            page={pagination.page}
            pageCount={pagination.pages}
            total={pagination.total}
            pageSize={pagination.limit}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}

export function AdminSupportDashboard() {
  const [params, setParams] = useSearchParams();
  const ticketId = params.get("ticket");

  const openTicket = (id: string) => setParams({ ticket: id });
  const closeTicket = () => setParams({});

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        {ticketId ? (
          <AdminTicketPanel
            key={ticketId}
            ticketId={ticketId}
            onBack={closeTicket}
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Customer Support
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Manage tickets, respond to customers, and maintain help center
                  contents.
                </p>
              </div>
            </div>

            <Tabs defaultValue="tickets" className="space-y-4">
              <TabsList className="h-10 rounded-xl bg-muted/60 p-1">
                <TabsTrigger
                  value="tickets"
                  className="rounded-lg px-4 text-xs font-medium"
                >
                  Tickets
                </TabsTrigger>
                <TabsTrigger
                  value="faqs"
                  className="rounded-lg px-4 text-xs font-medium"
                >
                  FAQs
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="tickets"
                className="focus-visible:outline-none"
              >
                <TicketList onOpen={openTicket} />
              </TabsContent>
              <TabsContent value="faqs" className="focus-visible:outline-none">
                <AdminFaqManager />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </PageTransition>
  );
}
