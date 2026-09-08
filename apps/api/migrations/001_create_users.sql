CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  github_id TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('FREE', 'PRO')),
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  github_access_token TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx
  ON users (LOWER(username));
