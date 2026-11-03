import { Search } from "lucide-react";
import { cn } from "../../lib/utils";

export function HeaderSearch({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <input
        type="search"
        aria-label="Search products"
        placeholder="Search products, brands..."
        className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 pl-8 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
