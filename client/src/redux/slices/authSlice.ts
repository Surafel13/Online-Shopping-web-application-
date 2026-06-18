import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.isLoading = true;
    },
    loginSuccess(state, action: PayloadAction<AuthState['user']>) {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    loginFailure(state) {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;
export default authSlice.reducer;
