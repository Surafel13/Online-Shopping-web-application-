import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  isAnyOf,
  type EntityState,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { productService } from "../../services/productService";
import { getApiErrorMessage } from "../../lib/errors";
import { PLACEHOLDER_IMAGE } from "../../lib/mappers";
import { loginUser, logout, registerUser, restoreSession } from "./authSlice";
import type { ApiProduct } from "../../types/api";

export const MAX_QUANTITY_PER_ITEM = 99;
export const CART_TAX_RATE = 0.08;

/**
 * The cart is 100% client-side. `id` (the product id) and `quantity` are the source of truth;
 * the other fields are a display snapshot that `syncCartWithCatalog` refreshes against the catalog.
 */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

interface CartMeta {
  /** Which user this cart belongs to (carts are persisted per user). */
  ownerId: string | null;
  /** True once the persisted cart for `ownerId` has been loaded. */
  hydrated: boolean;
  syncStatus: "idle" | "loading" | "failed";
  /** Human-readable price/stock changes found by the last catalog sync. */
  syncNotices: string[];
}

export type CartState = EntityState<CartItem, string> & CartMeta;
type CartThunkConfig = { state: { cart: CartState }; rejectValue: string };

const cartAdapter = createEntityAdapter<CartItem>();

const initialState: CartState = cartAdapter.getInitialState<CartMeta>({
  ownerId: null,
  hydrated: false,
  syncStatus: "idle",
  syncNotices: [],
});

// ---------------- selectors ----------------
const adapterSelectors = cartAdapter.getSelectors(
  (state: { cart: CartState }) => state.cart,
);

export const selectCartItems = adapterSelectors.selectAll;
export const selectCartItemById = adapterSelectors.selectById;

export const selectCartItemCount = createSelector([selectCartItems], (items) =>
  items.reduce((count, item) => count + item.quantity, 0),
);

/** Money is summed in integer cents to avoid floating point drift. */
export const selectCartTotals = createSelector([selectCartItems], (items) => {
  const subtotalCents = items.reduce(
    (sum, item) => sum + Math.round(item.price * 100) * item.quantity,
    0,
  );
  const taxCents = Math.round(subtotalCents * CART_TAX_RATE);
  return {
    itemCount: items.reduce((count, item) => count + item.quantity, 0),
    subtotal: subtotalCents / 100,
    tax: taxCents / 100,
    total: (subtotalCents + taxCents) / 100,
  };
});

export const selectCartSubtotal = (state: { cart: CartState }) =>
  selectCartTotals(state).subtotal;

export const getMaxQuantity = (item: Pick<CartItem, "stock">) =>
  Math.max(0, Math.min(item.stock, MAX_QUANTITY_PER_ITEM));

// ---------------- helpers ----------------
const money = (value: number) => `$${value.toFixed(2)}`;

function toCartItem(product: ApiProduct, quantity: number): CartItem {
  return {
    id: product._id,
    name: product.name,
    price: product.price,
    image: product.images?.[0] || PLACEHOLDER_IMAGE,
    stock: Math.max(0, Math.floor(product.stock)),
    quantity,
  };
}

export const addToCartAsync = createAsyncThunk<
  { item: CartItem; added: number; requested: number },
  { productId: string; quantity?: number; product?: ApiProduct },
  CartThunkConfig
>(
  "cart/addItem",
  async (
    { productId, quantity = 1, product },
    { getState, rejectWithValue },
  ) => {
    const { cart } = getState();
    if (!cart.ownerId)
      return rejectWithValue("Please sign in to add items to your cart.");
    if (!cart.hydrated)
      return rejectWithValue("Your cart is still loading. Please try again.");
    if (!Number.isInteger(quantity) || quantity < 1)
      return rejectWithValue("Invalid quantity.");

    try {
      const source = product ?? (await productService.getById(productId));
      if (source.isActive === false || source.stock <= 0) {
        return rejectWithValue(`${source.name} is out of stock.`);
      }

      const inCart = cart.entities[productId]?.quantity ?? 0;
      const room =
        Math.min(Math.floor(source.stock), MAX_QUANTITY_PER_ITEM) - inCart;
      if (room <= 0) {
        return rejectWithValue(
          `You already have the maximum available quantity of ${source.name}.`,
        );
      }

      const added = Math.min(quantity, room);
      return {
        item: toCartItem(source, inCart + added),
        added,
        requested: quantity,
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to add item to cart."),
      );
    }
  },
);

interface CatalogUpdate {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

/** Re-validates cart lines against the live catalog (one request) and reports what changed. */
export const syncCartWithCatalog = createAsyncThunk<
  { updates: CatalogUpdate[]; removedIds: string[]; notices: string[] },
  void,
  CartThunkConfig
>(
  "cart/syncWithCatalog",
  async (_, { getState, rejectWithValue }) => {
    try {
      const items = selectCartItems(getState());
      const products = await productService.getAll();
      const catalog = new Map(
        products.map((p): [string, ApiProduct] => [p._id, p]),
      );

      const updates: CatalogUpdate[] = [];
      const removedIds: string[] = [];
      const notices: string[] = [];

      for (const item of items) {
        const product = catalog.get(item.id);
        if (!product || product.isActive === false || product.stock <= 0) {
          removedIds.push(item.id);
          notices.push(
            `${item.name} is no longer available and was removed from your cart.`,
          );
          continue;
        }

        const stock = Math.floor(product.stock);
        if (item.quantity > Math.min(stock, MAX_QUANTITY_PER_ITEM)) {
          notices.push(
            `Only ${stock} of ${product.name} left - your quantity was reduced.`,
          );
        }
        if (product.price !== item.price) {
          notices.push(
            `The price of ${product.name} changed from ${money(item.price)} to ${money(product.price)}.`,
          );
        }
        updates.push({
          id: item.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || PLACEHOLDER_IMAGE,
          stock,
        });
      }
      return { updates, removedIds, notices };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to refresh your cart."),
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { cart } = getState();
      return cart.ids.length > 0 && cart.syncStatus !== "loading";
    },
  },
);

// ---------------- slice ----------------
/** Switch the cart to a different owner; the previous owner's in-memory items are dropped. */
function bindOwner(state: CartState, ownerId: string | null) {
  if (state.ownerId === ownerId) return;
  cartAdapter.removeAll(state);
  state.ownerId = ownerId;
  state.hydrated = false;
  state.syncStatus = "idle";
  state.syncNotices = [];
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    /** Loads persisted items (also used for cross-tab sync). Ignored if the owner changed. */
    cartHydrated(
      state,
      action: PayloadAction<{ ownerId: string; items: CartItem[] }>,
    ) {
      if (state.ownerId !== action.payload.ownerId) return;
      cartAdapter.setAll(state, action.payload.items);
      state.hydrated = true;
    },
    itemQuantitySet(
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) {
      const item = state.entities[action.payload.id];
      if (!item) return;
      const next = Math.min(
        Math.floor(action.payload.quantity),
        getMaxQuantity(item),
      );
      if (!Number.isFinite(next) || next < 1)
        cartAdapter.removeOne(state, item.id);
      else item.quantity = next;
    },
    itemRemoved(state, action: PayloadAction<string>) {
      cartAdapter.removeOne(state, action.payload);
    },
    cartCleared(state) {
      cartAdapter.removeAll(state);
      state.syncNotices = [];
    },
    syncNoticesCleared(state) {
      state.syncNotices = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        cartAdapter.upsertOne(state, action.payload.item);
      })
      .addCase(syncCartWithCatalog.pending, (state) => {
        state.syncStatus = "loading";
      })
      .addCase(syncCartWithCatalog.fulfilled, (state, { payload }) => {
        state.syncStatus = "idle";
        cartAdapter.removeMany(state, payload.removedIds);
        for (const update of payload.updates) {
          // Apply to the *current* line so edits made while the request was in flight survive.
          const existing = state.entities[update.id];
          if (!existing) continue;
          existing.name = update.name;
          existing.price = update.price;
          existing.image = update.image;
          existing.stock = update.stock;
          existing.quantity = Math.min(
            existing.quantity,
            getMaxQuantity(update),
          );
        }
        state.syncNotices = payload.notices;
      })
      .addCase(syncCartWithCatalog.rejected, (state) => {
        state.syncStatus = "failed";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        bindOwner(state, action.payload?.user.id ?? null);
      })
      .addCase(logout, () => initialState)
      .addMatcher(
        isAnyOf(loginUser.fulfilled, registerUser.fulfilled),
        (state, action) => {
          bindOwner(state, action.payload.user.id);
        },
      );
  },
});

export const {
  cartHydrated,
  itemQuantitySet,
  itemRemoved,
  cartCleared,
  syncNoticesCleared,
} = cartSlice.actions;
export default cartSlice.reducer;
