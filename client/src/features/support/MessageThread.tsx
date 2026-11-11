import { useEffect, useRef } from "react";
import { FileText, Lock } from "lucide-react";
import { UserAvatar } from "../../components/shared/UserAvatar";
import { cn } from "../../lib/utils";
import { formatDateTime, formatFileSize } from "./constants";
import type { SupportAttachment, SupportMessage } from "../../types/support";

function Attachments({ items, mine }: { items: SupportAttachment[]; mine: boolean }) {
  if (!items.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((file) =>
        file.mimeType.startsWith("image/") ? (
          <a key={file.url} href={file.url} target="_blank" rel="noopener noreferrer" title={file.name}>
            <img src={file.url} alt={file.name} className="h-24 w-24 rounded-lg border object-cover" loading="lazy" />
          </a>
        ) : (
          <a
            key={file.url}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
              mine ? "border-white/30 bg-white/10" : "bg-background",
            )}
          >
            <FileText className="h-4 w-4" />
            <span className="max-w-[150px] truncate">{file.name}</span>
            <span className="opacity-70">{formatFileSize(file.size)}</span>
          </a>
        ),
      )}
    </div>
  );
}

/** viewer decides which side is "mine": customers see their own on the right, agents see agent messages on the right. */
export function MessageThread({ messages, viewer }: { messages: SupportMessage[]; viewer: "customer" | "admin" }) {
  const endRef = useRef<HTMLDivElement>(null);
  const lastId = messages[messages.length - 1]?._id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lastId]);

  if (!messages.length) {
    return <p className="py-10 text-center text-sm text-muted-foreground">No messages yet.</p>;
  }

  return (
    <div className="space-y-4" aria-live="polite">
      {messages.map((message) => {
        if (message.senderRole === "system") {
          return (
            <div key={message._id} className="flex justify-center">
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {message.isInternal && <Lock className="mr-1 inline h-3 w-3" />}
                {message.body} · {formatDateTime(message.createdAt)}
              </span>
            </div>
          );
        }
        const mine = viewer === "customer" ? message.senderRole === "customer" : message.senderRole === "agent";
        const name = message.sender?.username ?? (message.senderRole === "agent" ? "Support" : "Customer");
        return (
          <div key={message._id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
            <UserAvatar name={name} src={message.sender?.profileImg} className="h-8 w-8 shrink-0 text-xs" />
            <div className={cn("max-w-[80%] min-w-0", mine && "items-end text-right")}>
              <div className={cn("mb-1 flex items-center gap-2 text-xs text-muted-foreground", mine && "flex-row-reverse")}>
                <span className="font-medium text-foreground">
                  {message.senderRole === "agent" && viewer === "customer" ? `${name} (Support)` : name}
                </span>
                <span>{formatDateTime(message.createdAt)}</span>
              </div>
              <div
                className={cn(
                  "inline-block rounded-2xl px-4 py-2.5 text-left text-sm",
                  message.isInternal
                    ? "border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100"
                    : mine
                      ? "rounded-tr-sm bg-blue-600 text-white"
                      : "rounded-tl-sm bg-muted",
                )}
              >
                {message.isInternal && (
                  <div className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                    <Lock className="h-3 w-3" /> Internal note
                  </div>
                )}
                {message.body && <p className="whitespace-pre-wrap break-words">{message.body}</p>}
                <Attachments items={message.attachments} mine={mine && !message.isInternal} />
              </div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
