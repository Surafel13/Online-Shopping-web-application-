import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Boxes,
  MoreHorizontal,
  Package,
  PackageX,
  Pencil,
  Plus,
  Search,
  Trash2,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { AdminLoadingState } from "../../components/shared/AdminLoadingState";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Pagination } from "../../components/shared/Pagination";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  EmptyRow,
  ErrorState,
  PageHeader,
} from "../../features/superadmin/commerce/commerceUi";
import { selectCls, money } from "../../utils/commerce.utils";
import { useLoader } from "../../hooks/useLoader";
import { usePagination } from "../../hooks/usePagination";
import { categoryService, productService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { buildCategoryMap } from "../../lib/mappers";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import type { AppDispatch } from "../../redux/store";
import type { ApiCategory, ApiProduct } from "../../types/api";

const PAGE_SIZE = 10;
const loadData = () =>
  Promise.all([productService.getAll(), categoryService.getAll()]);

type SortKey =
  | "newest"
  | "name"
  | "price_asc"
  | "price_desc"
  | "stock_asc"
  | "stock_desc";
type StockFilter = "all" | "in" | "low" | "out";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name (A–Z)" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "stock_asc", label: "Stock: Low → High" },
  { value: "stock_desc", label: "Stock: High → Low" },
];

const emptyForm = {
  name: "",
  description: "",
  price: "",
  purchasePrice: "",
  category: "",
  stock: "",
};

const categoryIdOf = (category: string | ApiCategory) =>
  typeof category === "object" ? category._id : String(category);

const stockState = (stock: number): Exclude<StockFilter, "all"> =>
  stock <= 0 ? "out" : stock < 10 ? "low" : "in";

function StockBadge({ stock }: { stock: number }) {
  const state = stockState(stock);
  if (state === "out")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
        Out of stock
      </span>
    );
  if (state === "low")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        {stock} left
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      {stock} in stock
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  iconColor,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  iconColor: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/65 bg-card/60 backdrop-blur-sm p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-border">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${gradient} opacity-40 blur-2xl pointer-events-none`}
      />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground">
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${gradient} shadow-sm`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

export function SuperAdminProducts() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, error, reload } = useLoader(loadData);
  const products = useMemo(() => data?.[0] ?? [], [data]);
  const categories = useMemo(() => data?.[1] ?? [], [data]);
  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApiProduct | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [toDelete, setToDelete] = useState<ApiProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const stats = useMemo(
    () => ({
      total: products.length,
      value: products.reduce((sum, p) => sum + p.price * p.stock, 0),
      low: products.filter((p) => stockState(p.stock) === "low").length,
      out: products.filter((p) => stockState(p.stock) === "out").length,
    }),
    [products],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (categoryFilter === "all" ||
          categoryIdOf(p.category) === categoryFilter) &&
        (stockFilter === "all" || stockState(p.stock) === stockFilter) &&
        (p.name.toLowerCase().includes(q) ||
          (categoryMap.get(categoryIdOf(p.category)) ?? "")
            .toLowerCase()
            .includes(q)),
    );
    return [...list].sort((a, b) => {
      switch (sort) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price_asc":
          return a.price - b.price;
        case "price_desc":
          return b.price - a.price;
        case "stock_asc":
          return a.stock - b.stock;
        case "stock_desc":
          return b.stock - a.stock;
        default:
          return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      }
    });
  }, [products, search, categoryFilter, stockFilter, sort, categoryMap]);

  const { page, pageCount, setPage, pageItems, total } = usePagination(
    visible,
    PAGE_SIZE,
    `${search}|${categoryFilter}|${stockFilter}|${sort}`,
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, category: categories[0]?._id ?? "" });
    setImageFile(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (product: ApiProduct) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      purchasePrice: String(product.purchasePrice ?? 0),
      category: categoryIdOf(product.category),
      stock: String(product.stock),
    });
    setImageFile(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing && !imageFile) {
      setFormError("A product image is required.");
      return;
    }
    if (!form.category) {
      setFormError("Select a category.");
      return;
    }
    setFormError(null);
    setIsSaving(true);
    try {
      const body = new FormData();
      (Object.keys(form) as (keyof typeof form)[]).forEach((key) =>
        body.append(key, form[key]),
      );
      if (imageFile) body.append("image", imageFile);

      if (editing) {
        await productService.update(editing._id, body);
        dispatch(showSuccess("Product updated."));
      } else {
        await productService.create(body);
        dispatch(showSuccess("Product created."));
      }
      setDialogOpen(false);
      reload();
    } catch (err) {
      setFormError(getApiErrorMessage(err, "Failed to save product."));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      await productService.remove(toDelete._id);
      dispatch(showSuccess("Product deleted."));
      setToDelete(null);
      reload();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to delete product.")));
    } finally {
      setIsDeleting(false);
    }
  };

  const setField = (key: keyof typeof emptyForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [key]: e.target.value }),
  });

  if (isLoading) {
    return (
      <PageTransition>
        <AdminLoadingState message="Loading products..." />
      </PageTransition>
    );
  }
  if (error) {
    return (
      <PageTransition>
        <ErrorState message={error} onRetry={reload} />
      </PageTransition>
    );
  }

  const activeFilterCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (stockFilter !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Product Management"
            description="Oversee the full product catalog across the platform."
          />
          <Button
            className="gap-2 bg-blue-600 shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all font-medium px-5 h-11"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>

        {/* Clean, modernized grid metrics replacing standard boxes */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Products"
            value={String(stats.total)}
            icon={Boxes}
            gradient="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Inventory Value"
            value={money(stats.value)}
            icon={DollarSign}
            gradient="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="Low Stock Items"
            value={String(stats.low)}
            icon={AlertTriangle}
            gradient="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
            iconColor="text-amber-600 dark:text-amber-400"
          />
          <StatCard
            label="Out of Stock"
            value={String(stats.out)}
            icon={PackageX}
            gradient="bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
            iconColor="text-rose-600 dark:text-rose-400"
          />
        </div>

        {/* Main Workspace Container */}
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          {/* Enhanced Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/30 px-6 py-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-10 pl-10 bg-background/60"
                placeholder="Search products or categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter by category"
              className={`${selectCls} h-10 bg-background/60`}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by stock"
              className={`${selectCls} h-10 bg-background/60`}
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
            >
              <option value="all">All stock levels</option>
              <option value="in">In stock</option>
              <option value="low">Low stock</option>
              <option value="out">Out of stock</option>
            </select>
            <select
              aria-label="Sort products"
              className={`${selectCls} h-10 bg-background/60 sm:ml-auto`}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Results summary info strip */}
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-3 text-xs text-muted-foreground bg-card">
            <span>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {pageItems.length}
              </span>{" "}
              of <span className="font-semibold text-foreground">{total}</span>{" "}
              products
            </span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
                <Sparkles className="h-3 w-3" />
                {activeFilterCount} active filter
                {activeFilterCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Table view */}
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pageItems.length === 0 && (
                  <EmptyRow
                    colSpan={6}
                    text={
                      products.length === 0
                        ? "No products yet."
                        : "No products match your filters."
                    }
                  />
                )}
                {pageItems.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="transition-colors hover:bg-muted/40 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border/85 bg-muted shadow-xs">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="max-w-[260px] truncate font-semibold text-foreground">
                          {product.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-lg bg-muted/80 px-2.5 py-1 text-xs font-medium text-foreground/80 border border-border/40">
                        {categoryMap.get(categoryIdOf(product.category)) ??
                          "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold tabular-nums text-foreground">
                      {money(product.finalPrice ?? product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-bold text-amber-500">★</span>
                        <span className="font-semibold text-foreground">
                          {(product.rating ?? 0).toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">
                          ({product.reviewCount ?? 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StockBadge stock={product.stock} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg border border-border/70 bg-background hover:bg-muted shadow-2xs"
                            aria-label="Product actions"
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={() => openEdit(product)}
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                            onClick={() => setToDelete(product)}
                          >
                            <Trash2 className="h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            pageCount={pageCount}
            total={total}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>

      <Dialog
        open={dialogOpen}
        onOpenChange={(v) => !isSaving && setDialogOpen(v)}
      >
        <DialogContent
          className="sm:max-w-[520px]"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Name</label>
              <Input required minLength={3} {...setField("name")} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description</label>
              <Input required minLength={10} {...setField("description")} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  {...setField("price")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Cost</label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  {...setField("purchasePrice")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Stock</label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  required
                  {...setField("stock")}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
              >
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Product image
                {editing && (
                  <span className="ml-1 font-normal text-muted-foreground">
                    (leave empty to keep current)
                  </span>
                )}
              </label>
              <Input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {formError && (
              <p
                className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600 ring-1 ring-inset ring-rose-600/20"
                role="alert"
              >
                {formError}
              </p>
            )}
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSaving
                ? "Saving..."
                : editing
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete product"
        description={`"${toDelete?.name ?? ""}" will be permanently removed from the catalog.`}
        confirmLabel="Delete"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </PageTransition>
  );
}
