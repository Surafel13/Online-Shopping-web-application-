import {
  createAsyncThunk,
  createSelector,
  createSlice,
  isAnyOf,
} from "@reduxjs/toolkit";
import { profileService } from "../../services/profileService";
import { getApiErrorMessage } from "../../lib/errors";
import { logout, restoreSession, updateAuthUser } from "./authSlice";
import type { ApiAddress, UserProfile } from "../../types/api";

export type AddressInput = Omit<ApiAddress, "_id">;

interface ProfileState {
  data: UserProfile | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  isMutating: boolean;
  error: string | null;
}
type ProfileThunkConfig = {
  state: { profile: ProfileState };
  rejectValue: string;
};

const initialState: ProfileState = {
  data: null,
  status: "idle",
  isMutating: false,
  error: null,
};

export const fetchProfile = createAsyncThunk<
  UserProfile,
  { force?: boolean } | undefined,
  ProfileThunkConfig
>(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await profileService.getProfile();
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load profile."),
      );
    }
  },
  {
    // Skip if a request is in flight, or if we already have data and no refresh was requested.
    condition: (arg, { getState }) => {
      const { status, data } = getState().profile;
      if (status === "loading") return false;
      return !data || Boolean(arg?.force);
    },
  },
);

export const updateProfile = createAsyncThunk<
  UserProfile,
  Record<string, string>,
  ProfileThunkConfig
>("profile/update", async (payload, { dispatch, rejectWithValue }) => {
  try {
    const profile = await profileService.updateProfile(payload);
    // Keep the lightweight auth user (header, menus) in sync with the profile.
    dispatch(
      updateAuthUser({
        name: profile.username,
        email: profile.email,
        avatar: profile.profileImg,
      }),
    );
    return profile;
  } catch (error) {
    return rejectWithValue(
      getApiErrorMessage(error, "Failed to update profile."),
    );
  }
});

export const addAddress = createAsyncThunk<
  UserProfile,
  AddressInput,
  ProfileThunkConfig
>("profile/addAddress", async (address, { rejectWithValue }) => {
  try {
    return await profileService.addAddress(address);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, "Failed to add address."));
  }
});

export const updateAddress = createAsyncThunk<
  UserProfile,
  { addressId: string; address: AddressInput },
  ProfileThunkConfig
>(
  "profile/updateAddress",
  async ({ addressId, address }, { rejectWithValue }) => {
    try {
      return await profileService.updateAddress(addressId, address);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to update address."),
      );
    }
  },
);

export const deleteAddress = createAsyncThunk<
  UserProfile,
  string,
  ProfileThunkConfig
>("profile/deleteAddress", async (addressId, { rejectWithValue }) => {
  try {
    return await profileService.deleteAddress(addressId);
  } catch (error) {
    return rejectWithValue(
      getApiErrorMessage(error, "Failed to delete address."),
    );
  }
});

const mutations = [
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
] as const;

/** Mutation endpoints don't return permissionCodes - keep the ones we already have. */
const merge = (prev: UserProfile | null, next: UserProfile): UserProfile => ({
  ...next,
  permissionCodes: next.permissionCodes ?? prev?.permissionCodes,
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = merge(state.data, action.payload);
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? action.error.message ?? "Failed to load profile.";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.data = action.payload.profile;
          state.status = "succeeded";
        }
      })
      .addCase(logout, () => initialState)
      .addMatcher(isAnyOf(...mutations.map((t) => t.pending)), (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addMatcher(
        isAnyOf(...mutations.map((t) => t.fulfilled)),
        (state, action) => {
          state.isMutating = false;
          state.data = merge(state.data, action.payload as UserProfile);
        },
      )
      .addMatcher(
        isAnyOf(...mutations.map((t) => t.rejected)),
        (state, action) => {
          state.isMutating = false;
          state.error =
            (action.payload as string | undefined) ??
            action.error.message ??
            "Request failed.";
        },
      );
  },
});

export default profileSlice.reducer;

// ---------------- selectors ----------------
type WithProfile = { profile: ProfileState };
const EMPTY_ADDRESSES: ApiAddress[] = [];

export const selectProfile = (state: WithProfile) => state.profile.data;
export const selectProfileStatus = (state: WithProfile) => state.profile.status;
export const selectProfileMutating = (state: WithProfile) =>
  state.profile.isMutating;
export const selectAddresses = createSelector(
  [selectProfile],
  (profile) => profile?.addresses ?? EMPTY_ADDRESSES,
);
