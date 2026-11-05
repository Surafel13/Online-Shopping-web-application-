import { useState } from "react";

export function usePagination<T>(
  items: T[],
  pageSize: number,
  resetKey: string,
) {
  const [state, setState] = useState({ page: 1, key: resetKey });
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const page = state.key === resetKey ? Math.min(state.page, pageCount) : 1;
  const setPage = (next: number) => setState({ page: next, key: resetKey });
  const pageItems = items.slice((page - 1) * pageSize, page * pageSize);
  return { page, pageCount, setPage, pageItems, total: items.length };
}
