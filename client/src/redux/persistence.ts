import { MAX_QUANTITY_PER_ITEM, type CartItem } from './slices/cartSlice';
import type { AppNotification } from './slices/notificationSlice';
import type { OrderStatus } from '../types/api';

/**
 * Versioned, per-user localStorage persistence. Every read is validated, so corrupted or
 * outdated data is ignored instead of crashing the app. Bump VERSION to invalidate old data.
 */
const VERSION = 1;
const ORDER_STATUSES: readonly string[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export type PersistScope = 'cart' | 'notifications';
export const storageKey = (scope: PersistScope, userId: string) =>
  `nexa:${scope}:v${VERSION}:${userId}`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
const isNonNegativeInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;

function readEnvelope(key: string): Record<string, unknown> | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) && parsed.v === VERSION ? parsed : null;
  } catch {
    return null;
  }
}

function writeEnvelope(key: string, payload: Record<string, unknown>) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ v: VERSION, ...payload }));
  } catch {
    // Storage full or unavailable (private mode): the app keeps working in memory.
  }
}

// ---------------- cart ----------------
const isCartItem = (value: unknown): value is CartItem =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.image === 'string' &&
  typeof value.price === 'number' &&
  Number.isFinite(value.price) &&
  value.price >= 0 &&
  isNonNegativeInt(value.stock) &&
  isNonNegativeInt(value.quantity) &&
  value.quantity >= 1;

export function loadCart(userId: string): CartItem[] {
  const data = readEnvelope(storageKey('cart', userId));
  if (!data || !Array.isArray(data.items)) return [];

  const seen = new Set<string>();
  const items: CartItem[] = [];
  for (const entry of data.items as unknown[]) {
    if (!isCartItem(entry) || seen.has(entry.id)) continue;
    seen.add(entry.id);
    items.push({
      id: entry.id,
      name: entry.name,
      price: entry.price,
      image: entry.image,
      stock: entry.stock,
      quantity: Math.min(entry.quantity, MAX_QUANTITY_PER_ITEM),
    });
  }
  return items;
}

export function saveCart(userId: string, items: CartItem[]) {
  writeEnvelope(storageKey('cart', userId), { items });
}

// ---------------- notifications ----------------
export interface StoredNotifications {
  items: AppNotification[];
  knownOrderStatuses: Record<string, OrderStatus>;
  seeded: boolean;
}

const isNotification = (value: unknown): value is AppNotification =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  (value.type === 'order' || value.type === 'system') &&
  typeof value.title === 'string' &&
  typeof value.message === 'string' &&
  typeof value.createdAt === 'string' &&
  typeof value.read === 'boolean';

export function loadNotifications(userId: string): StoredNotifications {
  const empty: StoredNotifications = { items: [], knownOrderStatuses: {}, seeded: false };
  const data = readEnvelope(storageKey('notifications', userId));
  if (!data) return empty;

  const items = Array.isArray(data.items) ? (data.items as unknown[]).filter(isNotification) : [];
  const known: Record<string, OrderStatus> = {};
  if (isRecord(data.knownOrderStatuses)) {
    for (const [id, status] of Object.entries(data.knownOrderStatuses)) {
      if (typeof status === 'string' && ORDER_STATUSES.includes(status)) {
        known[id] = status as OrderStatus;
      }
    }
  }
  return { items, knownOrderStatuses: known, seeded: data.seeded === true };
}

export function saveNotifications(userId: string, value: StoredNotifications) {
  writeEnvelope(storageKey('notifications', userId), { ...value });
}
