import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import { selectUserId } from "../redux/slices/authSlice";
import { syncOrderNotifications } from "../redux/slices/notificationSlice";

/** Polls order status for the signed-in user (only while the tab is visible). Mount once, in <App />. */
export function useNotificationSync(intervalMs = 60_000) {
  const dispatch = useAppDispatch();
  const userId = useAppSelector(selectUserId);
  const hydrated = useAppSelector((state) => state.notifications.hydrated);

  useEffect(() => {
    if (!userId || !hydrated) return;

    const run = () => {
      if (document.visibilityState === "visible")
        void dispatch(syncOrderNotifications());
    };

    run();
    const timer = window.setInterval(run, intervalMs);
    document.addEventListener("visibilitychange", run);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", run);
    };
  }, [dispatch, userId, hydrated, intervalMs]);
}
