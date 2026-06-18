import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  colors?: string[];
  isOutOfStock?: boolean;
}

interface ProductFilters {
  category: string[];
  priceRange: { min: number; max: number };
  colors: string[];
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  searchQuery: string;
}

interface ProductState {
  products: Product[];
  currentProduct: Product | null;
  filters: ProductFilters;
  isLoading: boolean;
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  filters: {
    category: [],
    priceRange: { min: 0, max: 1000 },
    colors: [],
    sortBy: 'featured',
    searchQuery: '',
  },
  isLoading: false,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload;
    },
    setCurrentProduct(state, action: PayloadAction<Product | null>) {
      state.currentProduct = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setCategoryFilter(state, action: PayloadAction<string[]>) {
      state.filters.category = action.payload;
    },
    setPriceRange(state, action: PayloadAction<{ min: number; max: number }>) {
      state.filters.priceRange = action.payload;
    },
    setColorFilter(state, action: PayloadAction<string[]>) {
      state.filters.colors = action.payload;
    },
    setSortBy(state, action: PayloadAction<ProductFilters['sortBy']>) {
      state.filters.sortBy = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.filters.searchQuery = action.payload;
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setProducts,
  setCurrentProduct,
  setLoading,
  setCategoryFilter,
  setPriceRange,
  setColorFilter,
  setSortBy,
  setSearchQuery,
  resetFilters,
} = productSlice.actions;
export default productSlice.reducer;
