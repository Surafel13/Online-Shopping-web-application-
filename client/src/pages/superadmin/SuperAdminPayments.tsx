import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  MoreHorizontal,
  Search,
  Wallet,
  Sparkles,
} from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { AdminLoadingState } from "../../components/shared/AdminLoadingState";
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
import { selectCls, money } from "../../utils/commerce.utils";
import { useLoader } from "../../hooks/useLoader";
import { usePagination } from "../../hooks/usePagination";
import { orderService } from "../../services";
import { downloadCsv } from "../../lib/csv";
import { getApiErrorMessage } from "../../lib/errors";
import { formatOrderDate } from "../../lib/mappers";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import type { AppDispatch } from "../../redux/store";
import type { ApiOrder, ApiUser, PaymentStatus } from "../../types/api";

const PAGE_SIZE = 10;
const loadOrders = () => orderService.getAll();
const STATUSES: PaymentStatus[] = ["pending", "paid", "failed"];
const STYLES: Record<PaymentStatus, string> = {
  pending:
    "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 font-semibold",
  paid: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 font-semibold",
  failed:
    "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-semibold",
};
const DOT: Record<PaymentStatus, string> = {
  pending: "bg-amber-500",
  paid: "bg-emerald-500",
  failed: "bg-rose-500 animate-pulse",
};

type SortKey = "newest" | "oldest" | "amount_desc" | "amount_asc";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const customerOf = (o: ApiOrder): ApiUser | null =>
  typeof o.userId === "object" ? o.userId : null;

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

export function SuperAdminPayments() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, error, reload } = useLoader(loadOrders);
  const orders = useMemo(() => data ?? [], [data]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>(
    "all",
  );
  const [methodFilter, setMethodFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [busyId, setBusyId] = useState<string | null>(null);

  const methods = useMemo(
    () => [...new Set(orders.map((o) => o.paymentMethod))].sort(),
    [orders],
  );

  const stats = useMemo(() => {
    const sum = (status: PaymentStatus) =>
      orders
        .filter((o) => o.paymentStatus === status)
        .reduce((s, o) => s + o.totalAmount, 0);
    return {
      collected: sum("paid"),
      pendingAmount: sum("pending"),
      pendingCount: orders.filter((o) => o.paymentStatus === "pending").length,
      failed: orders.filter((o) => o.paymentStatus === "failed").length,
      paid: orders.filter((o) => o.paymentStatus === "paid").length,
    };
  }, [orders]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = orders.filter((o) => {
      const c = customerOf(o);
      return (
        (statusFilter === "all" || o.paymentStatus === statusFilter) &&
        (methodFilter === "all" || o.paymentMethod === methodFilter) &&
        (o._id.toLowerCase().includes(q) ||
          (c?.username ?? "").toLowerCase().includes(q) ||
          (c?.email ?? "").toLowerCase().includes(q))
      );
    });
    return [...list].sort((a, b) => {
      if (sort === "amount_desc") return b.totalAmount - a.totalAmount;
      if (sort === "amount_asc") return a.totalAmount - b.totalAmount;
      const diff = (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
      return sort === "oldest" ? diff : -diff;
    });
  }, [orders, search, statusFilter, methodFilter, sort]);

  const { page, pageCount, setPage, pageItems, total } = usePagination(
    visible,
    PAGE_SIZE,
    `${search}|${statusFilter}|${methodFilter}|${sort}`,
  );

  const updateStatus = async (order: ApiOrder, status: PaymentStatus) => {
    setBusyId(order._id);
    try {
      await orderService.updatePaymentStatus(order._id, status);
      dispatch(showSuccess(`Payment marked ${status}.`));
      reload();
    } catch (err) {
      dispatch(
        showError(getApiErrorMessage(err, "Failed to update payment status.")),
      );
    } finally {
      setBusyId(null);
    }
  };

  const exportCsv = () =>
    downloadCsv("payments.csv", [
      [
        "Payment ref",
        "Order",
        "Customer",
        "Date",
        "Method",
        "Amount",
        "Status",
      ],
      ...visible.map((o) => [
        `PAY-${o._id.slice(-6).toUpperCase()}`,
        `ORD-${o._id.slice(-6).toUpperCase()}`,
        customerOf(o)?.username ?? "",
        formatOrderDate(o.createdAt),
        o.paymentMethod,
        o.totalAmount.toFixed(2),
        o.paymentStatus,
      ]),
    ]);

  if (isLoading)
    return (
      <PageTransition>
        <AdminLoadingState message="Loading payments..." />
      </PageTransition>
    );
  if (error)
    return (
      <PageTransition>
        <ErrorState message={error} onRetry={reload} />
      </PageTransition>
    );

  const activeFilterCount =
    (statusFilter !== "all" ? 1 : 0) +
    (methodFilter !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Payment Management"
            description="Track transactions and payment statuses. Payments are recorded per order."
          />
          <Button
            variant="outline"
            className="gap-2 bg-background border-border/70 hover:bg-muted font-medium px-4 h-11 shadow-xs"
            onClick={exportCsv}
            disabled={visible.length === 0}
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {/* Modernized Stats Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Collected"
            value={money(stats.collected)}
            icon={Wallet}
            gradient="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            label={`Awaiting (${stats.pendingCount})`}
            value={money(stats.pendingAmount)}
            icon={Clock}
            gradient="bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
            iconColor="text-amber-600 dark:text-amber-400"
          />
          <StatCard
            label="Successful"
            value={String(stats.paid)}
            icon={CheckCircle2}
            gradient="bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            label="Failed"
            value={String(stats.failed)}
            icon={AlertCircle}
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
                placeholder="Search by customer or reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter by status"
              className={`${selectCls} h-10 bg-background/60`}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | PaymentStatus)
              }
            >
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {cap(s)}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by method"
              className={`${selectCls} h-10 bg-background/60`}
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="all">All methods</option>
              {methods.map((m) => (
                <option key={m} value={m}>
                  {cap(m)}
                </option>
              ))}
            </select>
            <select
              aria-label="Sort payments"
              className={`${selectCls} h-10 bg-background/60 sm:ml-auto`}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount_desc">Amount: High → Low</option>
              <option value="amount_asc">Amount: Low → High</option>
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
              payments
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
                  <th className="px-6 py-4">Reference</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {pageItems.length === 0 && (
                  <EmptyRow
                    colSpan={7}
                    text={
                      orders.length === 0
                        ? "No payments yet."
                        : "No payments match your filters."
                    }
                  />
                )}
                {pageItems.map((order) => {
                  const customer = customerOf(order);
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="transition-colors hover:bg-muted/40 group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-bold tracking-tight text-foreground">
                          PAY-{order._id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          ORD-{order._id.slice(-6).toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shadow-2xs">
                            {(customer?.username ?? "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-foreground">
                              {customer?.username ?? "Customer"}
                            </div>
                            {customer?.email && (
                              <div className="truncate text-[11px] text-muted-foreground">
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted/80 px-2.5 py-1 text-xs font-medium text-foreground/80 border border-border/40">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          {cap(order.paymentMethod)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] ${STYLES[order.paymentStatus]}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${DOT[order.paymentStatus]}`}
                          />
                          {cap(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold tabular-nums text-foreground">
                        {money(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg border border-border/70 bg-background hover:bg-muted shadow-2xs"
                              disabled={busyId === order._id}
                              aria-label="Payment actions"
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {STATUSES.filter(
                              (s) => s !== order.paymentStatus,
                            ).map((s) => (
                              <DropdownMenuItem
                                key={s}
                                className={
                                  s === "failed"
                                    ? "cursor-pointer text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                                    : "cursor-pointer"
                                }
                                onClick={() => updateStatus(order, s)}
                              >
                                Mark as {s}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  );
                })}
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
    </PageTransition>
  );
}
