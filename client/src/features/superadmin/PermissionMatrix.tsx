import type { ApiPermission } from "../../types/api";
import { PERMISSION_MODULES, STANDARD_ACTIONS } from "../../lib/permissions";
import { cn } from "../../lib/utils";

interface Props {
  permissions: ApiPermission[];
  selected: Set<string>;
  inherited?: Set<string>;
  disabled?: boolean;
  onToggle?: (permission: ApiPermission) => void;
}


export function PermissionMatrix({
  permissions,
  selected,
  inherited,
  disabled,
  onToggle,
}: Props) {
  const box = (perm?: ApiPermission) => {
    if (!perm) return <span className="text-muted-foreground">—</span>;
    const isInherited = inherited?.has(perm._id) ?? false;
    return (
      <input
        type="checkbox"
        aria-label={perm.code}
        title={isInherited ? "Inherited from role" : perm.name}
        checked={selected.has(perm._id) || isInherited}
        disabled={disabled || isInherited}
        onChange={() => onToggle?.(perm)}
        className={cn(
          "h-4 w-4 accent-blue-600",
          (disabled || isInherited) && "opacity-60",
        )}
      />
    );
  };

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left">Module</th>
            {STANDARD_ACTIONS.map((a) => (
              <th key={a} className="px-3 py-3 text-center">
                {a}
              </th>
            ))}
            <th className="px-4 py-3 text-left">Custom</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {PERMISSION_MODULES.map((m) => {
            const modulePerms = permissions.filter((p) => p.module === m.key);
            const custom = modulePerms.filter(
              (p) =>
                !STANDARD_ACTIONS.includes(
                  p.action as (typeof STANDARD_ACTIONS)[number],
                ),
            );
            return (
              <tr key={m.key}>
                <td className="px-4 py-3 font-medium">{m.label}</td>
                {STANDARD_ACTIONS.map((a) => (
                  <td key={a} className="px-3 py-3 text-center">
                    {box(modulePerms.find((p) => p.action === a))}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {custom.length === 0 && (
                      <span className="text-muted-foreground">—</span>
                    )}
                    {custom.map((p) => (
                      <label
                        key={p._id}
                        className="inline-flex items-center gap-1.5 text-xs"
                      >
                        {box(p)} {p.action}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

