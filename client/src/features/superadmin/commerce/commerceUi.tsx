import type { ReactNode } from "react";
import { AlertCircle, RefreshCw, type LucideIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="bg-card border rounded-xl p-5 shadow-sm flex items-center gap-4">
      <div
        className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl font-bold tracking-tight truncate">{value}</p>
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
      </div>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="max-w-md mx-auto py-24 text-center">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground mb-5">{message}</p>
      <Button onClick={onRetry} className="bg-blue-600 hover:bg-blue-700">
        <RefreshCw className="h-4 w-4 mr-2" /> Try again
      </Button>
    </div>
  );
}

export function EmptyRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-12 text-center text-muted-foreground"
      >
        {text}
      </td>
    </tr>
  );
}
