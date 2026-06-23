import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartService } from '../../services/cartService';
import { productService } from '../../services/productService';
import { mapApiCartToUiItems, buildProductMap } from '../../lib/mappers';
import { getApiErrorMessage } from '../../lib/errors';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  variant: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  isOpen: false,
  isLoading: false,
  error: null,
};

async function enrichCart(cart: Awaited<ReturnType<typeof cartService.getUserCart>>) {
  const products = await productService.getAll();
  const productMap = buildProductMap(products);
  const items = mapApiCartToUiItems(cart, productMap);

  return {
    items,
    totalAmount: cart?.totalAmount || 0,
    totalItems: cart?.totalItems || 0,
  };
}

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const cart = await cartService.getUserCart();
    return enrichCart(cart);
  } catch (error) {
    return rejectWithValue(getApiErrorMessage(error, 'Failed to load cart'));
  }
});

export const addToCartAsync = createAsyncThunk(
  'cart/addItem',
  async ({ productId, quantity = 1 }: { productId: string; quantity?: number }, { rejectWithValue }) => {
    try {
      const cart = await cartService.addItem(productId, quantity);
      return enrichCart(cart);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to add item'));
    }
  },
);

export const updateCartQuantityAsync = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }: { productId: string; quantity: number }, { rejectWithValue }) => {
    try {
      const cart = await cartService.updateItem(productId, quantity);
      return enrichCart(cart);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to update quantity'));
    }
  },
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      const cart = await cartService.removeItem(productId);
      return enrichCart(cart);
    } catch (error) {
      return rejectWithValue(getApiErrorMessage(error, 'Failed to remove item'));
    }
  },
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCartDrawer(state) {
      state.isOpen = !state.isOpen;
    },
    clearCartState(state) {
      state.items = [];
      state.totalAmount = 0;
      state.totalItems = 0;
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state: CartState) => {
      state.isLoading = true;
      state.error = null;
    };
    const handleRejected = (state: CartState, action: { payload?: unknown }) => {
      state.isLoading = false;
      state.error = action.payload as string;
    };
    const handleFulfilled = (
      state: CartState,
      action: { payload: { items: CartItem[]; totalAmount: number; totalItems: number } },
    ) => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.totalAmount = action.payload.totalAmount;
      state.totalItems = action.payload.totalItems;
    };

    builder
      .addCase(fetchCart.pending, handlePending)
      .addCase(fetchCart.fulfilled, handleFulfilled)
      .addCase(fetchCart.rejected, handleRejected)
      .addCase(addToCartAsync.pending, handlePending)
      .addCase(addToCartAsync.fulfilled, handleFulfilled)
      .addCase(addToCartAsync.rejected, handleRejected)
      .addCase(updateCartQuantityAsync.pending, handlePending)
      .addCase(updateCartQuantityAsync.fulfilled, handleFulfilled)
      .addCase(updateCartQuantityAsync.rejected, handleRejected)
      .addCase(removeFromCartAsync.pending, handlePending)
      .addCase(removeFromCartAsync.fulfilled, handleFulfilled)
      .addCase(removeFromCartAsync.rejected, handleRejected);
  },
});

export const { toggleCartDrawer, clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
