import { createHash } from "node:crypto";

export interface CachedPdf {
  buf: Uint8Array;
  etag: string;
  filename: string;
  size: number;
  updatedAt: number;
}

interface CacheEntry {
  data: CachedPdf;
  lastAccess: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_ENTRIES = 40;
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

function makeKey(leadId: number, stamp?: number | Date | string | null): string {
  if (stamp instanceof Date) return `${leadId}:${stamp.getTime()}`;
  if (typeof stamp === "number" || typeof stamp === "string") {
    return `${leadId}:${stamp}`;
  }
  return `${leadId}:0`;
}

function evictIfNeeded() {
  if (cache.size <= MAX_ENTRIES) return;
  const entries = Array.from(cache.entries()).sort(
    (a, b) => a[1].lastAccess - b[1].lastAccess,
  );
  const toRemove = entries.slice(0, cache.size - MAX_ENTRIES);
  for (const [key] of toRemove) {
    cache.delete(key);
  }
}

export function getCachedPdf(
  leadId: number,
  stamp?: number | Date | string | null,
): CachedPdf | null {
  const key = makeKey(leadId, stamp);
  const entry = cache.get(key);
  if (!entry) return null;
  // Check TTL
  if (Date.now() - entry.data.updatedAt > DEFAULT_TTL && entry.data.updatedAt > 0) {
    cache.delete(key);
    return null;
  }
  entry.lastAccess = Date.now();
  return entry.data;
}

export function setCachedPdf(
  leadId: number,
  stamp: number | Date | string | null | undefined,
  buf: Uint8Array,
  filename: string,
): CachedPdf {
  const key = makeKey(leadId, stamp);
  const etag = `"${createHash("sha256").update(buf).digest("hex")}"`;
  const data: CachedPdf = {
    buf,
    etag,
    filename,
    size: buf.byteLength,
    updatedAt: Date.now(),
  };
  cache.set(key, { data, lastAccess: Date.now() });
  evictIfNeeded();
  return data;
}

export function invalidatePdf(leadId: number) {
  for (const key of cache.keys()) {
    if (key.startsWith(`${leadId}:`)) {
      cache.delete(key);
    }
  }
}
