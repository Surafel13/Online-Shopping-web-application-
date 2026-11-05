import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  MapPin,
  MoreHorizontal,
  Package,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  X,
  XCircle,
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
import { selectCls, money } from "../../utils/commerce.utils";
import { useLoader } from "../../hooks/useLoader";
import { usePagination } from "../../hooks/usePagination";
import { orderService } from "../../services";
import { downloadCsv } from "../../lib/csv";
import { getApiErrorMessage } from "../../lib/errors";
import { formatOrderDate, getProductFromRef } from "../../lib/mappers";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import type { AppDispatch } from "../../redux/store";
import type {
  ApiOrder,
  ApiUser,
  OrderStatus,
  PaymentStatus,
} from "../../types/api";

const PAGE_SIZE = 10;
const loadOrders = () => orderService.getAll();

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed"];

const ORDER_STYLES: Record<OrderStatus, string> = {
  pending:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400",
  processing:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400",
  shipped:
    "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/40 dark:text-indigo-400",
  delivered:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400",
  cancelled:
    "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400",
};
const ORDER_DOT: Record<OrderStatus, string> = {
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  shipped: "bg-indigo-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-rose-500",
};
const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400",
  paid: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400",
  failed:
    "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-400",
};
const PAYMENT_DOT: Record<PaymentStatus, string> = {
  pending: "bg-amber-500",
  paid: "bg-emerald-500",
  failed: "bg-rose-500",
};

type SortKey = "newest" | "oldest" | "amount_desc" | "amount_asc";
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const orderCode = (o: ApiOrder) => `ORD-${o._id.slice(-6).toUpperCase()}`;
const customerOf = (o: ApiOrder): ApiUser | null =>
  typeof o.userId === "object" ? o.userId : null;

/** Derive a status-progress timeline from the current order state. */
const buildTimeline = (order: ApiOrder) => {
  const events: {
    label: string;
    at: string;
    icon: React.ComponentType<{ className?: string }>;
    tone: string;
    done: boolean;
  }[] = [
    {
      label: "Order placed",
      at: formatOrderDate(order.createdAt),
      icon: Clock,
      tone: "bg-blue-500",
      done: true,
    },
    {
      label: "Payment confirmed",
      at: order.paymentStatus === "paid" ? "Payment received" : "Awaiting",
      icon: CreditCard,
      tone:
        order.paymentStatus === "paid"
          ? "bg-emerald-500"
          : "bg-muted-foreground/30",
      done: order.paymentStatus === "paid",
    },
    {
      label: "Processing",
      at: ["processing", "shipped", "delivered"].includes(order.orderStatus)
        ? "In progress"
        : "Not started",
      icon: Package,
      tone: ["processing", "shipped", "delivered"].includes(order.orderStatus)
        ? "bg-emerald-500"
        : "bg-muted-foreground/30",
      done: ["processing", "shipped", "delivered"].includes(order.orderStatus),
    },
    {
      label: "Shipped",
      at: ["shipped", "delivered"].includes(order.orderStatus)
        ? "Dispatched"
        : "Not shipped",
      icon: Truck,
      tone: ["shipped", "delivered"].includes(order.orderStatus)
        ? "bg-emerald-500"
        : "bg-muted-foreground/30",
      done: ["shipped", "delivered"].includes(order.orderStatus),
    },
    {
      label: "Delivered",
      at: order.orderStatus === "delivered" ? "Completed" : "Pending",
      icon: CheckCircle2,
      tone:
        order.orderStatus === "delivered"
          ? "bg-emerald-500"
          : "bg-muted-foreground/30",
      done: order.orderStatus === "delivered",
    },
  ];
  if (order.orderStatus === "cancelled") {
    events.push({
      label: "Cancelled",
      at: "Order cancelled",
      icon: XCircle,
      tone: "bg-rose-500",
      done: true,
    });
  }
  return events;
};

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
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-base font-semibold leading-tight tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

export function SuperAdminOrders() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, error, reload } = useLoader(loadOrders);
  const orders = useMemo(() => data ?? [], [data]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>(
    "all",
  );
  const [sort, setSort] = useState<SortKey>("newest");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ApiOrder | null>(null);
  const [toCancel, setToCancel] = useState<ApiOrder | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [copied, setCopied] = useState(false);

  const detail = orders.find((o) => o._id === detailId) ?? null;
  const detailCustomer = detail ? customerOf(detail) : null;
  const timeline = detail ? buildTimeline(detail) : [];

  const stats = useMemo(() => {
    const live = orders.filter((o) => o.orderStatus !== "cancelled");
    return {
      total: orders.length,
      pending: orders.filter((o) => o.orderStatus === "pending").length,
      revenue: live.reduce((s, o) => s + o.totalAmount, 0),
      cancelled: orders.length - live.length,
    };
  }, [orders]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = orders.filter((o) => {
      const c = customerOf(o);
      return (
        (statusFilter === "all" || o.orderStatus === statusFilter) &&
        (paymentFilter === "all" || o.paymentStatus === paymentFilter) &&
        (orderCode(o).toLowerCase().includes(q) ||
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
  }, [orders, search, statusFilter, paymentFilter, sort]);

  const { page, pageCount, setPage, pageItems, total } = usePagination(
    visible,
    PAGE_SIZE,
    `${search}|${statusFilter}|${paymentFilter}|${sort}`,
  );

  const run = async (
    action: () => Promise<unknown>,
    success: string,
    fail: string,
  ) => {
    setIsWorking(true);
    try {
      await action();
      dispatch(showSuccess(success));
      reload();
      return true;
    } catch (err) {
      dispatch(showError(getApiErrorMessage(err, fail)));
      return false;
    } finally {
      setIsWorking(false);
    }
  };

  const setStatus = (order: ApiOrder, status: OrderStatus) =>
    status === "cancelled"
      ? setToCancel(order)
      : run(
          () => orderService.updateStatus(order._id, status),
          `Order marked ${status}.`,
          "Failed to update order status.",
        );

  const setPayment = (order: ApiOrder, status: PaymentStatus) =>
    run(
      () => orderService.updatePaymentStatus(order._id, status),
      `Payment marked ${status}.`,
      "Failed to update payment status.",
    );

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard not available */
    }
  };

  const exportCsv = () =>
    downloadCsv("orders.csv", [
      [
        "Order",
        "Customer",
        "Email",
        "Date",
        "Items",
        "Total",
        "Payment method",
        "Payment status",
        "Order status",
      ],
      ...visible.map((o) => [
        orderCode(o),
        customerOf(o)?.username ?? "",
        customerOf(o)?.email ?? "",
        formatOrderDate(o.createdAt),
        o.items.reduce((n, i) => n + i.quantity, 0),
        o.totalAmount.toFixed(2),
        o.paymentMethod,
        o.paymentStatus,
        o.orderStatus,
      ]),
    ]);

  if (isLoading)
    return (
      <PageTransition>
        <AdminLoadingState message="Loading orders..." />
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
    (paymentFilter !== "all" ? 1 : 0) +
    (search.trim() ? 1 : 0);

  // Derived item subtotal + shipping delta for the detail panel
  const itemSubtotal = detail
    ? detail.items.reduce((s, i) => s + i.price * i.quantity, 0)
    : 0;
  const shippingFee = detail
    ? Math.max(0, Number(detail.totalAmount) - itemSubtotal)
    : 0;

  return (
    <PageTransition>
      <div className="mx-auto max-w-7xl space-y-6 pb-12">
        <PageHeader
          title="Order Management"
          description="Monitor, update and audit all customer orders."
          action={
            <Button
              variant="outline"
              className="gap-2 bg-background"
              onClick={exportCsv}
              disabled={visible.length === 0}
            >
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          }
        />

        {/* Consolidated stats strip */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="grid grid-cols-2 divide-y divide-border sm:divide-y-0 sm:divide-x xl:grid-cols-4">
            <StatPill
              label="Total Orders"
              value={String(stats.total)}
              icon={ShoppingBag}
              tone="bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
            />
            <StatPill
              label="Pending"
              value={String(stats.pending)}
              icon={Clock}
              tone="bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            />
            <StatPill
              label="Revenue"
              value={money(stats.revenue)}
              icon={DollarSign}
              tone="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
            />
            <StatPill
              label="Cancelled"
              value={String(stats.cancelled)}
              icon={XCircle}
              tone="bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
            />
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b bg-muted/20 px-4 py-3">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 pl-9"
                placeholder="Search order ID or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              aria-label="Filter by order status"
              className={`${selectCls} h-9`}
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | OrderStatus)
              }
            >
              <option value="all">All statuses</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {cap(s)}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by payment status"
              className={`${selectCls} h-9`}
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(e.target.value as "all" | PaymentStatus)
              }
            >
              <option value="all">All payments</option>
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {cap(s)}
                </option>
              ))}
            </select>
            <select
              aria-label="Sort orders"
              className={`${selectCls} h-9 sm:ml-auto`}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount_desc">Amount: High → Low</option>
              <option value="amount_asc">Amount: Low → High</option>
            </select>
          </div>

          <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
            <span>
              Showing{" "}
              <span className="font-medium text-foreground">
                {pageItems.length}
              </span>{" "}
              of <span className="font-medium text-foreground">{total}</span>{" "}
              orders
            </span>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""}{" "}
                active
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-left text-sm">
              <thead className="border-b bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Order</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5 text-right">Total</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {pageItems.length === 0 && (
                  <EmptyRow
                    colSpan={7}
                    text={
                      orders.length === 0
                        ? "No orders yet."
                        : "No orders match your filters."
                    }
                  />
                )}
                {pageItems.map((order) => {
                  const customer = customerOf(order);
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-semibold tracking-tight">
                        {orderCode(order)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                            {(customer?.username ?? "C")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium">
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
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ORDER_STYLES[order.orderStatus]}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${ORDER_DOT[order.orderStatus]}`}
                          />
                          {cap(order.orderStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${PAYMENT_STYLES[order.paymentStatus]}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${PAYMENT_DOT[order.paymentStatus]}`}
                          />
                          {cap(order.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold tabular-nums">
                        {money(order.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg border bg-background hover:bg-muted"
                              aria-label="Order actions"
                            >
                              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => setDetailId(order._id)}
                            >
                              <Eye className="mr-2 h-4 w-4" /> View details
                            </DropdownMenuItem>
                            {ORDER_STATUSES.filter(
                              (s) =>
                                s !== order.orderStatus && s !== "cancelled",
                            ).map((s) => (
                              <DropdownMenuItem
                                key={s}
                                className="cursor-pointer"
                                onClick={() => setStatus(order, s)}
                              >
                                <Truck className="mr-2 h-4 w-4" /> Mark {s}
                              </DropdownMenuItem>
                            ))}
                            {order.orderStatus !== "cancelled" && (
                              <DropdownMenuItem
                                className="cursor-pointer text-amber-600 focus:text-amber-600"
                                onClick={() => setStatus(order, "cancelled")}
                              >
                                <XCircle className="mr-2 h-4 w-4" /> Cancel
                                order
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="cursor-pointer text-red-600 focus:text-red-600"
                              onClick={() => setToDelete(order)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
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

      {/* ── Inline detail slide-over panel ───────────────────── */}
      {detail && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setDetailId(null)}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            className="relative flex h-full w-full max-w-xl flex-col border-l bg-background shadow-xl"
          >
            {/* Header */}
            <header className="flex items-start justify-between gap-3 border-b bg-muted/20 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Order details
                </p>
                <h2 className="mt-0.5 flex items-center gap-2 text-base font-semibold">
                  <span className="font-mono">{orderCode(detail)}</span>
                  <button
                    type="button"
                    onClick={() => copyCode(orderCode(detail))}
                    className="rounded p-0.5 text-muted-foreground opacity-60 transition-opacity hover:bg-muted hover:opacity-100"
                    aria-label="Copy order code"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${ORDER_STYLES[detail.orderStatus]}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${ORDER_DOT[detail.orderStatus]}`}
                    />
                    {cap(detail.orderStatus)}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${PAYMENT_STYLES[detail.paymentStatus]}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${PAYMENT_DOT[detail.paymentStatus]}`}
                    />
                    {cap(detail.paymentStatus)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailId(null)}
                  className="rounded-md p-1 opacity-60 transition-opacity hover:bg-muted hover:opacity-100"
                  aria-label="Close panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            {/* Scrollable body */}
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              {/* Customer card */}
              <section className="rounded-lg border bg-card p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {(detailCustomer?.username ?? "C").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {detailCustomer?.username ?? "Customer"}
                    </p>
                    {detailCustomer?.email && (
                      <p className="truncate text-xs text-muted-foreground">
                        {detailCustomer.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 border-t pt-3 text-xs">
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                      Placed
                    </span>
                    <span className="font-medium">
                      {formatOrderDate(detail.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
                      Payment method
                    </span>
                    <span className="font-medium capitalize">
                      {detail.paymentMethod}
                    </span>
                  </div>
                </div>
              </section>

              {/* Status controls */}
              <section>
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Update status
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1">
                    <span className="block text-xs font-medium">
                      Order status
                    </span>
                    <select
                      aria-label="Order status"
                      disabled={isWorking}
                      className={selectCls}
                      value={detail.orderStatus}
                      onChange={(e) =>
                        setStatus(detail, e.target.value as OrderStatus)
                      }
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {cap(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs font-medium">
                      Payment status
                    </span>
                    <select
                      aria-label="Payment status"
                      disabled={isWorking}
                      className={selectCls}
                      value={detail.paymentStatus}
                      onChange={(e) =>
                        setPayment(detail, e.target.value as PaymentStatus)
                      }
                    >
                      {PAYMENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {cap(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              {/* Items */}
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Items ({detail.items.length})
                  </h4>
                </div>
                <div className="divide-y rounded-lg border bg-card">
                  {detail.items.map((item, i) => {
                    const product = getProductFromRef(item.productId);
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 p-3"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
                          {product?.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {product?.name ?? "Product"}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {money(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold tabular-nums">
                          {money(item.price * item.quantity)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* Price breakdown */}
              <section className="rounded-lg border bg-card p-4">
                <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Summary
                </h4>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotal</dt>
                    <dd className="tabular-nums">{money(itemSubtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="tabular-nums">{money(shippingFee)}</dd>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-base font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums text-blue-600">
                      {money(detail.totalAmount)}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* Shipping address */}
              <section className="rounded-lg border bg-card p-4">
                <h4 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> Shipping address
                </h4>
                <p className="text-sm leading-relaxed">
                  {detail.shippingAddress.street}
                  <br />
                  {detail.shippingAddress.city}, {detail.shippingAddress.state}{" "}
                  {detail.shippingAddress.postalCode}
                  <br />
                  {detail.shippingAddress.country}
                </p>
              </section>

              {/* Timeline */}
              <section>
                <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Progress
                </h4>
                <ol className="relative space-y-3 border-l pl-4">
                  {timeline.map((step, i) => {
                    const Icon = step.icon;
                    return (
                      <li key={i} className="relative">
                        <span
                          className={`absolute -left-[1.4rem] top-0.5 flex h-3 w-3 items-center justify-center rounded-full ring-2 ring-background ${step.tone}`}
                        />
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`flex items-center gap-1.5 text-sm ${
                              step.done
                                ? "font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {step.label}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {step.at}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </section>
            </div>

            {/* Footer actions */}
            <footer className="mt-auto flex flex-col-reverse gap-2 border-t bg-muted/20 px-5 py-3 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setToCancel(detail)}
                disabled={isWorking || detail.orderStatus === "cancelled"}
              >
                <XCircle className="h-4 w-4" /> Cancel order
              </Button>
              <Button
                variant="outline"
                className="gap-2 text-red-600 hover:text-red-700"
                onClick={() => {
                  setDetailId(null);
                  setToDelete(detail);
                }}
                disabled={isWorking}
              >
                <Trash2 className="h-4 w-4" /> Delete order
              </Button>
            </footer>
          </motion.aside>
        </div>
      )}

      <ConfirmDialog
        open={!!toCancel}
        onOpenChange={(v) => !v && setToCancel(null)}
        title="Cancel order"
        description={`Order ${toCancel ? orderCode(toCancel) : ""} will be marked as cancelled and excluded from revenue.`}
        confirmLabel="Cancel order"
        tone="danger"
        isLoading={isWorking}
        onConfirm={async () => {
          if (!toCancel) return;
          const ok = await run(
            () => orderService.updateStatus(toCancel._id, "cancelled"),
            "Order cancelled.",
            "Failed to cancel order.",
          );
          if (ok) setToCancel(null);
        }}
      />
      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Delete order"
        description={`Order ${toDelete ? orderCode(toDelete) : ""} will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        tone="danger"
        isLoading={isWorking}
        onConfirm={async () => {
          if (!toDelete) return;
          const ok = await run(
            () => orderService.remove(toDelete._id),
            "Order deleted.",
            "Failed to delete order.",
          );
          if (ok) setToDelete(null);
        }}
      />
    </PageTransition>
  );
}
