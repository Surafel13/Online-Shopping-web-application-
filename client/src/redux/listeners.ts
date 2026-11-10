import {
  createListenerMiddleware,
  isAnyOf,
  type Dispatch,
} from "@reduxjs/toolkit";
import {
  loginUser,
  logout,
  registerUser,
  restoreSession,
} from "./slices/authSlice";
import {
  addToCartAsync,
  cartCleared,
  cartHydrated,
  itemQuantitySet,
  itemRemoved,
  selectCartItems,
  syncCartWithCatalog,
  type CartState,
} from "./slices/cartSlice";
import {
  allNotificationsRead,
  notificationAdded,
  notificationDismissed,
  notificationRead,
  notificationsCleared,
  notificationsHydrated,
  syncOrderNotifications,
  type NotificationState,
} from "./slices/notificationSlice";
import {
  loadCart,
  loadNotifications,
  saveCart,
  saveNotifications,
  storageKey,
} from "./persistence";

// Minimal state shape: avoids a circular type dependency on the store's RootState.
type PersistedRoot = { cart: CartState; notifications: NotificationState };

export const listenerMiddleware = createListenerMiddleware();
const { startListening } = listenerMiddleware;
const read = (api: { getState: () => unknown }) =>
  api.getState() as PersistedRoot;

// 1. When a user signs in / the session is restored, load that user's persisted cart + notifications.
startListening({
  matcher: isAnyOf(
    loginUser.fulfilled,
    registerUser.fulfilled,
    restoreSession.fulfilled,
  ),
  effect: (_action, api) => {
    const { cart, notifications } = read(api);
    if (cart.ownerId && !cart.hydrated) {
      api.dispatch(
        cartHydrated({ ownerId: cart.ownerId, items: loadCart(cart.ownerId) }),
      );
    }
    if (notifications.ownerId && !notifications.hydrated) {
      api.dispatch(
        notificationsHydrated({
          ownerId: notifications.ownerId,
          ...loadNotifications(notifications.ownerId),
        }),
      );
    }
  },
});

// 2. Persist the cart whenever it changes (never before hydration, so we can't overwrite saved data).
startListening({
  matcher: isAnyOf(
    addToCartAsync.fulfilled,
    itemQuantitySet,
    itemRemoved,
    cartCleared,
    syncCartWithCatalog.fulfilled,
  ),
  effect: (_action, api) => {
    const state = read(api);
    if (!state.cart.ownerId || !state.cart.hydrated) return;
    saveCart(state.cart.ownerId, selectCartItems(state));
  },
});

// 3. Persist notifications.
startListening({
  matcher: isAnyOf(
    syncOrderNotifications.fulfilled,
    notificationAdded,
    notificationRead,
    allNotificationsRead,
    notificationDismissed,
    notificationsCleared,
  ),
  effect: (_action, api) => {
    const { notifications: n } = read(api);
    if (!n.ownerId || !n.hydrated) return;
    saveNotifications(n.ownerId, {
      items: n.ids
        .map((id) => n.entities[id])
        .filter((x): x is NonNullable<typeof x> => Boolean(x)),
      knownOrderStatuses: n.knownOrderStatuses,
      seeded: n.seeded,
    });
  },
});

// 4. Logout: drop the auth token. Per-user persisted data is intentionally kept for the next sign-in.
startListening({
  actionCreator: logout,
  effect: () => {
    try {
      localStorage.removeItem("token");
    } catch {
      // ignore
    }
  },
});

/** Keeps the cart and notifications in sync across browser tabs. */
export function registerCrossTabSync(
  dispatch: Dispatch,
  getState: () => unknown,
) {
  const onStorage = (event: StorageEvent) => {
    const { cart, notifications } = getState() as PersistedRoot;
    if (cart.ownerId && event.key === storageKey("cart", cart.ownerId)) {
      dispatch(
        cartHydrated({ ownerId: cart.ownerId, items: loadCart(cart.ownerId) }),
      );
    }
    if (
      notifications.ownerId &&
      event.key === storageKey("notifications", notifications.ownerId)
    ) {
      dispatch(
        notificationsHydrated({
          ownerId: notifications.ownerId,
          ...loadNotifications(notifications.ownerId),
        }),
      );
    }
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}
