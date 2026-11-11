import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronRight,
  HelpCircle,
  LifeBuoy,
  MessageSquarePlus,
  Search,
  Ticket,
} from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { Button } from "../../components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { supportService } from "../../services";
import { getApiErrorMessage } from "../../lib/errors";
import { useAppSelector } from "../../hooks/useRedux";
import { cn } from "../../lib/utils";
import type { Faq } from "../../types/support";

export function SupportCenter() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let current = true;
    supportService
      .faqs()
      .then((data) => current && setFaqs(data))
      .catch(
        (err: unknown) =>
          current && setError(getApiErrorMessage(err, "Unable to load FAQs.")),
      )
      .finally(() => current && setIsLoading(false));
    return () => {
      current = false;
    };
  }, []);

  const categories = useMemo(
    () => ["All", ...new Set(faqs.map((f) => f.category))],
    [faqs],
  );

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return faqs.filter(
      (f) =>
        (category === "All" || f.category === category) &&
        (f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)),
    );
  }, [faqs, search, category]);

  const ctaTo = (path: string) => (isAuthenticated ? path : "/login");
  const ctaState = (path: string) =>
    isAuthenticated ? undefined : { from: path };

  return (
    <PageTransition>
      {/* Integrated Hero Section */}
      <div className="border-b border-border/40 bg-gradient-to-b from-muted/50 via-muted/20 to-background py-10 sm:py-14">
        <div className="container mx-auto max-w-screen-xl px-4 sm:px-6">
          <nav
            aria-label="Breadcrumb"
            className="mb-4 flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm"
          >
            <Link to="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            <span className="font-semibold text-foreground">
              Help & Support
            </span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Header Content & Search */}
            <div className="lg:col-span-7">
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <LifeBuoy className="h-3.5 w-3.5" /> Support Center
              </div>
              <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                How can we help today?
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg">
                Search answers across our knowledge base or quickly get in touch
                with our support team.
              </p>

              <div className="relative mt-6 max-w-lg">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for answers, orders, or policies..."
                  aria-label="Search FAQs"
                  className="h-12 w-full rounded-xl border border-border/70 bg-card pl-11 pr-4 text-sm shadow-xs transition-all focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            {/* Quick Action Hub (Replaces standalone cards) */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/60 p-3 backdrop-blur-xs lg:col-span-5">
              <Link
                to={ctaTo("/support/tickets/new")}
                state={ctaState("/support/tickets/new")}
                className="group flex items-center justify-between rounded-xl p-3.5 transition-colors hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-900/30">
                    <MessageSquarePlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Contact Support
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Open a ticket for quick assistance
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
              </Link>

              <div className="h-px bg-border/50" />

              <Link
                to={ctaTo("/support/tickets")}
                state={ctaState("/support/tickets")}
                className="group flex items-center justify-between rounded-xl p-3.5 transition-colors hover:bg-muted/60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-900/30">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      My Tickets
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Track existing support requests
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-indigo-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Knowledge Base Section */}
      <div className="container mx-auto max-w-screen-xl px-4 py-10 sm:px-6">
        {/* Category Selector Bar */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((name) => (
              <button
                key={name}
                onClick={() => setCategory(name)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1 text-xs font-medium transition-all",
                  category === name
                    ? "border-blue-600 bg-blue-600 text-white shadow-xs"
                    : "border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Content Stream */}
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-xl bg-muted/60"
              />
            ))}
          </div>
        ) : error ? (
          <p
            className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-sm font-medium text-red-600"
            role="alert"
          >
            {error}
          </p>
        ) : visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-muted/10">
            <p className="font-semibold text-foreground">
              No matching answers found
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Can't find what you need? Our team is available to assist you.
            </p>
            <Link
              to={ctaTo("/support/tickets/new")}
              state={ctaState("/support/tickets/new")}
            >
              <Button className="mt-5 rounded-xl bg-blue-600 hover:bg-blue-700">
                Contact Support
              </Button>
            </Link>
          </div>
        ) : (
          <Accordion
            type="single"
            collapsible
            className="rounded-2xl border border-border/70 bg-card px-6 shadow-xs"
          >
            {visible.map((faq) => (
              <AccordionItem
                key={faq._id}
                value={faq._id}
                className="border-border/50 py-1"
              >
                <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                  <span className="flex flex-wrap items-center gap-2 pr-4">
                    {faq.question}
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {faq.category}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-xs leading-relaxed text-muted-foreground sm:text-sm pt-1 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </PageTransition>
  );
}
