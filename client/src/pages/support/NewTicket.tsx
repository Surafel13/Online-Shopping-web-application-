import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, LifeBuoy, Sparkles } from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { AttachmentPicker } from "../../features/support/AttachmentPicker";
import { CATEGORIES, PRIORITY_META } from "../../features/support/constants";
import { orderService, supportService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { formatOrderDate } from "../../lib/mappers";
import { useAppDispatch } from "../../hooks/useRedux";
import { showError, showSuccess } from "../../redux/slices/uiSlice";
import type { ApiOrder } from "../../types/api";
import type { TicketCategory } from "../../types/support";

type CustomerPriority = "low" | "medium" | "high";
const selectCls =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function NewTicket() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [form, setForm] = useState({
    subject: "",
    category: (params.get("order") ? "order" : "") as TicketCategory | "",
    priority: "medium" as CustomerPriority,
    orderId: params.get("order") ?? "",
    description: "",
  });
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let current = true;
    orderService
      .getMyOrders()
      .then((data) => current && setOrders(data))
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, []);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.subject.trim().length < 5)
      next.subject = "Subject must be at least 5 characters.";
    if (!form.category) next.category = "Choose a category.";
    if (form.description.trim().length < 10)
      next.description = "Describe your issue in at least 10 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate() || !form.category) return;
    setIsSubmitting(true);
    try {
      const ticket = await supportService.createTicket(
        {
          subject: form.subject.trim(),
          category: form.category,
          priority: form.priority,
          description: form.description.trim(),
          ...(form.orderId ? { orderId: form.orderId } : {}),
        },
        files,
      );
      dispatch(showSuccess(`Ticket ${ticket.ticketNumber} created.`));
      navigate(`/support/tickets/${ticket._id}`);
    } catch (error) {
      dispatch(
        showError(getApiErrorMessage(error, "Unable to create your ticket.")),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <div className="container mx-auto max-w-screen-md px-4 py-10 sm:px-6">
        <Link
          to="/support/tickets"
          className="mb-6 inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to my tickets
        </Link>

        {/* Header Section */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <LifeBuoy className="h-3.5 w-3.5" /> Support Center
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Contact support
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us what happened and our team will reply as soon as possible.
            </p>
          </div>
        </div>

        {/* Main Form Container */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-6 rounded-2xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
        >
          {/* Subject Field */}
          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-medium">
              Subject *
            </label>
            <Input
              id="subject"
              maxLength={120}
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
              placeholder="Short summary of your issue"
              className="h-11 rounded-lg"
            />
            {errors.subject && (
              <p className="mt-1.5 text-xs font-medium text-red-600">
                {errors.subject}
              </p>
            )}
          </div>

          {/* Category & Priority Grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium"
              >
                Category *
              </label>
              <select
                id="category"
                className={selectCls}
                value={form.category}
                onChange={(e) =>
                  set("category", e.target.value as TicketCategory)
                }
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.category}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="priority"
                className="mb-2 block text-sm font-medium"
              >
                Priority
              </label>
              <select
                id="priority"
                className={selectCls}
                value={form.priority}
                onChange={(e) =>
                  set("priority", e.target.value as CustomerPriority)
                }
              >
                {(["low", "medium", "high"] as const).map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_META[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Related Order Field */}
          <div>
            <label htmlFor="order" className="mb-2 block text-sm font-medium">
              Related order{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <select
              id="order"
              className={selectCls}
              value={form.orderId}
              onChange={(e) => set("orderId", e.target.value)}
            >
              <option value="">Not about a specific order</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  #NEX-{o._id.slice(-6).toUpperCase()} ·{" "}
                  {formatOrderDate(o.createdAt)} · ${o.totalAmount.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Describe your issue *
            </label>
            <textarea
              id="description"
              rows={6}
              maxLength={5000}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Include any details that will help us resolve this quickly."
              className="w-full resize-y rounded-lg border border-input bg-background p-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-1.5 flex justify-between text-xs">
              <span className="font-medium text-red-600">
                {errors.description}
              </span>
              <span className="text-muted-foreground">
                {form.description.length}/5000
              </span>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-4">
            <span className="mb-2 block text-sm font-medium">Attachments</span>
            <AttachmentPicker
              files={files}
              onChange={setFiles}
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full rounded-xl bg-blue-600 font-medium text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 animate-spin" /> Submitting
                ticket...
              </span>
            ) : (
              "Submit ticket"
            )}
          </Button>
        </form>
      </div>
    </PageTransition>
  );
}
