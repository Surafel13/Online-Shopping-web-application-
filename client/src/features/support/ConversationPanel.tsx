import { useCallback, useEffect, useState } from "react";
import { Lock, Send } from "lucide-react";
import { Button } from "../../components/ui/button";
import { AdminLoadingState } from "../../components/shared/AdminLoadingState";
import { AttachmentPicker } from "./AttachmentPicker";
import { MessageThread } from "./MessageThread";
import { onSupportEvent } from "./supportEvents";
import { supportService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { useAppDispatch } from "../../hooks/useRedux";
import { showError } from "../../redux/slices/uiSlice";
import { cn } from "../../lib/utils";
import type { SupportMessage, SupportTicket, TicketStatus } from "../../types/support";

interface Props {
  ticketId: string;
  mode: "customer" | "admin";
  /** customer: ticket closed -> composer hidden; admin: closed -> only internal notes. */
  locked?: boolean;
  lockedNotice?: React.ReactNode;
  onTicketUpdate?: (ticket: SupportTicket) => void;
}

interface MessageEvent {
  ticketId: string;
  message: SupportMessage;
  ticket: SupportTicket;
}

const merge = (list: SupportMessage[], next: SupportMessage) =>
  list.some((m) => m._id === next._id)
    ? list
    : [...list, next].sort((a, b) => a.createdAt.localeCompare(b.createdAt));

const selectCls = "h-9 rounded-md border border-input bg-background px-2 text-xs";

/** Render with key={ticketId} so state resets between tickets. */
export function ConversationPanel({ ticketId, mode, locked, lockedNotice, onTicketUpdate }: Props) {
  const dispatch = useAppDispatch();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [internal, setInternal] = useState(false);
  const [afterStatus, setAfterStatus] = useState<"" | TicketStatus>("");

  const fetchMessages = useCallback(
    () => (mode === "admin" ? supportService.adminMessages(ticketId) : supportService.getMessages(ticketId)),
    [mode, ticketId],
  );

  useEffect(() => {
    let current = true;
    fetchMessages()
      .then((list) => current && setMessages(list))
      .catch((error: unknown) => current && setLoadError(getApiErrorMessage(error, "Unable to load the conversation.")))
      .finally(() => current && setIsLoading(false));
    return () => {
      current = false;
    };
  }, [fetchMessages]);

  useEffect(() => {
    const offMessage = onSupportEvent<MessageEvent>("message", (event) => {
      if (event.ticketId !== ticketId) return;
      setMessages((list) => merge(list, event.message));
      onTicketUpdate?.(event.ticket);
    });
    const offTicket = onSupportEvent<{ ticketId: string; ticket: SupportTicket }>("ticket", (event) => {
      if (event.ticketId === ticketId) onTicketUpdate?.(event.ticket);
    });
    const offReconnect = onSupportEvent("reconnected", () => {
      fetchMessages().then(setMessages).catch(() => undefined);
    });
    return () => {
      offMessage();
      offTicket();
      offReconnect();
    };
  }, [ticketId, fetchMessages, onTicketUpdate]);

  const send = async () => {
    const body = text.trim();
    if (!body && files.length === 0) return;
    setSending(true);
    try {
      const message =
        mode === "admin"
          ? await supportService.adminReply(
              ticketId,
              { body, isInternal: internal || Boolean(locked), ...(afterStatus && !internal ? { status: afterStatus } : {}) },
              files,
            )
          : await supportService.reply(ticketId, body, files);
      setMessages((list) => merge(list, message));
      setText("");
      setFiles([]);
      setAfterStatus("");
    } catch (error) {
      dispatch(showError(getApiErrorMessage(error, "Unable to send your message.")));
    } finally {
      setSending(false);
    }
  };

  const asNote = mode === "admin" && (internal || Boolean(locked));

  return (
    <div className="flex flex-col rounded-2xl border bg-card">
      <div className="max-h-[560px] min-h-[260px] overflow-y-auto p-4 sm:p-6">
        {isLoading ? (
          <AdminLoadingState message="Loading conversation..." />
        ) : loadError ? (
          <p className="py-10 text-center text-sm text-red-600" role="alert">{loadError}</p>
        ) : (
          <MessageThread messages={messages} viewer={mode} />
        )}
      </div>

      {mode === "customer" && locked ? (
        <div className="border-t p-4 text-sm text-muted-foreground">{lockedNotice}</div>
      ) : (
        <form
          onSubmit={(e) => { e.preventDefault(); void send(); }}
          className={cn("space-y-3 border-t p-4", asNote && "bg-amber-50/50 dark:bg-amber-900/10")}
        >
          {mode === "admin" && (
            <div className="flex gap-2" role="tablist">
              <button
                type="button"
                disabled={locked}
                onClick={() => setInternal(false)}
                className={cn("rounded-md px-3 py-1 text-xs font-medium disabled:opacity-40", !asNote ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground")}
              >
                Reply to customer
              </button>
              <button
                type="button"
                onClick={() => setInternal(true)}
                className={cn("flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium", asNote ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground")}
              >
                <Lock className="h-3 w-3" /> Internal note
              </button>
              {locked && <span className="self-center text-xs text-muted-foreground">Ticket is closed — change its status to reply publicly.</span>}
            </div>
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); void send(); } }}
            rows={3}
            maxLength={5000}
            placeholder={asNote ? "Write an internal note (customer can't see this)..." : "Type your message... (Ctrl+Enter to send)"}
            aria-label="Message"
            className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <AttachmentPicker files={files} onChange={setFiles} disabled={sending} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            {mode === "admin" && !asNote ? (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                After sending, set status:
                <select className={selectCls} value={afterStatus} onChange={(e) => setAfterStatus(e.target.value as "" | TicketStatus)}>
                  <option value="">Keep current</option>
                  <option value="in_progress">In progress</option>
                  <option value="waiting_customer">Waiting for customer</option>
                  <option value="resolved">Resolved</option>
                </select>
              </label>
            ) : <span />}
            <Button type="submit" disabled={sending || (!text.trim() && files.length === 0)} className="gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Send className="h-4 w-4" /> {sending ? "Sending..." : asNote ? "Add note" : "Send"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
