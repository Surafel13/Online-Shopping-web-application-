type Handler = (data: unknown) => void;
const listeners = new Map<string, Set<Handler>>();

export function emitSupportEvent(event: string, data: unknown) {
  listeners.get(event)?.forEach((handler) => handler(data));
}

/** Subscribe to a realtime event. Returns an unsubscribe function. */
export function onSupportEvent<T = unknown>(event: string, handler: (data: T) => void) {
  const set = listeners.get(event) ?? new Set<Handler>();
  const wrapped = handler as Handler;
  set.add(wrapped);
  listeners.set(event, set);
  return () => {
    set.delete(wrapped);
  };
}
