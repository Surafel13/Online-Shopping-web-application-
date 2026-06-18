import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (item) => item.id === action.payload.id && item.variant === action.payload.variant
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeFromCart(state, action: PayloadAction<{ id: string; variant: string }>) {
      state.items = state.items.filter(
        (item) => !(item.id === action.payload.id && item.variant === action.payload.variant)
      );
    },
    updateQuantity(state, action: PayloadAction<{ id: string; variant: string; quantity: number }>) {
      const item = state.items.find(
        (i) => i.id === action.payload.id && i.variant === action.payload.variant
      );
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    clearCart(state) {
      state.items = [];
    },
    toggleCartDrawer(state) {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCartDrawer } = cartSlice.actions;
export default cartSlice.reducer;
