import { Construction } from "lucide-react";
import { PageTransition } from "../../components/layout/PageTransition";
import { ADMIN_NAV } from "../../features/admin/navigation";

export function AdminSectionPlaceholder({ slug }: { slug: string }) {
  const item = ADMIN_NAV.find((entry) => entry.slug === slug);
  if (!item) return null;
  const Icon = item.icon;

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {item.description}
          </p>
        </div>

        <div className="bg-card border border-dashed rounded-xl py-24 px-6 flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">
            This section is a placeholder. Its management tools will be added
            here.
          </p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full border">
            <Construction className="h-3.5 w-3.5" /> Coming soon
          </span>
        </div>
      </div>
    </PageTransition>
  );
}
