import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistService } from '../../services/wishlistService';
import { categoryService } from '../../services/categoryService';
import { mapWishlistToUi, buildCategoryMap } from '../../lib/mappers';
import { getApiErrorMessage } from '../../lib/errors';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
}

interface WishlistState {
  items: WishlistItem[];
  productIds: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  productIds: [],
  isLoading: false,
  error: null,
};

async function enrichWishlist(wishlist: Awaited<ReturnType<typeof wishlistService.getWishlist>>) {
  const categories = await categoryService.getAll();
  const categoryMap = buildCategoryMap(categories);
  const items = mapWishlistToUi(wishlist, categoryMap);
  return {
    items,
    productIds: items.map((item) => item.id),
  };
}

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const wishlist = await wishlistService.getWishlist();
    return enrichWishlist(wishlist);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to load wishlist'));
  }
});

export const addToWishlistAsync = createAsyncThunk(
  'wishlist/add',
  async (productId: string, { rejectWithValue }) => {
    try {
      const wishlist = await wishlistService.addItem(productId);
      return enrichWishlist(wishlist);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to add to wishlist'));
    }
  },
);

export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/remove',
  async (productId: string, { rejectWithValue }) => {
    try {
      const wishlist = await wishlistService.removeItem(productId);
      return enrichWishlist(wishlist);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to remove from wishlist'));
    }
  },
);

export const clearWishlistAsync = createAsyncThunk(
  'wishlist/clear',
  async (_, { rejectWithValue }) => {
    try {
      await wishlistService.clear();
      return { items: [], productIds: [] };
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to clear wishlist'));
    }
  },
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlistState(state) {
      state.items = [];
      state.productIds = [];
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: WishlistState) => {
      state.isLoading = true;
      state.error = null;
    };
    const handleRejected = (state: WishlistState, action: { payload?: unknown }) => {
      state.isLoading = false;
      state.error = action.payload as string;
    };
    const handleFulfilled = (
      state: WishlistState,
      action: { payload: { items: WishlistItem[]; productIds: string[] } },
    ) => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.productIds = action.payload.productIds;
    };

    builder
      .addCase(fetchWishlist.pending, handlePending)
      .addCase(fetchWishlist.fulfilled, handleFulfilled)
      .addCase(fetchWishlist.rejected, handleRejected)
      .addCase(addToWishlistAsync.pending, handlePending)
      .addCase(addToWishlistAsync.fulfilled, handleFulfilled)
      .addCase(addToWishlistAsync.rejected, handleRejected)
      .addCase(removeFromWishlistAsync.pending, handlePending)
      .addCase(removeFromWishlistAsync.fulfilled, handleFulfilled)
      .addCase(removeFromWishlistAsync.rejected, handleRejected)
      .addCase(clearWishlistAsync.pending, handlePending)
      .addCase(clearWishlistAsync.fulfilled, handleFulfilled)
      .addCase(clearWishlistAsync.rejected, handleRejected);
  },
});

export const { clearWishlistState } = wishlistSlice.actions;
export default wishlistSlice.reducer;
