import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  RotateCcw,
  XCircle,
  Clock,
  UserCheck,
  Package,
  Calendar,
} from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { AdminLoadingState } from "../../components/shared/AdminLoadingState";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Button } from "../../components/ui/button";
import { ConversationPanel } from "../../features/support/ConversationPanel";
import {
  PriorityBadge,
  StatusBadge,
} from "../../features/support/TicketBadges";
import {
  CATEGORY_LABEL,
  PROGRESS_STEPS,
  formatDateTime,
} from "../../features/support/constants";
import { supportService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { useAppDispatch } from "../../hooks/useRedux";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import { cn } from "../../lib/utils";
import type { SupportTicket } from "../../types/support";

const stepIndex = (status: SupportTicket["status"]) =>
  status === "waiting_customer"
    ? 1
    : PROGRESS_STEPS.findIndex((s) => s.key === status);

function TicketView({ id }: { id: string }) {
  const dispatch = useAppDispatch();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    let current = true;
    supportService
      .getMine(id)
      .then((data) => current && setTicket(data))
      .catch(
        (err: unknown) =>
          current && setError(getApiErrorMessage(err, "Ticket not found.")),
      )
      .finally(() => current && setIsLoading(false));
    return () => {
      current = false;
    };
  }, [id]);

  const handleUpdate = useCallback(
    (next: SupportTicket) => setTicket(next),
    [],
  );

  const run = async (action: () => Promise<SupportTicket>, success: string) => {
    setIsWorking(true);
    try {
      setTicket(await action());
      dispatch(showSuccess(success));
      setConfirmClose(false);
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Action failed.")));
    } finally {
      setIsWorking(false);
    }
  };

  if (isLoading)
    return <AdminLoadingState message="Loading ticket details..." />;
  if (error || !ticket) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="mb-4 text-sm font-medium text-red-600" role="alert">
          {error ?? "Ticket not found."}
        </p>
        <Link to="/support/tickets">
          <Button variant="outline" className="rounded-xl">
            Back to my tickets
          </Button>
        </Link>
      </div>
    );
  }

  const closed = ticket.status === "closed";
  const canReopen = closed || ticket.status === "resolved";
  const current = stepIndex(ticket.status);
  const agent =
    typeof ticket.assignedTo === "object" && ticket.assignedTo
      ? ticket.assignedTo.username
      : null;
  const order =
    typeof ticket.order === "object" && ticket.order ? ticket.order : null;

  return (
    <div className="container mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
      {/* Navigation & Header */}
      <Link
        to="/support/tickets"
        className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to my tickets
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-border/50 pb-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-muted-foreground">
              {ticket.ticketNumber}
            </span>
            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABEL[ticket.category]}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {ticket.subject}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {canReopen && (
            <Button
              variant="outline"
              disabled={isWorking}
              onClick={() =>
                run(() => supportService.reopen(id), "Ticket reopened.")
              }
              className="gap-2 rounded-xl transition-all shadow-xs hover:border-blue-500/50 hover:text-blue-600"
            >
              <RotateCcw className="h-4 w-4" /> Reopen
            </Button>
          )}
          {!closed && (
            <Button
              variant="outline"
              disabled={isWorking}
              onClick={() => setConfirmClose(true)}
              className="gap-2 rounded-xl text-red-600 transition-all shadow-xs hover:border-red-500/50 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/20"
            >
              <XCircle className="h-4 w-4" /> Close ticket
            </Button>
          )}
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="mb-10 rounded-2xl border border-border/60 bg-card p-6 shadow-xs">
        <ol className="grid grid-cols-4 gap-2" aria-label="Ticket progress">
          {PROGRESS_STEPS.map((step, i) => {
            const isCompleted = i < current;
            const isCurrent = i === current;
            const isFinished = i <= current;

            return (
              <li key={step.key} className="relative text-center">
                <div
                  className={cn(
                    "mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all",
                    isFinished
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[2.5]" />
                  ) : (
                    i + 1
                  )}
                </div>
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    isFinished ? "bg-blue-600" : "bg-muted/70",
                  )}
                />
                <p
                  className={cn(
                    "mt-2 text-xs font-semibold tracking-tight",
                    isCurrent
                      ? "text-blue-600 dark:text-blue-400"
                      : isFinished
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Layout Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Conversation Stream */}
        <div className="lg:col-span-2">
          <ConversationPanel
            key={id}
            ticketId={id}
            mode="customer"
            locked={closed}
            lockedNotice="This ticket is closed. Reopen it to continue the conversation."
            onTicketUpdate={handleUpdate}
          />
        </div>

        {/* Clean Sidebar Information Card */}
        <aside className="h-fit rounded-2xl border border-border/70 bg-card p-6 shadow-xs">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-foreground uppercase">
            Ticket Metadata
          </h2>
          <dl className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Created
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatDateTime(ticket.createdAt)}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Last update
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {formatDateTime(ticket.lastMessageAt)}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Assigned agent
                </dt>
                <dd className="text-sm font-medium text-foreground">
                  {agent ?? "Awaiting assignment"}
                </dd>
              </div>
            </div>

            {order && (
              <div className="flex items-start gap-3 pt-2 border-t border-border/40">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Related order
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    #NEX-{order._id.slice(-6).toUpperCase()} · $
                    {order.totalAmount.toFixed(2)}
                  </dd>
                </div>
              </div>
            )}
          </dl>
        </aside>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmClose}
        onOpenChange={setConfirmClose}
        title="Close this ticket?"
        description="You can reopen it within 30 days if you still need help."
        confirmLabel="Close ticket"
        tone="danger"
        isLoading={isWorking}
        onConfirm={() => run(() => supportService.close(id), "Ticket closed.")}
      />
    </div>
  );
}

export function TicketDetail() {
  const { id } = useParams();
  return (
    <PageTransition>
      {id ? <TicketView key={id} id={id} /> : null}
    </PageTransition>
  );
}
