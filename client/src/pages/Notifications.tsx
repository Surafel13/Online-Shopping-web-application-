import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  MessageSquare,
  UserCheck,
  Ticket,
  Sparkles,
} from "lucide-react";
import { PageTransition } from "../components/layout/PageTransition";
import { Button } from "../components/ui/button";
import { onSupportEvent } from "../features/support/supportEvents";
import { timeAgo } from "../features/support/constants";
import { notificationService } from "../services";
import { getApiErrorMessage } from "../lib/errors";
import { useAppDispatch } from "../hooks/useRedux";
import { setUnreadCount } from "../redux/slices/notificationSlice";
import { showError } from "../redux/slices/uiSlice";
import { cn } from "../lib/utils";
import type { AppNotification } from "../types/support";

const ICONS: Record<string, typeof Bell> = {
  support_new_ticket: Ticket,
  support_assigned: UserCheck,
  support_agent_reply: MessageSquare,
  support_customer_reply: MessageSquare,
};

const ICON_STYLES: Record<string, string> = {
  support_new_ticket:
    "bg-blue-500/10 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  support_assigned:
    "bg-purple-500/10 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  support_agent_reply:
    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  support_customer_reply:
    "bg-amber-500/10 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
};

export function Notifications() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(
    (target: number, append: boolean) =>
      notificationService
        .list(target)
        .then((result) => {
          setItems((list) =>
            append ? [...list, ...result.items] : result.items,
          );
          setPage(result.pagination.page);
          setPages(result.pagination.pages);
          dispatch(setUnreadCount(result.unreadCount));
        })
        .catch((error: unknown) => {
          dispatch(
            showError(
              getApiErrorMessage(error, "Unable to load notifications."),
            ),
          );
        })
        .finally(() => {
          setIsLoading(false);
        }),
    [dispatch],
  );

  useEffect(() => {
    void load(1, false);
    return onSupportEvent<AppNotification>("notification", (note) =>
      setItems((list) =>
        list.some((n) => n._id === note._id) ? list : [note, ...list],
      ),
    );
  }, [load]);

  const open = async (note: AppNotification) => {
    if (!note.isRead) {
      setItems((list) =>
        list.map((n) => (n._id === note._id ? { ...n, isRead: true } : n)),
      );
      notificationService
        .markRead(note._id)
        .then((count) => dispatch(setUnreadCount(count)))
        .catch(() => undefined);
    }
    if (note.link) navigate(note.link);
  };

  const markAll = async () => {
    try {
      await notificationService.markAllRead();
      setItems((list) => list.map((n) => ({ ...n, isRead: true })));
      dispatch(setUnreadCount(0));
    } catch (error) {
      dispatch(
        showError(getApiErrorMessage(error, "Unable to update notifications.")),
      );
    }
  };

  const unreadCount = items.filter((n) => !n.isRead).length;
  const hasUnread = unreadCount > 0;

  return (
    <PageTransition>
      <div className="container mx-auto max-w-screen-md px-4 py-10 sm:px-6">
        {/* Header Section */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-6">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Bell className="h-3.5 w-3.5" /> Updates & Alerts
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Notifications
              </h1>
              {hasUnread && (
                <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-xs">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Order and support updates in one place.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasUnread}
            onClick={markAll}
            className="gap-2 rounded-xl transition-all shadow-xs"
          >
            <CheckCheck className="h-4 w-4" /> Mark all as read
          </Button>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-xl bg-muted/60"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Sparkles className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">
              You're all caught up
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              No new notifications right now. Check back later!
            </p>
          </div>
        ) : (
          <>
            {/* Unified Notification Stream */}
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs">
              <ul className="divide-y divide-border/60">
                {items.map((note) => {
                  const Icon = ICONS[note.type] ?? Bell;
                  const iconStyle =
                    ICON_STYLES[note.type] ?? "bg-blue-500/10 text-blue-600";

                  return (
                    <li key={note._id}>
                      <button
                        onClick={() => void open(note)}
                        className={cn(
                          "group flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-muted/40",
                          !note.isRead &&
                            "bg-blue-500/[0.03] dark:bg-blue-500/[0.06]",
                        )}
                      >
                        {/* Type Icon */}
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
                            iconStyle,
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={cn(
                                "text-sm tracking-tight",
                                !note.isRead
                                  ? "font-semibold text-foreground"
                                  : "font-medium text-foreground/80",
                              )}
                            >
                              {note.title}
                            </p>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {timeAgo(note.createdAt)}
                            </span>
                          </div>
                          {note.body && (
                            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                              {note.body}
                            </p>
                          )}
                        </div>

                        {/* Unread Indicator */}
                        {!note.isRead && (
                          <span
                            className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600 ring-4 ring-blue-600/10"
                            aria-label="Unread notification"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Pagination Controls */}
            {page < pages && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => void load(page + 1, true)}
                  className="rounded-xl px-6 font-medium shadow-xs"
                >
                  Load more notifications
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
