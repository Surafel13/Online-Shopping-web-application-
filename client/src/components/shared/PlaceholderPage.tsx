import { Link } from "react-router-dom";
import { ChevronRight, Construction, type LucideIcon } from "lucide-react";
import { PageTransition } from "../layout/PageTransition";
import { Button } from "../ui/button";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({
  title,
  description,
  icon: Icon,
}: PlaceholderPageProps) {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-screen-xl px-4 py-12 sm:px-6 sm:py-20">
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm"
        >
          <Link to="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
          <span className="font-semibold text-foreground">{title}</span>
        </nav>

        <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-dashed bg-card px-6 py-16 text-center shadow-sm">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <Icon className="h-6 w-6" />
          </div>
          <h1 className="mb-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
          <span className="mb-8 inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
            <Construction className="h-3.5 w-3.5" /> Coming soon
          </span>
          <Link to="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
