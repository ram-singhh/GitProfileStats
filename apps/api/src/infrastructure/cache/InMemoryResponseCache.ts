import { injectable } from 'tsyringe';
import type { IResponseCache } from './IResponseCache.js';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const MAX_CACHE_SIZE = 1000;

@injectable()
export class InMemoryResponseCache implements IResponseCache {
  private readonly cache = new Map<string, CacheEntry>();

  constructor() {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (entry.expiresAt <= now) {
          this.cache.delete(key);
        }
      }
    }, 60000);

    cleanupInterval.unref();
  }

  public async get<T>(key: string): Promise<T | undefined> {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  public async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    if (this.cache.size >= MAX_CACHE_SIZE && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  public async deleteByPattern(pattern: string): Promise<void> {
    for (const key of Array.from(this.cache.keys())) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  public clear(): void {
    this.cache.clear();
  }
}
