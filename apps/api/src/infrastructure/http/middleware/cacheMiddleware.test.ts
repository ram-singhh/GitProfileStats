import type { Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../../../config/logger.js';
import type { IResponseCache } from '../../cache/IResponseCache.js';
import { cacheMiddleware, clearResponseCache, invalidateUserCache } from './cacheMiddleware.js';

const makeResponse = (): Response =>
  ({
    statusCode: 200,
    getHeader: vi.fn().mockReturnValue(undefined),
    setHeader: vi.fn(),
    status: vi.fn(function (this: Response, statusCode: number) {
      this.statusCode = statusCode;
      return this;
    }),
    send: vi.fn(function (this: Response) {
      return this;
    }),
  }) as unknown as Response;

const makeRequest = (): Request =>
  ({
    method: 'GET',
    path: '/api/stats',
    query: { username: 'demo', token: 'cache-token-must-not-appear' },
    user: { id: 'verified-user-id' },
  }) as unknown as Request;

describe('cacheMiddleware', () => {
  afterEach(() => {
    clearResponseCache();
    vi.restoreAllMocks();
  });

  it('serves a valid HTTP cache hit without rerunning the controller', async () => {
    const cachedEntry = {
      body: 'cached body',
      headers: { 'content-type': 'text/plain' },
      statusCode: 201,
    };
    const cache: IResponseCache = {
      get: vi.fn().mockResolvedValue(cachedEntry),
      set: vi.fn(),
      clear: vi.fn(),
    };
    const response = makeResponse();
    const next = vi.fn();

    await cacheMiddleware(300, cache)(makeRequest(), response, next);

    expect(cache.get).toHaveBeenCalledWith('HTTP:/api/stats?username=demo&user=verified-user-id');
    expect(next).not.toHaveBeenCalled();
    expect(response.setHeader).toHaveBeenCalledWith('content-type', 'text/plain');
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.send).toHaveBeenCalledWith('cached body');
    expect(cache.set).not.toHaveBeenCalled();
  });

  it('runs the controller on a miss and stores only successful responses with the existing TTL', async () => {
    const cache: IResponseCache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
    };
    const response = makeResponse();
    const next = vi.fn();

    await cacheMiddleware(300, cache)(makeRequest(), response, next);
    response.send('fresh body');
    await Promise.resolve();

    expect(next).toHaveBeenCalledOnce();
    expect(cache.set).toHaveBeenCalledWith(
      'HTTP:/api/stats?username=demo&user=verified-user-id',
      {
        body: 'fresh body',
        headers: {},
        statusCode: 200,
      },
      300000,
    );
  });

  it('continues normally when a cache read fails', async () => {
    const cache: IResponseCache = {
      get: vi.fn().mockRejectedValue(new Error('Redis unavailable')),
      set: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
    };
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    const response = makeResponse();
    const next = vi.fn();

    await expect(
      cacheMiddleware(300, cache)(makeRequest(), response, next),
    ).resolves.toBeUndefined();

    expect(next).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'read', errorType: 'Error' }),
      'Response cache read failed; continuing without cache',
    );
  });

  it('continues normally when a cache write fails', async () => {
    const cache: IResponseCache = {
      get: vi.fn().mockResolvedValue(undefined),
      set: vi.fn().mockRejectedValue(new Error('Redis unavailable')),
      clear: vi.fn(),
    };
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    const response = makeResponse();
    const next = vi.fn();

    await cacheMiddleware(300, cache)(makeRequest(), response, next);
    expect(() => response.send('fresh body')).not.toThrow();
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(next).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.objectContaining({ operation: 'write', errorType: 'Error' }),
      'Response cache write failed; continuing without cache',
    );
  });

  it('treats malformed cache entries as misses', async () => {
    const cache: IResponseCache = {
      get: vi.fn().mockResolvedValue({ body: 'missing status' }),
      set: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
    };
    const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    const response = makeResponse();
    const next = vi.fn();

    await cacheMiddleware(300, cache)(makeRequest(), response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(warnSpy).toHaveBeenCalledWith(
      'Response cache entry was malformed; continuing without cache',
    );
  });

  describe('invalidateUserCache', () => {
    it('deletes cached entries for the specified user by pattern', async () => {
      const cache: IResponseCache = {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
        deleteByPattern: vi.fn().mockResolvedValue(undefined),
        clear: vi.fn(),
      };

      await invalidateUserCache('target-user-id', cache);

      expect(cache.deleteByPattern).toHaveBeenCalledWith('user=target-user-id');
    });

    it('handles cache deletion failure gracefully without throwing', async () => {
      const cache: IResponseCache = {
        get: vi.fn(),
        set: vi.fn(),
        delete: vi.fn(),
        deleteByPattern: vi.fn().mockRejectedValue(new Error('Redis connection lost')),
        clear: vi.fn(),
      };
      const warnSpy = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);

      await expect(invalidateUserCache('target-user-id', cache)).resolves.toBeUndefined();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.objectContaining({ operation: 'delete', errorType: 'Error' }),
        'Response cache delete failed; continuing without cache',
      );
    });
  });
});
