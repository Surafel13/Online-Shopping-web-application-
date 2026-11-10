import {
  createAsyncThunk,
  createSlice,
  isAnyOf,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import { profileService } from "../../services/profileService";
import { mapUserToAuth } from "../../lib/mappers";
import { getApiErrorMessage, isAuthError } from "../../lib/errors";
import type { UserProfile } from "../../types/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "customer" | "admin" | "super_admin";
  permissions: string[];
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

/** Restoring a session already loads the full profile, so we hand it to the profile slice. */
export interface RestoredSession extends AuthSession {
  profile: UserProfile;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

type AuthThunkConfig = { rejectValue: string };

const TOKEN_KEY = "token";

const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: null,
  token: readToken(),
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const loginUser = createAsyncThunk<
  AuthSession,
  { email: string; password: string },
  AuthThunkConfig
>("auth/login", async ({ email, password }, { rejectWithValue }) => {
  try {
    const result = await authService.login({email, password});
    localStorage.setItem(TOKEN_KEY, result.token);
    return { user: mapUserToAuth(result.user), token: result.token };
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Login failed"));
  }
});

export const registerUser = createAsyncThunk<
  AuthSession,
  { fullName: string; email: string; password: string; confirmPassword: string },
  AuthThunkConfig
>(
  "auth/register",
  async ({ fullName, email, password, confirmPassword  }, { rejectWithValue }) => {
    try {
      const result = await authService.signup({ fullName, email, password, confirmPassword });
      localStorage.setItem(TOKEN_KEY, result.token);
      return { user: mapUserToAuth(result.user), token: result.token };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, "Registration failed"));
    }
  },
);

export const restoreSession = createAsyncThunk<
  RestoredSession | null,
  void,
  AuthThunkConfig
>("auth/restoreSession", async (_, { rejectWithValue }) => {
  const token = readToken();
  if (!token) return null;

  try {
    const profile = await profileService.getProfile();
    return { user: mapUserToAuth(profile), token, profile };
  } catch (error) {
    // Only drop the token when the server says it is invalid; keep it on network failures.
    if (isAuthError(error)) localStorage.removeItem(TOKEN_KEY);
    return rejectWithValue(getApiErrorMessage(error, "Session expired"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Pure reducer. Token removal and per-user state resets are handled by
    // listeners / extraReducers in other slices that react to this action.
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
    updateAuthUser(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.user) state.user = { ...state.user, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
      })
      .addCase(restoreSession.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      .addMatcher(isAnyOf(loginUser.pending, registerUser.pending), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        isAnyOf(loginUser.fulfilled, registerUser.fulfilled),
        (state, action) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        },
      )
      .addMatcher(
        isAnyOf(loginUser.rejected, registerUser.rejected),
        (state, action) => {
          state.isLoading = false;
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
          state.error =
            action.payload ?? action.error.message ?? "Authentication failed";
        },
      );
  },
});

export const { logout, clearAuthError, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;

// ---- selectors ----
type WithAuth = { auth: AuthState };
export const selectAuthUser = (state: WithAuth) => state.auth.user;
export const selectIsAuthenticated = (state: WithAuth) =>
  state.auth.isAuthenticated;
export const selectUserId = (state: WithAuth) => state.auth.user?.id ?? null;
