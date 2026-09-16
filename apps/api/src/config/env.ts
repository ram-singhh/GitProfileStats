import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load application environment files outside tests. Vitest setupFiles establishes test-safe values first.
if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
  dotenv.config(); // fallback to local .env
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(4000),
    WEB_BASE_URL: z.string().default('http://localhost:3000'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GITHUB_CALLBACK_URL: z.string().default('http://localhost:3000/api/v1/auth/github/callback'),
    GITHUB_TOKEN: z.string(),
    SESSION_SECRET: z.string().min(32),
    DATABASE_URL: z.string().min(1).optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  })
  .superRefine((values, context) => {
    const hasRedisUrl = Boolean(values.UPSTASH_REDIS_REST_URL);
    const hasRedisToken = Boolean(values.UPSTASH_REDIS_REST_TOKEN);
    if (hasRedisUrl !== hasRedisToken) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['UPSTASH_REDIS_REST_URL'],
        message: 'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together',
      });
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
