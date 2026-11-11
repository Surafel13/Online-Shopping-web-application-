import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Mail, UserPlus } from "lucide-react";
import { AdminLoadingState } from "../../components/shared/AdminLoadingState";
import { Button } from "../../components/ui/button";
import { ConversationPanel } from "./ConversationPanel";
import { PriorityBadge, StatusBadge } from "./TicketBadges";
import { CATEGORIES, PRIORITIES, PRIORITY_META, STATUSES, STATUS_META, formatDateTime } from "./constants";
import { supportService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import type { SupportTicket, SupportUserRef, TicketCategory, TicketPriority, TicketStatus } from "../../types/support";

const selectCls = "flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
const idOf = (value: SupportTicket["assignedTo"]) => (typeof value === "object" && value ? value._id : (value ?? ""));

/** Render with key={ticketId}. */
export function AdminTicketPanel({ ticketId, onBack }: { ticketId: string; onBack: () => void }) {
  const dispatch = useAppDispatch();
  const me = useAppSelector((state) => state.auth.user);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [agents, setAgents] = useState<SupportUserRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let current = true;
    Promise.all([supportService.adminGet(ticketId), supportService.adminAgents()])
      .then(([t, a]) => {
        if (!current) return;
        setTicket(t);
        setAgents(a);
      })
      .catch((err: unknown) => current && setError(getApiErrorMessage(err, "Unable to load ticket.")))
      .finally(() => current && setIsLoading(false));
    return () => {
      current = false;
    };
  }, [ticketId]);

  const handleUpdate = useCallback((next: SupportTicket) => setTicket(next), []);

  const update = async (
    payload: Partial<{ status: TicketStatus; priority: TicketPriority; category: TicketCategory; assignedTo: string | null }>,
  ) => {
    setIsSaving(true);
    try {
      setTicket(await supportService.adminUpdate(ticketId, payload));
      dispatch(showSuccess("Ticket updated."));
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to update ticket.")));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <AdminLoadingState message="Loading ticket..." />;
  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <p className="mb-4 text-sm text-red-600" role="alert">{error ?? "Ticket not found."}</p>
        <Button variant="outline" onClick={onBack}>Back to tickets</Button>
      </div>
    );
  }

  const customer = typeof ticket.user === "object" ? ticket.user : null;
  const order = typeof ticket.order === "object" && ticket.order ? ticket.order : null;
  const assignedId = idOf(ticket.assignedTo);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> All tickets
      </button>

      <div>
        <p className="font-mono text-xs font-semibold text-muted-foreground">{ticket.ticketNumber}</p>
        <h1 className="text-2xl font-bold tracking-tight">{ticket.subject}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ConversationPanel
            key={ticketId}
            ticketId={ticketId}
            mode="admin"
            locked={ticket.status === "closed"}
            onTicketUpdate={handleUpdate}
          />
        </div>

        <aside className="h-fit space-y-5">
          <section className="space-y-4 rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold">Manage ticket</h2>
            <label className="block space-y-1 text-xs font-medium">
              Status
              <select className={selectCls} disabled={isSaving} value={ticket.status} onChange={(e) => update({ status: e.target.value as TicketStatus })}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
              </select>
            </label>
            <label className="block space-y-1 text-xs font-medium">
              Priority
              <select className={selectCls} disabled={isSaving} value={ticket.priority} onChange={(e) => update({ priority: e.target.value as TicketPriority })}>
                {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
              </select>
            </label>
            <label className="block space-y-1 text-xs font-medium">
              Category
              <select className={selectCls} disabled={isSaving} value={ticket.category} onChange={(e) => update({ category: e.target.value as TicketCategory })}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </label>
            <label className="block space-y-1 text-xs font-medium">
              Assigned agent
              <select className={selectCls} disabled={isSaving} value={assignedId} onChange={(e) => update({ assignedTo: e.target.value || null })}>
                <option value="">Unassigned</option>
                {agents.map((a) => <option key={a._id} value={a._id}>{a.username}{a._id === me?.id ? " (you)" : ""}</option>)}
              </select>
            </label>
            {me && assignedId !== me.id && agents.some((a) => a._id === me.id) && (
              <Button variant="outline" size="sm" disabled={isSaving} onClick={() => update({ assignedTo: me.id })} className="w-full gap-2">
                <UserPlus className="h-4 w-4" /> Assign to me
              </Button>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border bg-card p-5 text-sm">
            <h2 className="text-sm font-semibold">Customer</h2>
            <p className="font-medium">{customer?.username ?? "Customer"}</p>
            {customer?.email && (
              <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-xs text-blue-600 hover:underline">
                <Mail className="h-3.5 w-3.5" /> {customer.email}
              </a>
            )}
            <dl className="space-y-2 border-t pt-3 text-xs">
              <div><dt className="uppercase tracking-wider text-muted-foreground">Created</dt><dd className="font-medium">{formatDateTime(ticket.createdAt)}</dd></div>
              {ticket.firstResponseAt && <div><dt className="uppercase tracking-wider text-muted-foreground">First response</dt><dd className="font-medium">{formatDateTime(ticket.firstResponseAt)}</dd></div>}
              {order && (
                <div>
                  <dt className="uppercase tracking-wider text-muted-foreground">Related order</dt>
                  <dd className="font-medium">#NEX-{order._id.slice(-6).toUpperCase()} · ${order.totalAmount.toFixed(2)} · {order.orderStatus}</dd>
                </div>
              )}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
