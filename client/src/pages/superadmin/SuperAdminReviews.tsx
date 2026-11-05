import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  MessageSquare,
  MoreHorizontal,
  Search,
  Star,
  ThumbsDown,
  Trash2,
} from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { AdminLoadingState } from "../../components/shared/AdminLoadingState";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { Pagination } from "../../components/shared/Pagination";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
import { reviewService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { formatOrderDate } from "../../lib/mappers";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import type { AppDispatch } from "../../redux/store";
import type { ApiReview } from "../../types/api";

const PAGE_SIZE = 10;
const loadReviews = () => reviewService.adminList();

type SortKey = "newest" | "oldest" | "rating_desc" | "rating_asc";
type StatusFilter = "all" | "visible" | "hidden";

const reviewerOf = (r: ApiReview) =>
  typeof r.user === "object" ? r.user.username : "Customer";
const productOf = (r: ApiReview) =>
  typeof r.product === "object" ? r.product.name : "Product";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/25"
          }`}
        />
      ))}
    </span>
  );
}

function StatPill({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="text-base font-semibold leading-tight">{value}</p>
      </div>
    </div>
  );
}

export function SuperAdminReviews() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, error, reload } = useLoader(loadReviews);
  const reviews = useMemo(() => data ?? [], [data]);

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [toDelete, setToDelete] = useState<ApiReview | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const stats = useMemo(() => {
    const visibleReviews = reviews.filter((r) => r.isActive);
    return {
      total: reviews.length,
      average: visibleReviews.length
        ? visibleReviews.reduce((s, r) => s + r.rating, 0) /
          visibleReviews.length
        : 0,
      hidden: reviews.length - visibleReviews.length,
      negative: reviews.filter((r) => r.rating <= 2).length,
    };
  }, [reviews]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = reviews.filter(
      (r) =>
        (ratingFilter === "all" || r.rating === Number(ratingFilter)) &&
        (statusFilter === "all" ||
          (statusFilter === "visible") === r.isActive) &&
        (r.title.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          reviewerOf(r).toLowerCase().includes(q) ||
          productOf(r).toLowerCase().includes(q)),
    );
    return [...list].sort((a, b) => {
      if (sort === "rating_desc") return b.rating - a.rating;
      if (sort === "rating_asc") return a.rating - b.rating;
      const diff = (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
      return sort === "oldest" ? diff : -diff;
    });
  }, [reviews, search, ratingFilter, statusFilter, sort]);

  const { page, pageCount, setPage, pageItems, total } = usePagination(
    visible,
    PAGE_SIZE,
    `${search}|${ratingFilter}|${statusFilter}|${sort}`,
  );

  const toggleStatus = async (review: ApiReview) => {
    try {
      await reviewService.adminSetStatus(review._id, !review.isActive);
      dispatch(
        showSuccess(review.isActive ? "Review hidden." : "Review restored."),
      );
      reload();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to update review.")));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setIsWorking(true);
    try {
      await reviewService.adminRemove(toDelete._id);
      dispatch(showSuccess("Review deleted."));
      setToDelete(null);
      reload();
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, "Failed to delete review.")));
    } finally {
      setIsWorking(false);
    }
  };

  if (isLoading)
    return (
      <PageTransition>
        <AdminLoadingState message="Loading reviews..." />
      </PageTransition>
    );
  if (error)
    return (
      <PageTransition>
        <ErrorState message={error} onRetry={reload} />
      </PageTransition>
    );

  const activeFilterCount =
    (ratingFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        <PageHeader
          title="Reviews & Ratings"
          description="Moderate customer reviews and product ratings."
        />

        {/* Consolidated stats strip */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="grid grid-cols-2 divide-y divide-border sm:divide-y-0 sm:divide-x xl:grid-cols-4">
            <StatPill
              label="Total Reviews"
              value={String(stats.total)}
              icon={MessageSquare}
              tone="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
            />
            <StatPill
              label="Average Rating"
              value={stats.average.toFixed(1)}
              icon={Star}
              tone="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            />
            <StatPill
              label="Hidden"
              value={String(stats.hidden)}
              icon={EyeOff}
              tone="bg-slate-100 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400"
            />
            <StatPill
              label="Low Ratings (≤ 2★)"
              value={String(stats.negative)}
              icon={ThumbsDown}
              tone="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
            />
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/20 px-4 py-3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 pl-9"
                placeholder="Search reviews, users, products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter by rating"
              className={`${selectCls} h-9`}
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
            >
              <option value="all">All ratings</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? "s" : ""}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by status"
              className={`${selectCls} h-9`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            >
              <option value="all">All statuses</option>
              <option value="visible">Visible</option>
              <option value="hidden">Hidden</option>
            </select>
            <select
              aria-label="Sort reviews"
              className={`${selectCls} h-9 sm:ml-auto`}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="rating_desc">Rating: High → Low</option>
              <option value="rating_asc">Rating: Low → High</option>
            </select>
          </div>

          {/* Results summary */}
          <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-medium text-foreground">
                {pageItems.length}
              </span>{" "}
              of <span className="font-medium text-foreground">{total}</span>{" "}
              reviews
            </span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
                active
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Reviewer</th>
                  <th className="px-6 py-3.5">Product</th>
                  <th className="px-6 py-3.5">Review</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {pageItems.length === 0 && (
                  <EmptyRow
                    colSpan={6}
                    text={
                      reviews.length === 0
                        ? "No reviews yet."
                        : "No reviews match your filters."
                    }
                  />
                )}
                {pageItems.map((review) => (
                  <motion.tr
                    key={review._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="align-top transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                          {reviewerOf(review).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">
                          {reviewerOf(review)}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-[180px] truncate px-6 py-4 text-muted-foreground">
                      {productOf(review)}
                    </td>
                    <td className="min-w-[280px] max-w-md px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Stars rating={review.rating} />
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {review.rating}.0
                        </span>
                      </div>
                      <p className="mt-1 font-medium">{review.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {review.comment}
                      </p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-xs text-muted-foreground">
                      {formatOrderDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          review.isActive
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20 dark:bg-slate-900/40 dark:text-slate-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            review.isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {review.isActive ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg border bg-background hover:bg-muted"
                            aria-label="Review actions"
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={() => toggleStatus(review)}
                            className="cursor-pointer"
                          >
                            {review.isActive ? (
                              <>
                                <EyeOff className="mr-2 h-4 w-4" /> Hide
                              </>
                            ) : (
                              <>
                                <Eye className="mr-2 h-4 w-4" /> Restore
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600"
                            onClick={() => setToDelete(review)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
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

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete review"
        description="This review will be permanently removed and the product rating recalculated."
        confirmLabel="Delete"
        tone="danger"
        isLoading={isWorking}
        onConfirm={confirmDelete}
      />
    </PageTransition>
  );
}
