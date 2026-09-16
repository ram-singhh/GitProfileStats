import type { Request, Response, NextFunction } from 'express';
import type { IAuthenticatedRequest } from './authGuard.js';
import { container } from '../../../config/container.js';
import { logger } from '../../../config/logger.js';
import type { IResponseCache } from '../../cache/IResponseCache.js';

interface HttpCacheEntry {
  body: any;
  headers: Record<string, string | string[] | undefined>;
  statusCode: number;
}

const responseCache = container.resolve<IResponseCache>('ResponseCache');

/**
 * Clear the configured response cache. Useful for test suites.
 */
export const clearResponseCache = (): void => {
  responseCache.clear();
};

const isHttpCacheEntry = (value: unknown): value is HttpCacheEntry => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Partial<HttpCacheEntry>;
  return (
    'body' in entry &&
    typeof entry.statusCode === 'number' &&
    Number.isFinite(entry.statusCode) &&
    entry.headers !== null &&
    typeof entry.headers === 'object'
  );
};

const logCacheFailure = (operation: 'read' | 'write' | 'delete', error: unknown): void => {
  logger.warn(
    { operation, errorType: error instanceof Error ? error.name : typeof error },
    `Response cache ${operation} failed; continuing without cache`,
  );
};

/**
 * Invalidate cached HTTP responses for a specific user.
 */
export const invalidateUserCache = async (
  userId: string,
  cache: IResponseCache = responseCache,
): Promise<void> => {
  try {
    await cache.deleteByPattern(`user=${userId}`);
  } catch (error: unknown) {
    logCacheFailure('delete', error);
  }
};

export const cacheMiddleware = (ttlSeconds = 300, cache: IResponseCache = responseCache) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }

    // Create a deterministic cache key without token material.
    const sortedQuery = Object.keys(req.query)
      .filter((key) => key !== 'token')
      .sort()
      .map((key) => `${key}=${String(req.query[key])}`)
      .join('&');
    const userId = (req as IAuthenticatedRequest).user?.id ?? 'public';
    const cacheKey = `HTTP:${req.path}?${sortedQuery}&user=${userId}`;

    let cached: HttpCacheEntry | undefined;
    try {
      cached = await cache.get<HttpCacheEntry>(cacheKey);
    } catch (error: unknown) {
      logCacheFailure('read', error);
    }

    if (cached !== undefined) {
      if (!isHttpCacheEntry(cached)) {
        logger.warn('Response cache entry was malformed; continuing without cache');
      } else {
        logger.debug({ cacheKey }, 'Serving endpoint response from cache');

        // Set cached headers
        Object.entries(cached.headers).forEach(([name, value]) => {
          if (value !== undefined) {
            res.setHeader(name, value);
          }
        });

        res.status(cached.statusCode).send(cached.body);
        return;
      }
    }

    // Intercept res.send
    const originalSend = res.send;
    res.send = function (body: any): Response {
      res.send = originalSend;

      if (res.statusCode >= 200 && res.statusCode < 300) {
        const headers: Record<string, string | string[] | undefined> = {};
        const contentType = res.getHeader('content-type');
        if (contentType !== undefined) {
          headers['content-type'] = contentType as string | string[];
        }
        const cacheControl = res.getHeader('cache-control');
        if (cacheControl !== undefined) {
          headers['cache-control'] = cacheControl as string | string[];
        }

        void Promise.resolve()
          .then(() =>
            cache.set(
              cacheKey,
              {
                body,
                headers,
                statusCode: res.statusCode,
              },
              ttlSeconds * 1000,
            ),
          )
          .catch((error: unknown) => {
            logCacheFailure('write', error);
          });
      }

      return originalSend.call(this, body);
    };

    next();
  };
};
