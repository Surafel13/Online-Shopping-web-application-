import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface NotificationState {
  unreadCount: number;
}

const initialState: NotificationState = { unreadCount: 0 };

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = Math.max(0, action.payload);
    },
    clearNotificationState(state) {
      state.unreadCount = 0;
    },
  },
});

export const { setUnreadCount, clearNotificationState } =
  notificationSlice.actions;
export default notificationSlice.reducer;
