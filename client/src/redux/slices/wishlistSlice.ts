import {
  createAsyncThunk,
  createSelector,
  createSlice,
  isAnyOf,
} from "@reduxjs/toolkit";
import { wishlistService } from "../../services/wishlistService";
import { getCategoryMap } from "../../lib/catalogCache";
import { mapWishlistToUi } from "../../lib/mappers";
import { getApiErrorMessage } from "../../lib/errors";
import { logout } from "./authSlice";
import type { ApiWishlist } from "../../types/api";

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
}

export interface WishlistState {
  items: WishlistItem[];
  /** Initial/refresh load only - mutations use `isMutating` so the page doesn't flash a loader. */
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
}
type WishlistThunkConfig = {
  state: { wishlist: WishlistState };
  rejectValue: string;
};

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  isMutating: false,
  error: null,
};

// The wishlist is server state; we only keep the UI projection of the latest server response.
async function toItems(wishlist: ApiWishlist): Promise<WishlistItem[]> {
  return mapWishlistToUi(wishlist, await getCategoryMap());
}

export const fetchWishlist = createAsyncThunk<
  WishlistItem[],
  void,
  WishlistThunkConfig
>(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await toItems(await wishlistService.getWishlist());
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to load wishlist"),
      );
    }
  },
  { condition: (_, { getState }) => !getState().wishlist.isLoading },
);

export const addToWishlistAsync = createAsyncThunk<
  WishlistItem[],
  string,
  WishlistThunkConfig
>("wishlist/add", async (productId, { rejectWithValue }) => {
  try {
    return await toItems(await wishlistService.addItem(productId));
  } catch (error) {
    return rejectWithValue(
      getApiErrorMessage(error, "Failed to add to wishlist"),
    );
  }
});

export const removeFromWishlistAsync = createAsyncThunk<
  WishlistItem[],
  string,
  WishlistThunkConfig
>("wishlist/remove", async (productId, { rejectWithValue }) => {
  try {
    return await toItems(await wishlistService.removeItem(productId));
  } catch (error) {
    return rejectWithValue(
      getApiErrorMessage(error, "Failed to remove from wishlist"),
    );
  }
});

export const clearWishlistAsync = createAsyncThunk<
  WishlistItem[],
  void,
  WishlistThunkConfig
>("wishlist/clear", async (_, { rejectWithValue }) => {
  try {
    await wishlistService.clear();
    return [];
  } catch (error) {
    return rejectWithValue(
      getApiErrorMessage(error, "Failed to clear wishlist"),
    );
  }
});

const mutationThunks = [
  addToWishlistAsync,
  removeFromWishlistAsync,
  clearWishlistAsync,
] as const;

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload ?? action.error.message ?? "Failed to load wishlist";
      })
      .addCase(logout, () => initialState)
      .addMatcher(isAnyOf(...mutationThunks.map((t) => t.pending)), (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addMatcher(
        isAnyOf(...mutationThunks.map((t) => t.fulfilled)),
        (state, action) => {
          state.isMutating = false;
          state.items = action.payload;
        },
      )
      .addMatcher(
        isAnyOf(...mutationThunks.map((t) => t.rejected)),
        (state, action) => {
          state.isMutating = false;
          state.error =
            (action.payload as string | undefined) ??
            action.error.message ??
            "Request failed";
        },
      );
  },
});

export default wishlistSlice.reducer;

// ---------------- selectors ----------------
type WithWishlist = { wishlist: WishlistState };
export const selectWishlistItems = (state: WithWishlist) =>
  state.wishlist.items;
export const selectWishlistCount = (state: WithWishlist) =>
  state.wishlist.items.length;
export const selectWishlistProductIds = createSelector(
  [selectWishlistItems],
  (items) => items.map((item) => item.id),
);
