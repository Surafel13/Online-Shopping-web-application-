import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/button';
import {
  Search, SlidersHorizontal, LayoutGrid, List,
  Star, ChevronRight, Heart, ShoppingCart, X, SlidersVertical, Sparkles
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
  { value: 'popular',   label: 'Most Popular'    },
  { value: 'price_asc', label: 'Price: Low → High'},
  { value: 'price_desc',label: 'Price: High → Low'},
  { value: 'rating',    label: 'Top Rated'       },
];

// ─── Star Rating ───────────────────────────────────────────────────────────────
const StarRow = ({ rating, size = 3.5 }: { rating: number; size?: number }) => (
  <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        style={{ width: `${size * 0.25}rem`, height: `${size * 0.25}rem` }}
        className={`${i <= Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted/60 fill-muted/40'}`}
      />
    ))}
  </div>
);

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="border border-border/60 rounded-2xl bg-card overflow-hidden animate-pulse shadow-sm">
    <div className="bg-muted h-64 w-full" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-muted rounded-full w-1/4" />
      <div className="h-4 bg-muted rounded-full w-3/4" />
      <div className="h-3 bg-muted rounded-full w-1/2" />
      <div className="pt-2 flex items-center justify-between">
        <div className="h-5 bg-muted rounded-full w-1/3" />
        <div className="h-8 bg-muted rounded-xl w-1/4" />
      </div>
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
      className="group border border-border/60 rounded-2xl bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden bg-muted/40 aspect-[4/5]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
              <Sparkles className="w-2.5 h-2.5" /> New
            </span>
          )}
          {product.isOnSale && discount && (
            <span className="bg-red-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="bg-gray-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => setWishlisted(w => !w)}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
          aria-label="Save to Wishlist"
        >
          <Heart className={`h-4 w-4 transition-colors ${wishlisted ? 'text-red-500 fill-red-500' : 'text-foreground/70'}`} />
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-background/90 via-background/40 to-transparent">
          <Link to={`/product/${product.id}`}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-600/20">
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Quick View / Add
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-1.5">{product.category}</p>
          <Link to={`/product/${product.id}`}>
            <h3 className="font-semibold text-sm sm:text-base leading-snug mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mb-4">
            <StarRow rating={product.rating} />
            <span className="text-xs text-muted-foreground font-medium">({product.reviews})</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-base sm:text-lg text-blue-600 dark:text-blue-400">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through font-medium">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          <span className={`text-xs font-medium ${product.inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
            {product.inStock ? 'Available' : 'Unavailable'}
          </span>
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
      className="group border border-border/60 rounded-2xl bg-card overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
    >
      <div className="relative sm:w-56 shrink-0 bg-muted/40 aspect-[4/3] sm:aspect-auto overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="bg-blue-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">New</span>
          )}
          {product.isOnSale && discount && (
            <span className="bg-red-500 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full shadow-sm">-{discount}%</span>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em]">{product.category}</p>
            <span className={`text-xs font-semibold ${product.inStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {product.inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-lg sm:text-xl leading-snug mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <StarRow rating={product.rating} size={4} />
            <span className="text-xs text-muted-foreground font-medium">{product.rating} ({product.reviews} reviews)</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
          <div className="flex items-baseline gap-2.5">
            <span className="font-extrabold text-xl text-blue-600 dark:text-blue-400">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through font-medium">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setWishlisted(w => !w)}
              className="h-11 w-11 rounded-xl border border-border/80 flex items-center justify-center hover:bg-muted transition-colors"
              aria-label="Wishlist"
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'text-red-500 fill-red-500' : 'text-muted-foreground'}`} />
            </button>
            <Link to={`/product/${product.id}`} className="flex-1 sm:flex-initial">
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 h-11 rounded-xl shadow-lg shadow-blue-600/20">
                <ShoppingCart className="h-4 w-4 mr-2" /> View & Add
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Sidebar Filter Section ────────────────────────────────────────────────────
const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/80">{title}</h4>
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
  const [currentPage, setCurrentPage]     = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sort, priceRange, inStockOnly, onSaleOnly, newOnly, minRating]);

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
    setTimeout(() => setIsFiltering(false), 250);
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

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const activeFiltersCount = [
    category !== 'All Products', inStockOnly, onSaleOnly, newOnly,
    minRating > 0, priceRange[0] > 0 || priceRange[1] < 2000
  ].filter(Boolean).length;

  // ── Sidebar content ────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="space-y-8">
      <FilterSection title="Categories">
        <ul className="space-y-2">
          {categoryOptions.map(cat => (
            <li key={cat}>
              <label className="flex items-center gap-3 cursor-pointer group py-1">
                <span className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${category === cat ? 'border-blue-600 bg-blue-600/10' : 'border-border group-hover:border-blue-500/50'}`}>
                  {category === cat && <span className="h-2 w-2 rounded-full bg-blue-600 block" />}
                </span>
                <input type="radio" className="sr-only" checked={category === cat} onChange={() => triggerFilter(() => setCategory(cat))} />
                <span className={`text-sm transition-colors ${category === cat ? 'text-blue-600 font-semibold dark:text-blue-400' : 'text-muted-foreground group-hover:text-foreground'}`}>{cat}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterSection>

      <div className="h-px bg-border/60" />

      <FilterSection title="Price Range">
        <div className="space-y-4 pt-2">
          <input
            type="range" min={0} max={2000} step={10}
            value={priceRange[1]}
            onChange={e => triggerFilter(() => setPriceRange([priceRange[0], +e.target.value]))}
            className="w-full accent-blue-600 cursor-pointer"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold bg-muted/50 p-2.5 rounded-xl border border-border/50">
            <span>${priceRange[0]}</span>
            <span>—</span>
            <span>${priceRange[1] >= 2000 ? '$2,000+' : priceRange[1]}</span>
          </div>
        </div>
      </FilterSection>

      <div className="h-px bg-border/60" />

      <FilterSection title="Availability & Offers">
        <div className="space-y-3">
          {[
            { label: 'In Stock Only',     val: inStockOnly, set: setInStockOnly },
            { label: 'On Sale Items',      val: onSaleOnly,  set: setOnSaleOnly  },
            { label: 'New Arrivals',       val: newOnly,      set: setNewOnly     },
          ].map(({ label, val, set }) => (
            <label key={label} className="flex items-center gap-3 cursor-pointer group">
              <span className={`h-4 w-4 rounded-md border flex items-center justify-center transition-colors ${val ? 'border-blue-600 bg-blue-600 text-white' : 'border-border group-hover:border-blue-500/50 bg-background'}`}>
                {val && <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
              </span>
              <input type="checkbox" className="sr-only" checked={val} onChange={e => triggerFilter(() => set(e.target.checked))} />
              <span className={`text-sm font-medium ${val ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground group-hover:text-foreground'}`}>{label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      <div className="h-px bg-border/60" />

      <FilterSection title="Minimum Rating">
        <div className="space-y-2">
          {[4, 3, 2].map(r => (
            <button
              key={r}
              onClick={() => triggerFilter(() => setMinRating(minRating === r ? 0 : r))}
              className={`flex items-center justify-between p-2 rounded-xl border transition-all w-full ${minRating === r ? 'border-blue-600 bg-blue-500/5 text-blue-600 dark:text-blue-400 font-semibold' : 'border-border/60 hover:bg-muted/50 text-muted-foreground'}`}
            >
              <StarRow rating={r} size={4} />
              <span className="text-xs">& Up</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {activeFiltersCount > 0 && (
        <div className="pt-2">
          <Button onClick={clearAll} variant="outline" className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20 font-semibold h-11 rounded-xl">
            <X className="h-4 w-4 mr-2" /> Clear All Filters ({activeFiltersCount})
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <PageTransition>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-muted/50 to-background border-b border-border/50">
        <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <span className="text-foreground font-semibold">Collections</span>
          </nav>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Explore All Products</h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
              Browse our fully curated collection of premium essentials. Quality, sustainability, and exceptional design built for your modern workflow.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── SIDEBAR (desktop) ──────────────────────────────────────────── */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24 bg-card border border-border/60 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                  <SlidersVertical className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-sm uppercase tracking-[0.2em]">Filters</h3>
                </div>
                {activeFiltersCount > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">{activeFiltersCount}</span>
                )}
              </div>
              <SidebarContent />
            </div>
          </aside>

          {/* ── MOBILE FILTER DRAWER ──────────────────────────────────────── */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileFiltersOpen(false)} />
                <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25 }}
                  className="fixed inset-y-0 left-0 w-80 max-w-full bg-card z-50 overflow-y-auto p-6 shadow-2xl lg:hidden">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                    <div className="flex items-center gap-2">
                      <SlidersVertical className="h-4 w-4 text-blue-600" />
                      <h3 className="font-bold text-base">Filter Products</h3>
                    </div>
                    <button onClick={() => setMobileFiltersOpen(false)} className="h-9 w-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80">
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
            <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-card border border-border/60 p-4 rounded-2xl shadow-sm">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search products by title or category..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full h-12 pl-10 pr-10 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile filter trigger */}
                <Button variant="outline" className="lg:hidden flex items-center gap-2 h-12 px-4 rounded-xl border-border font-semibold flex-1 sm:flex-none" onClick={() => setMobileFiltersOpen(true)}>
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters {activeFiltersCount > 0 && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{activeFiltersCount}</span>}
                </Button>

                {/* Sort */}
                <select
                  value={sort}
                  onChange={e => triggerFilter(() => setSort(e.target.value as SortKey))}
                  className="h-12 rounded-xl border border-border bg-background px-4 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all cursor-pointer flex-1 sm:flex-none"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                {/* View toggle */}
                <div className="hidden sm:flex items-center border border-border rounded-xl overflow-hidden bg-background shrink-0">
                  <button onClick={() => setViewMode('grid')} className={`h-12 w-12 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-muted'}`} aria-label="Grid View">
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`h-12 w-12 flex items-center justify-center transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-muted-foreground hover:bg-muted'}`} aria-label="List View">
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters Bar */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <p className="text-sm font-medium text-muted-foreground">
                Showing <span className="font-bold text-foreground">{filtered.length}</span> {filtered.length === 1 ? 'product' : 'products'}
                {category !== 'All Products' && <> in <span className="font-bold text-foreground">{category}</span></>}
              </p>
              {search && (
                <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                  "{search}" <button onClick={() => setSearch('')} className="hover:opacity-75"><X className="h-3 w-3" /></button>
                </span>
              )}
              {minRating > 0 && (
                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                  {minRating}★ & up <button onClick={() => setMinRating(0)} className="hover:opacity-75"><X className="h-3 w-3" /></button>
                </span>
              )}
            </div>

            {/* Grid / List Display */}
            <AnimatePresence mode="wait">
              {isPageLoading || isFiltering ? (
                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
                  {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                </motion.div>
              ) : filtered.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24 bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
                  <div className="w-16 h-16 bg-muted/60 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <Search className="h-8 w-8 opacity-40" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">No products found</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">We couldn't find anything matching your current search or filter criteria. Try resetting them.</p>
                  <Button onClick={clearAll} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 h-12 rounded-xl shadow-lg shadow-blue-600/20">
                    Clear All Filters
                  </Button>
                </motion.div>
              ) : viewMode === 'grid' ? (
                <motion.div key="grid" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginated.map((product, i) => (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <ProductCardGrid product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="list" className="flex flex-col gap-5">
                  {paginated.map((product, i) => (
                    <motion.div key={product.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                      <ProductCardList product={product} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-16 flex flex-col items-center gap-4">
                <div className="flex items-center gap-1.5 bg-card border border-border/60 p-2 rounded-2xl shadow-sm">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-border/80 font-bold"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    &lsaquo;
                  </Button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const page = i + 1;
                    if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="icon"
                          onClick={() => setCurrentPage(page)}
                          className={`h-10 w-10 rounded-xl font-bold ${page === currentPage ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 border-transparent' : 'border-border/80'}`}
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="text-muted-foreground px-2 font-bold">…</span>;
                    }
                    return null;
                  })}

                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-border/80 font-bold"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    &rsaquo;
                  </Button>
                </div>
                <p className="text-xs font-medium text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} products
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
