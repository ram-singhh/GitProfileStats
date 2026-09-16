import { Redis } from '@upstash/redis';
import { inject, injectable } from 'tsyringe';
import type { IResponseCache } from './IResponseCache.js';

@injectable()
export class UpstashResponseCache implements IResponseCache {
  constructor(@inject('UpstashRedis') private readonly redis: Redis) {}

  public async get<T>(key: string): Promise<T | undefined> {
    return (await this.redis.get<T>(key)) ?? undefined;
  }

  public async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    await this.redis.set(key, value, { ex: Math.max(1, Math.ceil(ttlMs / 1000)) });
  }

  public async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  public async deleteByPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(`*${pattern}*`);
    if (keys && keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  public clear(): void {
    // Redis is shared across processes; never flush a shared database from a service helper.
  }
}
