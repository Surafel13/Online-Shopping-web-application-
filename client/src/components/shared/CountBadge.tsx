import { cn } from "../../lib/utils";

interface CountBadgeProps {
  count: number;
  tone?: "primary" | "danger";
  className?: string;
}

/** Renders nothing when count is 0. Position it with `className`. */
export function CountBadge({
  count,
  tone = "primary",
  className,
}: CountBadgeProps) {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none",
        tone === "danger"
          ? "bg-red-500 text-white"
          : "bg-primary text-primary-foreground",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
