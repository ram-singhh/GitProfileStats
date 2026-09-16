/**
 * Centralized Web Client Environment Configuration
 *
 * In production or when proxied through Next.js rewrites, NEXT_PUBLIC_API_URL
 * defaults to an empty string so all requests use same-origin relative URLs (/api/...).
 */
export const env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') || '',
} as const;
