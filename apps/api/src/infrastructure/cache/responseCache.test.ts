import type { Redis } from '@upstash/redis';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { InMemoryResponseCache } from './InMemoryResponseCache.js';
import { UpstashResponseCache } from './UpstashResponseCache.js';

describe('UpstashResponseCache', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('gets cached values and stores them with a native Redis TTL', async () => {
    const redis = {
      get: vi.fn().mockResolvedValue({ result: 'cached' }),
      set: vi.fn().mockResolvedValue('OK'),
    } as unknown as Redis;
    const cache = new UpstashResponseCache(redis);

    await cache.set('github-key', { result: 'fresh' }, 1500);
    const value = await cache.get<{ result: string }>('github-key');

    expect(redis.set).toHaveBeenCalledWith('github-key', { result: 'fresh' }, { ex: 2 });
    expect(redis.get).toHaveBeenCalledWith('github-key');
    expect(value).toEqual({ result: 'cached' });
  });

  it('normalizes a Redis expiration miss to undefined', async () => {
    const redis = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn(),
    } as unknown as Redis;
    const cache = new UpstashResponseCache(redis);

    await expect(cache.get('expired-key')).resolves.toBeUndefined();
  });

  it('deletes specific keys and pattern keys in Redis', async () => {
    const redis = {
      del: vi.fn().mockResolvedValue(1),
      keys: vi.fn().mockResolvedValue(['key-1', 'key-2']),
    } as unknown as Redis;
    const cache = new UpstashResponseCache(redis);

    await cache.delete('specific-key');
    expect(redis.del).toHaveBeenCalledWith('specific-key');

    await cache.deleteByPattern('user=123');
    expect(redis.keys).toHaveBeenCalledWith('*user=123*');
    expect(redis.del).toHaveBeenCalledWith('key-1', 'key-2');
  });
});

describe('InMemoryResponseCache fallback', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('expires entries locally when Redis configuration is absent', async () => {
    vi.useFakeTimers();
    const cache = new InMemoryResponseCache();

    await cache.set('local-key', { result: 'cached' }, 1000);
    await expect(cache.get('local-key')).resolves.toEqual({ result: 'cached' });

    vi.advanceTimersByTime(1001);
    await expect(cache.get('local-key')).resolves.toBeUndefined();
  });

  it('deletes by key and deletes by pattern without deleting unrelated keys', async () => {
    const cache = new InMemoryResponseCache();

    await cache.set('HTTP:/statistics?username=alice&user=user-1', { data: 'alice' }, 10000);
    await cache.set('HTTP:/stats?username=alice&user=user-1', { data: 'alice-stats' }, 10000);
    await cache.set('HTTP:/statistics?username=bob&user=user-2', { data: 'bob' }, 10000);

    await cache.deleteByPattern('user=user-1');

    // user-1 entries deleted
    await expect(cache.get('HTTP:/statistics?username=alice&user=user-1')).resolves.toBeUndefined();
    await expect(cache.get('HTTP:/stats?username=alice&user=user-1')).resolves.toBeUndefined();

    // user-2 entry remains intact
    await expect(cache.get('HTTP:/statistics?username=bob&user=user-2')).resolves.toEqual({ data: 'bob' });

    // single key delete
    await cache.delete('HTTP:/statistics?username=bob&user=user-2');
    await expect(cache.get('HTTP:/statistics?username=bob&user=user-2')).resolves.toBeUndefined();
  });
});
