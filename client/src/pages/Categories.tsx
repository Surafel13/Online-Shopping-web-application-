import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Search,
  Tag,
  X,
} from "lucide-react";
import { PageTransition } from "../components/layout/PageTransition";
import { Button } from "../components/ui/button";
import { categoryService, productService } from "../services";
import { getApiErrorMessage } from "../lib/errors";

interface CategoryCardData {
  id: string;
  name: string;
  description: string;
  count: number;
  image?: string;
}

type SortKey = "name" | "products";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name", label: "Name (A–Z)" },
  { value: "products", label: "Most products" },
];

const shopLink = (name: string) =>
  `/collections?category=${encodeURIComponent(name)}`;

function CategorySkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-card">
      <div className="aspect-[4/3] bg-muted" />
      <div className="space-y-3 p-5">
        <div className="h-4 w-2/3 rounded-full bg-muted" />
        <div className="h-3 w-full rounded-full bg-muted" />
        <div className="h-3 w-1/3 rounded-full bg-muted" />
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: CategoryCardData }) {
  return (
    <Link
      to={shopLink(category.name)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted/40">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/15 to-indigo-600/15 text-blue-600 dark:text-blue-400">
            <Tag className="h-10 w-10 opacity-60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" />
        <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
          {category.count} {category.count === 1 ? "product" : "products"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="mb-1.5 text-lg font-bold tracking-tight transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
          {category.name}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {category.description}
        </p>
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400">
          Shop now
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function Categories() {
  const [categories, setCategories] = useState<CategoryCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [apiCategories, products] = await Promise.all([
          categoryService.getAll(),
          productService.getAll(),
        ]);
        if (cancelled) return;

        const stats = new Map<string, { count: number; image?: string }>();
        products.forEach((product) => {
          const id =
            typeof product.category === "object"
              ? product.category._id
              : String(product.category);
          const entry = stats.get(id) ?? { count: 0 };
          entry.count += 1;
          if (!entry.image && product.images?.[0])
            entry.image = product.images[0];
          stats.set(id, entry);
        });

        setCategories(
          apiCategories.map((category) => {
            const entry = stats.get(category._id);
            const card: CategoryCardData = {
              id: category._id,
              name: category.name,
              description: category.description,
              count: entry?.count ?? 0,
            };
            if (entry?.image) card.image = entry.image;
            return card;
          }),
        );
        setError(null);
      } catch (err) {
        if (!cancelled)
          setError(getApiErrorMessage(err, "Failed to load categories."));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = categories.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query),
    );
    return [...filtered].sort((a, b) =>
      sort === "products"
        ? b.count - a.count || a.name.localeCompare(b.name)
        : a.name.localeCompare(b.name),
    );
  }, [categories, search, sort]);

  return (
    <PageTransition>
      <div className="bg-gradient-to-b from-muted/30 to-background border-b border-border/40">
        <div className="container mx-auto max-w-screen-xl px-4 py-12 sm:px-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm"
          >
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <span className="font-semibold text-foreground">Categories</span>
          </nav>
          <div className="max-w-3xl">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Shop by Category
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              Explore our collections and find exactly what you are looking for.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              aria-label="Search categories"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-12 w-full rounded-xl border border-border/70 bg-card pl-10 pr-10 text-sm font-medium transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <select
            aria-label="Sort categories"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-12 cursor-pointer rounded-xl border border-border/70 bg-card px-4 text-sm font-semibold transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CategorySkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md px-8 py-16 text-center">
            <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
            <h3 className="mb-1 text-lg font-semibold">
              Unable to load categories
            </h3>
            <p className="mb-5 text-sm text-muted-foreground">{error}</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setReloadKey((k) => k + 1)}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Try again
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="px-8 py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <Search className="h-8 w-8 opacity-40" />
            </div>
            <h3 className="mb-2 text-xl font-bold">
              {categories.length === 0
                ? "No categories yet"
                : "No categories found"}
            </h3>
            <p className="mx-auto mb-6 max-w-sm text-sm text-muted-foreground">
              {categories.length === 0
                ? "Categories will appear here once they are added."
                : "Try a different search term."}
            </p>
            {categories.length > 0 && (
              <Button variant="outline" onClick={() => setSearch("")}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm font-medium text-muted-foreground">
              Showing{" "}
              <span className="font-bold text-foreground">
                {visible.length}
              </span>{" "}
              {visible.length === 1 ? "category" : "categories"}
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((category, i) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i, 8) * 0.04 }}
                >
                  <CategoryCard category={category} />
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link to="/collections">
                <Button variant="outline" size="lg" className="rounded-xl">
                  Browse all products <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
