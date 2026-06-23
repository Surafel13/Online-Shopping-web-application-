import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import {
  Search, SlidersHorizontal, LayoutGrid, List,
  Star, ChevronRight, Heart, ShoppingCart, X, SlidersVertical
} from 'lucide-react';
import { productService, categoryService } from '../services';
import { buildCategoryMap, mapApiProductToProductType } from '../lib/mappers';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isOnSale?: boolean;
  inStock: boolean;
}

type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest',    label: 'Newest Arrivals' },
  { value: 'popular',  label: 'Most Popular'    },
  { value: 'price_asc',label: 'Price: Low → High'},
  { value: 'price_desc',label: 'Price: High → Low'},
  { value: 'rating',   label: 'Top Rated'       },
];

// ─── Star Rating ───────────────────────────────────────────────────────────────
const StarRow = ({ rating, size = 3 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        className={`h-${size} w-${size} ${i <= Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-200'}`}
      />
    ))}
  </div>
);

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="border rounded-xl bg-card overflow-hidden animate-pulse">
    <div className="bg-slate-100 dark:bg-slate-800 h-56 w-full" />
    <div className="p-4 space-y-2">
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
    </div>
  </div>
);

// ─── Product Card (Grid) ──────────────────────────────────────────────────────
const ProductCardGrid = ({ product }: { product: Product }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.25 }}
      className="group border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-50 dark:bg-slate-800/50 h-56">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-blue-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">New</span>
          )}
          {product.isOnSale && discount && (
            <span className="bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">-{discount}%</span>
          )}
          {!product.inStock && (
            <span className="bg-slate-700 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wider">Sold Out</span>
          )}
        </div>
        {/* Wishlist */}
        <button
          onClick={() => setWishlisted(w => !w)}
          className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        >
          <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'text-red-500 fill-red-500' : 'text-slate-500 dark:text-slate-300'}`} />
        </button>
        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Link to={`/product/${product.id}`}>
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 flex items-center justify-center gap-2 transition-colors">
              <ShoppingCart className="h-4 w-4" /> Quick Add
            </button>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm leading-snug mb-2 hover:text-blue-600 transition-colors line-clamp-2">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <StarRow rating={product.rating} />
          <span className="text-[11px] text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">${product.price}</span>
          {product.originalPrice && (
            <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Product Card (List) ──────────────────────────────────────────────────────
const ProductCardList = ({ product }: { product: Product }) => {
  const [wishlisted, setWishlisted] = useState(false);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.22 }}
      className="group border rounded-xl bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex"
    >
      <div className="relative w-44 shrink-0 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isNew && <span className="bg-blue-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">New</span>}
          {product.isOnSale && discount && <span className="bg-red-500 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full">-{discount}%</span>}
        </div>
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{product.category}</p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-base leading-snug mb-2 hover:text-blue-600 transition-colors">{product.name}</h3>
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <StarRow rating={product.rating} size={4} />
            <span className="text-xs text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
          </div>
          {!product.inStock && <span className="text-xs text-red-500 font-medium">Out of stock</span>}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">${product.price}</span>
            {product.originalPrice && <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWishlisted(w => !w)} className="h-9 w-9 rounded-full border border-border flex items-center justify-center hover:border-red-300 dark:hover:border-red-500/50 transition-colors">
              <Heart className={`h-4 w-4 ${wishlisted ? 'text-red-500 fill-red-500' : 'text-slate-400 dark:text-slate-500'}`} />
            </button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={!product.inStock}>
              <ShoppingCart className="h-4 w-4 mr-1.5" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Sidebar Filter Section ────────────────────────────────────────────────────
const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">{title}</h4>
    {children}
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function Collections() {
  const [searchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>(['All Products']);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [search, setSearch]               = useState('');
  const [category, setCategory]           = useState(searchParams.get('category') || 'All Products');
  const [sort, setSort]                   = useState<SortKey>('newest');
  const [viewMode, setViewMode]           = useState<ViewMode>('grid');
  const [priceRange, setPriceRange]       = useState<[number, number]>([0, 2000]);
  const [inStockOnly, setInStockOnly]     = useState(false);
  const [onSaleOnly, setOnSaleOnly]       = useState(false);
  const [newOnly, setNewOnly]             = useState(false);
  const [minRating, setMinRating]         = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isFiltering, setIsFiltering]     = useState(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const [products, categories] = await Promise.all([
          productService.getAll(),
          categoryService.getAll(),
        ]);
        const categoryMap = buildCategoryMap(categories);
        setCategoryOptions(['All Products', ...categories.map((entry) => entry.name)]);
        setAllProducts(
          products.map((product) => {
            const mapped = mapApiProductToProductType(product, categoryMap);
            return {
              id: mapped.id,
              name: mapped.name,
              price: mapped.price,
              originalPrice: mapped.originalPrice,
              image: mapped.image,
              category: mapped.category,
              rating: mapped.rating,
              reviews: mapped.reviews,
              isNew: mapped.isNew,
              isOnSale: Boolean(mapped.originalPrice),
              inStock: !mapped.isOutOfStock,
            };
          }),
        );
      } finally {
        setIsPageLoading(false);
      }
    }

    loadProducts();
  }, []);

  const triggerFilter = useCallback((fn: () => void) => {
    setIsFiltering(true);
    fn();
    setTimeout(() => setIsFiltering(false), 300);
  }, []);

  const clearAll = () => {
    setSearch(''); setCategory('All Products'); setPriceRange([0, 2000]);
    setInStockOnly(false); setOnSaleOnly(false); setNewOnly(false); setMinRating(0);
  };

  const filtered = useMemo(() => {
    let result = allProducts
      .filter(p => category === 'All Products' || p.category === category)
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
      .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
      .filter(p => !inStockOnly || p.inStock)
      .filter(p => !onSaleOnly || p.isOnSale)
      .filter(p => !newOnly || p.isNew)
      .filter(p => p.rating >= minRating);

    switch (sort) {
      case 'price_asc':  result = [...result].sort((a, b) => a.price - b.price); break;
      case 'price_desc': result = [...result].sort((a, b) => b.price - a.price); break;
      case 'rating':     result = [...result].sort((a, b) => b.rating - a.rating); break;
      case 'popular':    result = [...result].sort((a, b) => b.reviews - a.reviews); break;
      default: break;
    }
    return result;
  }, [allProducts, search, category, sort, priceRange, inStockOnly, onSaleOnly, newOnly, minRating]);

  const activeFiltersCount = [
    category !== 'All Products', inStockOnly, onSaleOnly, newOnly,
    minRating > 0, priceRange[0] > 0 || priceRange[1] < 2000
  ].filter(Boolean).length;

  // ── Sidebar content (reused for mobile drawer) ─────────────────────────────
  const SidebarContent = () => (
    <div className="space-y-6">
      <FilterSection title="Categories">
        <ul className="space-y-2">
          {categoryOptions.map(cat => (
            <li key={cat}>
              <label className="flex items-center gap-3 cursor-pointer group">
                <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${category === cat ? 'border-blue-600' : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500'}`}>
                  {category === cat && <span className="h-2 w-2 rounded-full bg-blue-600 block" />}
                </span>
                <input type="radio" className="sr-only" checked={category === cat} onChange={() => triggerFilter(() => setCategory(cat))} />
                <span className={`text-sm transition-colors ${category === cat ? 'text-blue-600 font-semibold' : 'text-muted-foreground group-hover:text-foreground'}`}>{cat}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      <div className="h-px bg-border" />

      <FilterSection title="Price Range">
        <div className="space-y-3">
          <input
            type="range" min={0} max={2000} step={10}
            value={priceRange[1]}
            onChange={e => triggerFilter(() => setPriceRange([priceRange[0], +e.target.value]))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1] >= 2000 ? '2,000+' : priceRange[1]}</span>
          </div>
        </div>
      </FilterSection>

      <div className="h-px bg-border" />

      <FilterSection title="Availability">
        {[
          { label: 'In Stock',     val: inStockOnly, set: setInStockOnly },
          { label: 'On Sale',      val: onSaleOnly,  set: setOnSaleOnly  },
          { label: 'New Arrivals', val: newOnly,      set: setNewOnly     },
        ].map(({ label, val, set }) => (
          <label key={label} className="flex items-center gap-3 cursor-pointer group mb-2">
            <span className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${val ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400 dark:group-hover:border-slate-500'}`}>
              {val && <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
            </span>
            <input type="checkbox" className="sr-only" checked={val} onChange={e => triggerFilter(() => set(e.target.checked))} />
            <span className={`text-sm ${val ? 'text-blue-600 font-semibold' : 'text-muted-foreground group-hover:text-foreground'}`}>{label}</span>
          </label>
        ))}
      </FilterSection>

      <div className="h-px bg-border" />

      <FilterSection title="Rating">
        {[4, 3, 2].map(r => (
          <button
            key={r}
            onClick={() => triggerFilter(() => setMinRating(minRating === r ? 0 : r))}
            className={`flex items-center gap-2 mb-2 group w-full ${minRating === r ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
          >
            <StarRow rating={r} size={4} />
            <span className={`text-sm ${minRating === r ? 'text-blue-600 font-semibold' : 'text-muted-foreground'}`}>& Up</span>
          </button>
        ))}
      </FilterSection>

      {activeFiltersCount > 0 && (
        <>
          <div className="h-px bg-border" />
          <button onClick={clearAll} className="w-full text-sm text-red-500 hover:text-red-600 font-medium flex items-center justify-center gap-2 py-1 transition-colors">
            <X className="h-4 w-4" /> Clear All Filters
          </button>
        </>
      )}
    </div>
  );

  return (
    <PageTransition>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-background border-b">
        <div className="container max-w-screen-xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Shop All</span>
          </div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-4xl font-bold tracking-tight mb-2">Shop All</h1>
            <p className="text-muted-foreground max-w-lg">
              Browse all available products and find what you need. From premium tech to sustainable fashion, discover our curated collection.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── SIDEBAR (desktop) ──────────────────────────────────────────── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <SlidersVertical className="h-4 w-4" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Filters</h3>
                </div>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeFiltersCount}</span>
                )}
              </div>
              <SidebarContent />
            </div>
          </aside>

          {/* ── MOBILE FILTER DRAWER ──────────────────────────────────────── */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileFiltersOpen(false)} />
                <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }}
                  className="fixed inset-y-0 left-0 w-72 bg-card z-50 overflow-y-auto p-6 shadow-xl lg:hidden">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Filters</h3>
                    <button onClick={() => setMobileFiltersOpen(false)} className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <SidebarContent />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* ── MAIN CONTENT ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search products..."
                  value={search}
                  onChange={e => { setSearch(e.target.value); }}
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>

              {/* Mobile filter trigger */}
              <Button variant="outline" className="lg:hidden flex items-center gap-2 h-10" onClick={() => setMobileFiltersOpen(true)}>
                <SlidersHorizontal className="h-4 w-4" />
                Filters {activeFiltersCount > 0 && <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>}
              </Button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <select
                  value={sort}
                  onChange={e => triggerFilter(() => setSort(e.target.value as SortKey))}
                  className="h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                {/* View toggle */}
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button onClick={() => setViewMode('grid')} className={`h-10 w-10 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`h-10 w-10 flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-background text-muted-foreground hover:bg-muted'}`}>
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Result count + active filters */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filtered.length}</span> {filtered.length === 1 ? 'product' : 'products'}
                {category !== 'All Products' && <> in <span className="font-semibold text-foreground">{category}</span></>}
              </p>
              {search && (
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  "{search}" <button onClick={() => setSearch('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {minRating > 0 && (
                <span className="bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  {minRating}★ & up <button onClick={() => setMinRating(0)}><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>

            {/* Grid / List */}
            <AnimatePresence mode="wait">
              {isPageLoading || isFiltering ? (
                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5' : 'flex flex-col gap-4'}>
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </motion.div>
              ) : filtered.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 text-muted-foreground">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p className="font-semibold text-lg">No products found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                  <Button onClick={clearAll} variant="outline" className="mt-6">Clear All Filters</Button>
                </motion.div>
              ) : viewMode === 'grid' ? (
                <motion.div key="grid" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.map((product, i) => (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <ProductCardGrid product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="list" className="flex flex-col gap-4">
                  {filtered.map((product, i) => (
                    <motion.div key={product.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <ProductCardList product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination (mock) */}
            {filtered.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-12 flex flex-col items-center gap-4">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8 text-sm">&lsaquo;</Button>
                  {[1, 2, 3].map(n => (
                    <Button key={n} variant={n === 1 ? 'default' : 'outline'} size="icon" className={`h-8 w-8 text-sm ${n === 1 ? 'bg-blue-600 hover:bg-blue-700 border-blue-600' : ''}`}>{n}</Button>
                  ))}
                  <span className="text-muted-foreground px-1">…</span>
                  <Button variant="outline" size="icon" className="h-8 w-8 text-sm">12</Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 text-sm">&rsaquo;</Button>
                </div>
                <p className="text-xs text-muted-foreground">Showing 1–{Math.min(filtered.length, 12)} of {filtered.length} products</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
