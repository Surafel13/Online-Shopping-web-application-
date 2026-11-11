import { useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAppDispatch, useAppSelector } from "../../hooks/useRedux";
import { notificationService } from "../../services";
import { setUnreadCount } from "../../redux/slices/notificationSlice";
import { showInfo } from "../../redux/slices/uiSlice";
import { emitSupportEvent } from "./supportEvents";

/** Mounted once while signed in: keeps one SSE connection open and fans events out. */
export function SupportRealtime() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    let stopped = false;

    const refreshUnread = () => {
      notificationService.unreadCount().then((count) => dispatch(setUnreadCount(count))).catch(() => undefined);
    };

    const handleFrame = (frame: string) => {
      let event = "message";
      const data: string[] = [];
      frame.split("\n").forEach((line) => {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data.push(line.slice(5).trim());
      });
      if (!data.length) return;
      let payload: unknown;
      try {
        payload = JSON.parse(data.join("\n"));
      } catch {
        return;
      }
      if (event === "notification") {
        refreshUnread();
        const note = payload as { title?: string; link?: string };
        const here = window.location.pathname + window.location.search;
        if (note.title && note.link !== here) dispatch(showInfo(note.title));
      }
      emitSupportEvent(event, payload);
    };

    const run = async () => {
      let delay = 1000;
      let first = true;
      while (!stopped) {
        try {
          const response = await fetch(`${API_BASE_URL}/support/stream`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "text/event-stream" },
            signal: controller.signal,
          });
          if (response.status === 401 || response.status === 403) return;
          if (!response.ok || !response.body) throw new Error("stream failed");
          delay = 1000;
          refreshUnread();
          if (!first) emitSupportEvent("reconnected", null);
          first = false;

          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");
            let index = buffer.indexOf("\n\n");
            while (index !== -1) {
              handleFrame(buffer.slice(0, index));
              buffer = buffer.slice(index + 2);
              index = buffer.indexOf("\n\n");
            }
          }
        } catch {
          if (stopped) return;
        }
        if (stopped) return;
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 30000);
      }
    };

    void run();
    return () => {
      stopped = true;
      controller.abort();
    };
  }, [token, dispatch]);

  return null;
}
