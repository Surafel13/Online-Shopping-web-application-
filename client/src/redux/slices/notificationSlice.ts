import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  isAnyOf,
  type EntityState,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { orderService } from "../../services/orderService";
import { getApiErrorMessage } from "../../lib/errors";
import { loginUser, logout, registerUser, restoreSession } from "./authSlice";
import type { ApiOrder, OrderStatus } from "../../types/api";

export const MAX_NOTIFICATIONS = 50;

export interface AppNotification {
  id: string;
  type: "order" | "system";
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

interface NotificationMeta {
  ownerId: string | null;
  hydrated: boolean;
  serverUnreadCount: number;
  /** False until the first order sync, so existing orders don't spam the user on first login. */
  seeded: boolean;
  knownOrderStatuses: Record<string, OrderStatus>;
  syncStatus: "idle" | "loading" | "failed";
  error: string | null;
}

export type NotificationState = EntityState<AppNotification, string> &
  NotificationMeta;
type NotificationThunkConfig = {
  state: { notifications: NotificationState };
  rejectValue: string;
};

// Newest first.
const adapter = createEntityAdapter<AppNotification>({
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

const initialState: NotificationState =
  adapter.getInitialState<NotificationMeta>({
    ownerId: null,
    hydrated: false,
    serverUnreadCount: 0,
    seeded: false,
    knownOrderStatuses: {},
    syncStatus: "idle",
    error: null,
  });

// ---------------- selectors ----------------
const selectors = adapter.getSelectors(
  (state: { notifications: NotificationState }) => state.notifications,
);
export const selectNotifications = selectors.selectAll;
export const selectUnreadCount = createSelector(
  [selectNotifications, (state: { notifications: NotificationState }) => state.notifications.serverUnreadCount],
  (items, serverUnreadCount) => items.filter((n) => !n.read).length + serverUnreadCount,
);

// ---------------- thunk ----------------
const ORDER_COPY: Record<OrderStatus, { title: string; body: string }> = {
  pending: {
    title: "Order placed",
    body: "has been placed and is awaiting processing.",
  },
  processing: {
    title: "Order is being processed",
    body: "is now being processed.",
  },
  shipped: { title: "Order shipped", body: "is on its way." },
  delivered: { title: "Order delivered", body: "has been delivered." },
  cancelled: { title: "Order cancelled", body: "has been cancelled." },
};

const orderRef = (order: ApiOrder) =>
  `#NEX-${order._id.slice(-6).toUpperCase()}`;

function buildOrderNotification(order: ApiOrder): AppNotification {
  const copy = ORDER_COPY[order.orderStatus];
  return {
    id: `order:${order._id}:${order.orderStatus}`,
    type: "order",
    title: copy.title,
    message: `Your order ${orderRef(order)} ${copy.body}`,
    createdAt: new Date().toISOString(),
    read: false,
    link: "/orders",
  };
}

/** Derives notifications from order status changes (no server notification API exists). */
export const syncOrderNotifications = createAsyncThunk<
  { added: AppNotification[]; statuses: Record<string, OrderStatus> },
  void,
  NotificationThunkConfig
>(
  "notifications/syncOrders",
  async (_, { getState, rejectWithValue }) => {
    try {
      const orders = await orderService.getMyOrders();
      const { knownOrderStatuses, seeded } = getState().notifications;

      const added: AppNotification[] = [];
      const statuses: Record<string, OrderStatus> = {};
      for (const order of orders) {
        statuses[order._id] = order.orderStatus;
        if (seeded && knownOrderStatuses[order._id] !== order.orderStatus) {
          added.push(buildOrderNotification(order));
        }
      }
      return { added, statuses };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to refresh notifications."),
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { hydrated, syncStatus } = getState().notifications;
      return hydrated && syncStatus !== "loading";
    },
  },
);

// ---------------- slice ----------------
function bindOwner(state: NotificationState, ownerId: string | null) {
  if (state.ownerId === ownerId) return;
  adapter.removeAll(state);
  state.ownerId = ownerId;
  state.hydrated = false;
  state.serverUnreadCount = 0;
  state.seeded = false;
  state.knownOrderStatuses = {};
  state.syncStatus = "idle";
  state.error = null;
}

function trim(state: NotificationState) {
  if (state.ids.length > MAX_NOTIFICATIONS) {
    adapter.removeMany(state, state.ids.slice(MAX_NOTIFICATIONS));
  }
}

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    notificationsHydrated(
      state,
      action: PayloadAction<{
        ownerId: string;
        items: AppNotification[];
        knownOrderStatuses: Record<string, OrderStatus>;
        seeded: boolean;
      }>,
    ) {
      if (state.ownerId !== action.payload.ownerId) return;
      adapter.setAll(state, action.payload.items);
      state.knownOrderStatuses = action.payload.knownOrderStatuses;
      state.seeded = action.payload.seeded;
      state.hydrated = true;
    },
    notificationAdded(state, action: PayloadAction<AppNotification>) {
      adapter.addOne(state, action.payload);
      trim(state);
    },
    notificationRead(state, action: PayloadAction<string>) {
      adapter.updateOne(state, { id: action.payload, changes: { read: true } });
    },
    allNotificationsRead(state) {
      for (const id of state.ids) {
        const item = state.entities[id];
        if (item) item.read = true;
      }
    },
    notificationDismissed(state, action: PayloadAction<string>) {
      adapter.removeOne(state, action.payload);
    },
    notificationsCleared(state) {
      adapter.removeAll(state);
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.serverUnreadCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncOrderNotifications.pending, (state) => {
        state.syncStatus = "loading";
        state.error = null;
      })
      .addCase(syncOrderNotifications.fulfilled, (state, action) => {
        state.syncStatus = "idle";
        adapter.addMany(state, action.payload.added);
        state.knownOrderStatuses = action.payload.statuses;
        state.seeded = true;
        trim(state);
      })
      .addCase(syncOrderNotifications.rejected, (state, action) => {
        state.syncStatus = "failed";
        state.error =
          action.payload ??
          action.error.message ??
          "Failed to refresh notifications.";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        bindOwner(state, action.payload?.user.id ?? null);
      })
      .addCase(logout, () => initialState)
      .addMatcher(
        isAnyOf(loginUser.fulfilled, registerUser.fulfilled),
        (state, action) => {
          bindOwner(state, action.payload.user.id);
        },
      );
  },
});

export const {
  notificationsHydrated,
  notificationAdded,
  notificationRead,
  allNotificationsRead,
  notificationDismissed,
  notificationsCleared,
  setUnreadCount,
} = notificationSlice.actions;
export default notificationSlice.reducer;
