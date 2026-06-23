import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  message: string | null;
  messageType: 'success' | 'error' | 'info';
}

const initialState: UiState = {
  message: null,
  messageType: 'info',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showSuccess(state, action: PayloadAction<string>) {
      state.message = action.payload;
      state.messageType = 'success';
    },
    showError(state, action: PayloadAction<string>) {
      state.message = action.payload;
      state.messageType = 'error';
    },
    showInfo(state, action: PayloadAction<string>) {
      state.message = action.payload;
      state.messageType = 'info';
    },
    clearMessage(state) {
      state.message = null;
    },
  },
});

export const { showSuccess, showError, showInfo, clearMessage } = uiSlice.actions;
export default uiSlice.reducer;
