import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
  Layers,
  FolderOpen,
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
import { selectCls } from "../../utils/commerce.utils";
import { useLoader } from "../../hooks/useLoader";
import { usePagination } from "../../hooks/usePagination";
import { categoryService, productService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import type { AppDispatch } from "../../redux/store";
import type { ApiCategory } from "../../types/api";

const PAGE_SIZE = 10;
const loadData = () =>
  Promise.all([categoryService.getAll(), productService.getAll()]);

type SortKey = "name" | "products_desc" | "newest";
type UsageFilter = "all" | "used" | "empty";

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

export function SuperAdminCategories() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, error, reload } = useLoader(loadData);

  const rows = useMemo(() => {
    if (!data) return [];
    const [categories, products] = data;
    const counts = new Map<string, number>();
    products.forEach((p) => {
      const id =
        typeof p.category === "object" ? p.category._id : String(p.category);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    });
    return categories.map((c) => ({
      ...c,
      productCount: counts.get(c._id) ?? 0,
    }));
  }, [data]);

  const [search, setSearch] = useState("");
  const [usage, setUsage] = useState<UsageFilter>("all");
  const [sort, setSort] = useState<SortKey>("name");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ApiCategory | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [toDelete, setToDelete] = useState<(typeof rows)[number] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const stats = useMemo(
    () => ({
      total: rows.length,
      used: rows.filter((r) => r.productCount > 0).length,
      empty: rows.filter((r) => r.productCount === 0).length,
    }),
    [rows],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = rows.filter(
      (r) =>
        (usage === "all" ||
          (usage === "used" ? r.productCount > 0 : r.productCount === 0)) &&
        (r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)),
    );
    return [...list].sort((a, b) => {
      if (sort === "products_desc")
        return b.productCount - a.productCount || a.name.localeCompare(b.name);
      if (sort === "newest")
        return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      return a.name.localeCompare(b.name);
    });
  }, [rows, search, usage, sort]);

  const { page, pageCount, setPage, pageItems, total } = usePagination(
    visible,
    PAGE_SIZE,
    `${search}|${usage}|${sort}`,
  );

  const openDialog = (category?: ApiCategory) => {
    setEditing(category ?? null);
    setForm(
      category
        ? { name: category.name, description: category.description }
        : { name: "", description: "" },
    );
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };
      if (editing) await categoryService.update(editing._id, payload);
      else await categoryService.create(payload);
      dispatch(
        showSuccess(editing ? "Category updated." : "Category created."),
      );
      setDialogOpen(false);
      reload();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to save category.")));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      await categoryService.remove(toDelete._id);
      dispatch(showSuccess("Category deleted."));
      setToDelete(null);
      reload();
    } catch (err) {
      dispatch(
        showError(getApiErrorMessage(err, "Failed to delete category.")),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading)
    return (
      <PageTransition>
        <AdminLoadingState message="Loading categories..." />
      </PageTransition>
    );
  if (error)
    return (
      <PageTransition>
        <ErrorState message={error} onRetry={reload} />
      </PageTransition>
    );

  const activeFilterCount = (usage !== "all" ? 1 : 0) + (search.trim() ? 1 : 0);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Category Management"
            description="Organize and maintain storefront categories."
          />
          <Button
            className="gap-2 bg-blue-600 shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all font-medium px-5 h-11"
            onClick={() => openDialog()}
          >
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>

        {/* Modernized Stats Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Total Categories"
            value={String(stats.total)}
            icon={Layers}
            gradient="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="With Products"
            value={String(stats.used)}
            icon={FolderOpen}
            gradient="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label="Empty Categories"
            value={String(stats.empty)}
            icon={Tag}
            gradient="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
            iconColor="text-amber-600 dark:text-amber-400"
          />
        </div>

        {/* Main Workspace Container */}
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          {/* Enhanced Filter Bar */}
          <div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/30 px-6 py-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="h-10 pl-10 bg-background/60"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter by usage"
              className={`${selectCls} h-10 bg-background/60`}
              value={usage}
              onChange={(e) => setUsage(e.target.value as UsageFilter)}
            >
              <option value="all">All categories</option>
              <option value="used">With products</option>
              <option value="empty">Empty</option>
            </select>
            <select
              aria-label="Sort categories"
              className={`${selectCls} h-10 bg-background/60 sm:ml-auto`}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="name">Name (A–Z)</option>
              <option value="products_desc">Most products</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {/* Results Summary Strip */}
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-3 text-xs text-muted-foreground bg-card">
            <span>
              Showing{" "}
              <span className="font-semibold text-foreground">
                {pageItems.length}
              </span>{" "}
              of <span className="font-semibold text-foreground">{total}</span>{" "}
              categories
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
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/40 text-muted-foreground text-[11px] uppercase tracking-wider font-bold border-b border-border/60">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Products</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pageItems.length === 0 && (
                  <EmptyRow
                    colSpan={4}
                    text={
                      rows.length === 0
                        ? "No categories yet."
                        : "No categories match your filters."
                    }
                  />
                )}
                {pageItems.map((category) => (
                  <motion.tr
                    key={category._id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    <td className="px-6 py-4 font-semibold text-foreground">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground max-w-md truncate">
                      {category.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-muted/80 text-foreground/80 border border-border/40">
                        <Package className="h-3.5 w-3.5 text-muted-foreground" />{" "}
                        {category.productCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg border border-border/70 bg-background hover:bg-muted shadow-2xs"
                            aria-label="Category actions"
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="cursor-pointer gap-2"
                            onClick={() => openDialog(category)}
                          >
                            <Pencil className="h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                            onClick={() =>
                              category.productCount > 0
                                ? dispatch(
                                    showError(
                                      `"${category.name}" still has ${category.productCount} product(s). Move or delete them first.`,
                                    ),
                                  )
                                : setToDelete(category)
                            }
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
          className="sm:max-w-[480px]"
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <Input
                value={form.name}
                maxLength={100}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                Description
              </label>
              <Input
                value={form.description}
                maxLength={500}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSaving
                ? "Saving..."
                : editing
                  ? "Update Category"
                  : "Create Category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete category"
        description={`"${toDelete?.name ?? ""}" will be permanently removed.`}
        confirmLabel="Delete"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
      />
    </PageTransition>
  );
}
