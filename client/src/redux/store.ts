import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import cartReducer from "./slices/cartSlice";
import wishlistReducer from "./slices/wishlistSlice";
import productReducer from "./slices/productSlice";
import themeReducer from "./slices/themeSlice";
import uiReducer from "./slices/uiSlice";
import notificationReducer from "./slices/notificationSlice";
import { listenerMiddleware, registerCrossTabSync } from "./listeners";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    product: productReducer,
    theme: themeReducer,
    ui: uiReducer,
    notifications: notificationReducer,
  },
  // Listener middleware must come first so it sees actions before other middleware.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

registerCrossTabSync(store.dispatch, store.getState);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
