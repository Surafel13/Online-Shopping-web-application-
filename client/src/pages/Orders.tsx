import { useEffect, useMemo, useState } from "react";
import { PageTransition } from "../components/layout/PageTransition";
import { Button } from "../components/ui/button";
import {
  Search,
  MapPin,
  Truck,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  PackageOpen,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "../components/ui/input";
import { orderService } from "../services";
import {
  formatOrderDate,
  getProductFromRef,
  mapOrderStatusToUi,
  mapPaymentStatusToUi,
} from "../lib/mappers";
import type { ApiOrder } from "../types/api";

const FILTERS = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; border: string; icon: React.ReactNode }
> = {
  DELIVERED: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/20",
    icon: <CheckCircle2 className="h-3.5 w-3.5 mr-1" />,
  },
  SHIPPED: {
    bg: "bg-blue-500/10 dark:bg-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/20",
    icon: <Truck className="h-3.5 w-3.5 mr-1" />,
  },
  PROCESSING: {
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
    icon: <Clock className="h-3.5 w-3.5 mr-1" />,
  },
  PENDING: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    border: "border-border/60",
    icon: <Clock className="h-3.5 w-3.5 mr-1" />,
  },
  CANCELLED: {
    bg: "bg-red-500/10 dark:bg-red-500/20",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/20",
    icon: <AlertCircle className="h-3.5 w-3.5 mr-1" />,
  },
};

function mapOrderForUi(order: ApiOrder) {
  const address = order.shippingAddress;
  return {
    id: `#NEX-${order._id.slice(-6).toUpperCase()}`,
    date: formatOrderDate(order.createdAt),
    total: order.totalAmount,
    paymentStatus: mapPaymentStatusToUi(order.paymentStatus),
    status: mapOrderStatusToUi(order.orderStatus),
    address: `${address.street}, ${address.city}, ${address.state} ${address.postalCode}`,
    tracking: "",
    items: order.items.map((item) => {
      const product = getProductFromRef(item.productId);
      return {
        name: product?.name || "Product",
        variant: "Default",
        price: item.price,
        qty: item.quantity,
        image:
          product?.images?.[0] ||
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop",
      };
    }),
  };
}

export function Orders() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [orders, setOrders] = useState<ReturnType<typeof mapOrderForUi>[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then((data) => setOrders(data.map(mapOrderForUi)))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesFilter =
        activeFilter === "All" || order.status === activeFilter.toUpperCase();
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

  return (
    <PageTransition>
      <div className="bg-gradient-to-b from-muted/30 to-background min-h-screen pb-24 pt-12 selection:bg-blue-500/20">
        <div className="container px-4 sm:px-6 max-w-screen-xl mx-auto">
          {/* Header Section */}
          <div className="mb-10 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-foreground">
              My Orders
            </h1>
            <p className="text-muted-foreground text-base leading-relaxed">
              Check the status of recent orders, track shipments, manage
              returns, and discover similar products.
            </p>
          </div>

          {/* Controls Bar: Filters + Search */}
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 mb-10 bg-card border border-border/60 p-3 sm:p-4 rounded-2xl shadow-sm">
            {/* Filter Buttons */}
            <div className="flex bg-muted/60 rounded-xl p-1.5 border border-border/40 overflow-x-auto w-full lg:w-auto scrollbar-none">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    activeFilter === filter
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border/80 rounded-xl h-11 text-sm shadow-sm focus-visible:ring-blue-600"
              />
            </div>
          </div>

          {/* Orders List / Loading State */}
          {isLoading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-3xl bg-muted animate-pulse border border-border/40"
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const statusCfg =
                  STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;

                return (
                  <div
                    key={order.id}
                    className="bg-card border border-border/60 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md"
                  >
                    {/* Order Metadata Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8 bg-muted/20 border-b border-border/60">
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-6 sm:gap-12">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                            Order ID
                          </span>
                          <span className="font-extrabold text-foreground text-sm sm:text-base">
                            {order.id}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                            Date Placed
                          </span>
                          <span className="font-semibold text-foreground text-sm sm:text-base">
                            {order.date}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                            Total Amount
                          </span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400 text-sm sm:text-base">
                            ${order.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em]">
                            Payment
                          </span>
                          <span className="bg-muted text-foreground text-xs font-semibold px-3 py-1 rounded-full inline-flex self-start mt-0.5 border border-border/50">
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold border shadow-sm ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {statusCfg.icon}
                        {order.status}
                      </div>
                    </div>

                    {/* Order Items & Actions Body */}
                    <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
                      {/* Items List */}
                      <div className="flex-1 space-y-4 w-full">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex gap-4 items-center p-3 rounded-2xl bg-muted/40 border border-border/40"
                          >
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl border border-border/60 overflow-hidden shrink-0 bg-background shadow-sm">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover object-center"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm sm:text-base text-foreground truncate mb-1">
                                {item.name}
                              </h4>
                              <p className="text-xs text-muted-foreground font-medium">
                                {item.variant} · Qty: {item.qty}
                              </p>
                            </div>
                            <span className="font-extrabold text-sm sm:text-base text-foreground pl-4">
                              ${item.price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Side Panel: Shipping & Quick Buttons */}
                      <div className="lg:w-80 shrink-0 flex flex-col gap-4 w-full">
                        <div className="bg-muted/50 rounded-2xl p-5 border border-border/60">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mb-2">
                            <MapPin className="h-4 w-4 text-blue-600 shrink-0" />
                            <span>Shipping Address</span>
                          </div>
                          <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed pl-6 font-medium">
                            {order.address}
                          </p>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5">
                          <Button
                            variant="outline"
                            className="w-full justify-center gap-2 h-11 rounded-xl border-border/80 font-semibold hover:bg-muted/80 transition-colors"
                          >
                            <RefreshCw className="h-4 w-4 text-blue-600" /> Buy
                            Again
                          </Button>
                          <Link to="/collections" className="w-full">
                            <Button
                              variant="outline"
                              className="w-full justify-center gap-2 h-11 rounded-xl border-border/80 font-semibold hover:bg-muted/80 transition-colors"
                            >
                              View Invoice{" "}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredOrders.length === 0 && (
                <div className="text-center py-24 bg-card border border-border/60 rounded-3xl p-8 shadow-sm">
                  <div className="w-16 h-16 bg-muted/60 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                    <PackageOpen className="h-8 w-8 opacity-40" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">No orders found</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                    No orders match your selected filter or search query.
                    Explore our collections to start shopping.
                  </p>
                  <Link to="/collections">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 h-12 rounded-xl shadow-lg shadow-blue-600/20">
                      Explore Collections{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
