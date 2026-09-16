import 'reflect-metadata';
import { beforeEach } from 'vitest';

// Configure test environment variables before importing modules that read them.
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.WEB_BASE_URL = 'http://localhost:3000';
process.env.LOG_LEVEL = 'info';
process.env.GITHUB_CLIENT_ID = 'dummy_client_id';
process.env.GITHUB_CLIENT_SECRET = 'dummy_client_secret';
process.env.GITHUB_CALLBACK_URL = 'http://localhost:3000/api/v1/auth/github/callback';
process.env.GITHUB_TOKEN = 'dummy_token';
process.env.SESSION_SECRET = 'test-session-secret-with-at-least-32-characters';
delete process.env.DATABASE_URL;
delete process.env.UPSTASH_REDIS_REST_URL;
delete process.env.UPSTASH_REDIS_REST_TOKEN;

const { clearResponseCache } = await import('../infrastructure/http/middleware/cacheMiddleware.js');
const { clearAvatarCache } = await import('../utils/image.js');
const { clearTextWidthCache } = await import('../cards/engine/typography.js');
const { clearAttributeNameCache } = await import('../cards/engine/helpers.js');

beforeEach(() => {
  clearResponseCache();
  clearAvatarCache();
  clearTextWidthCache();
  clearAttributeNameCache();
});
