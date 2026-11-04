import type { ApiPermission } from "../../types/api";

/** Enabling create/update/delete auto-enables view; disabling view clears the module. */
export function togglePermission(
  selected: Set<string>,
  perm: ApiPermission,
  all: ApiPermission[],
) {
  const next = new Set(selected);
  const inModule = all.filter((p) => p.module === perm.module);
  if (next.has(perm._id)) {
    next.delete(perm._id);
    if (perm.action === "view") inModule.forEach((p) => next.delete(p._id));
  } else {
    next.add(perm._id);
    if (perm.action !== "view") {
      const view = inModule.find((p) => p.action === "view");
      if (view) next.add(view._id);
    }
  }
  return next;
}
