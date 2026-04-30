// ─────────────────────────────────────────────────────────────────────────────
// Simple in-memory cache utility
// ─────────────────────────────────────────────────────────────────────────────
// Provides `cachedFetch` for deduplicating and caching async fetch results,
// and `invalidateCache` for manual cache busting.
//
// This is adequate for single-server deploys. For multi-instance setups,
// swap this out for Redis or similar.
// ─────────────────────────────────────────────────────────────────────────────

interface CacheEntry<T = unknown> {
  data: T;
  fetchedAt: number;
  ttl: number;
}

const caches = new Map<string, CacheEntry>();

/**
 * Fetch data with caching. If a fresh cache entry exists for `key`, returns it
 * immediately. Otherwise calls `fetcher()`, caches the result, and returns it.
 *
 * @param key   — Unique cache key (e.g. "platform-settings")
 * @param fetcher — Async function that produces the data
 * @param ttlMs  — Time-to-live in milliseconds (default 5 min)
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 5 * 60 * 1000, // 5 minutes
): Promise<T> {
  const now = Date.now();
  const cached = caches.get(key);

  if (cached && now - cached.fetchedAt < cached.ttl) {
    return cached.data as T;
  }

  const data = await fetcher();
  caches.set(key, { data, fetchedAt: now, ttl: ttlMs });
  return data;
}

/**
 * Invalidate cache entries. Pass a `key` to delete one entry, or call
 * with no arguments to clear the entire cache.
 */
export function invalidateCache(key?: string): void {
  if (key) {
    caches.delete(key);
  } else {
    caches.clear();
  }
}
