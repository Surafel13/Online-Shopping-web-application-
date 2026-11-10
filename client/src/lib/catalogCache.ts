import { categoryService } from "../services/categoryService";
import { buildCategoryMap } from "./mappers";

const TTL_MS = 5 * 60 * 1000;
let cache: { at: number; promise: Promise<Map<string, string>> } | null = null;

/** Category id -> name map, cached and de-duplicated so slices don't refetch it on every mutation. */
export function getCategoryMap(force = false): Promise<Map<string, string>> {
  const now = Date.now();
  if (!force && cache && now - cache.at < TTL_MS) return cache.promise;

  const promise = categoryService.getAll().then(buildCategoryMap);
  cache = { at: now, promise };
  promise.catch(() => {
    if (cache?.promise === promise) cache = null;
  });
  return promise;
}
