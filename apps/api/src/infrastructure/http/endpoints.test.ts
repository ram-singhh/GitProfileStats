import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';

describe('API Endpoints', () => {
  const mockFetch = vi.fn(async (url: string, options?: any) => {
    const urlString = String(url);

    // 1. GraphQL Mocking
    if (urlString.includes('/graphql')) {
      const body = JSON.parse(options?.body || '{}');
      const query = body.query || '';

      if (query.includes('viewer { login') || query.includes('viewer{login')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              viewer: {
                login: 'demo',
                createdAt: '2026-01-01T00:00:00Z',
              },
            },
          }),
        };
      }
      if (query.includes('thisYear: contributionsCollection')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                thisYear: { totalCommitContributions: 100, restrictedContributionsCount: 10 },
                thisMonth: { totalCommitContributions: 20, restrictedContributionsCount: 2 },
                thisWeek: { totalCommitContributions: 5, restrictedContributionsCount: 1 },
                year_2026: { totalCommitContributions: 100, restrictedContributionsCount: 10 },
              },
            },
          }),
        };
      }
      if (query.includes('standardCalendar: contributionsCollection')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                standardCalendar: {
                  contributionCalendar: {
                    totalContributions: 150,
                    weeks: [],
                  },
                },
                year_2026: {
                  contributionCalendar: {
                    totalContributions: 150,
                    weeks: [],
                  },
                },
              },
            },
          }),
        };
      }
      if (query.includes('pullRequests(states: [OPEN])') || query.includes('pullRequests {')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                pullRequests: { totalCount: 42 },
                openPRs: { totalCount: 10 },
                closedPRs: { totalCount: 20 },
                mergedPRs: { totalCount: 12 },
              },
            },
          }),
        };
      }
      if (query.includes('allIssues: issues {') || query.includes('allIssues: issues(')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                allIssues: { totalCount: 24 },
                closedIssues: { totalCount: 1 },
              },
            },
          }),
        };
      }
      if (query.includes('closedIssuesList: issues(')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                closedIssuesList: {
                  pageInfo: { hasNextPage: false, endCursor: null },
                  nodes: [{ createdAt: '2026-07-28T00:00:00Z', closedAt: '2026-07-29T00:00:00Z' }],
                },
              },
            },
          }),
        };
      }
      if (query.includes('user(login: $login)')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              user: {
                login: body.variables?.login || 'demo',
                createdAt: '2026-01-01T00:00:00Z',
              },
            },
          }),
        };
      }
      if (query.includes('viewer { repositories') || query.includes('viewer{repositories')) {
        return {
          ok: true,
          json: async () => ({
            data: {
              viewer: {
                repositories: {
                  pageInfo: { hasNextPage: false, endCursor: null },
                  nodes: [],
                },
              },
            },
          }),
        };
      }

      // Default GraphQL fallback to prevent throwing "returned no data"
      return {
        ok: true,
        json: async () => ({ data: {} }),
      };
    }

    // 2. REST Mocking
    if (/\/users\/[^/]+\/repos($|\?)/.test(urlString) || urlString.includes('/user/repos')) {
      const parts = urlString.split('?')[0].split('/');
      let login = 'demo';
      if (urlString.includes('/users/')) {
        login = parts[parts.indexOf('users') + 1] || 'demo';
      }
      return {
        ok: true,
        json: async () => [
          {
            name: 'test',
            owner: { login },
            stargazers_count: 5,
            forks_count: 2,
            watchers_count: 5,
            open_issues_count: 1,
            size: 100,
            fork: false,
          },
        ],
      };
    }
    if (urlString.includes('/oauth/access_token')) {
      return {
        ok: true,
        json: async () => ({
          access_token: 'mock-access-token',
        }),
      };
    }
    if (
      /\/users\/[^/]+($|\?)/.test(urlString) ||
      urlString.endsWith('/user') ||
      urlString.includes('/user?')
    ) {
      const parts = urlString.split('?')[0].split('/');
      const login = parts[parts.length - 1] || 'demo';
      return {
        ok: true,
        json: async () => ({
          id: 5832347,
          login: login === 'user' ? 'demo' : login,
          name: 'Demo User',
          followers: 10,
          following: 5,
          public_repos: 2,
          total_private_repos: 1,
          avatar_url: 'https://avatars.githubusercontent.com/u/5832347?v=4',
        }),
      };
    }
    if (urlString.includes('/repos/demo/test/languages')) {
      return {
        ok: true,
        json: async () => ({ TypeScript: 1000, JavaScript: 500 }),
      };
    }
    if (urlString.includes('/repos/demo/test')) {
      return {
        ok: true,
        json: async () => ({
          name: 'test',
          owner: { login: 'demo' },
          description: 'Mock repository description',
          language: 'TypeScript',
          stargazers_count: 99,
          forks_count: 14,
          license: { name: 'MIT License', spdx_id: 'MIT' },
          updated_at: '2026-08-01T00:00:00Z',
        }),
      };
    }

    // Fallback for avatar base64 fetch
    return {
      ok: true,
      text: async () => 'mock-base64',
      arrayBuffer: async () => new ArrayBuffer(0),
      json: async () => ({}),
    };
  });

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 OK and health statistics', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Validation Middleware', () => {
    it('should return 400 Bad Request if neither username nor token is provided', async () => {
      const response = await request(app).get('/api/stats');
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should pass validation if at least username is provided', async () => {
      const response = await request(app).get('/api/stats?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should reject a GitHub token in the query string', async () => {
      const rawToken = 'query-token-must-not-be-accepted';
      const response = await request(app).get(
        `/api/statistics?username=demo&token=${encodeURIComponent(rawToken)}`,
      );

      expect(response.status).toBe(401);
      expect(JSON.stringify(response.body)).not.toContain(rawToken);
    });
  });

  describe('GitHub Controller Endpoints', () => {
    it('should retrieve statistics successfully in mock/demo mode', async () => {
      const response = await request(app).get('/api/statistics?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('repositoryStats');
      expect(response.body.data).toHaveProperty('contributionStats');
    });

    it('should retrieve repository list successfully', async () => {
      const response = await request(app).get('/api/repositories?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data).toHaveProperty('rankings');
    });

    it('should retrieve language breakdown successfully', async () => {
      const response = await request(app).get('/api/languages?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should retrieve contributions data successfully', async () => {
      const response = await request(app).get('/api/contributions?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('longestStreak');
    });

    it('should retrieve commits data successfully', async () => {
      const response = await request(app).get('/api/commits?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCommits');
    });

    it('should retrieve pull requests count successfully', async () => {
      const response = await request(app).get('/api/pull-requests?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalPullRequests');
    });

    it('should retrieve issues count successfully', async () => {
      const response = await request(app).get('/api/issues?username=demo');
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalIssuesOpened');
    });
  });

  describe('Card Controller Endpoints (SVG generation)', () => {
    it('should generate profile card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/profile.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });

    it('should generate stats card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/stats.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });

    it('should generate languages card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/languages.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });

    it('should generate streak card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/streak.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });

    it('should generate trophies card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/trophies.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });

    it('should generate repository card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/repository.svg?owner=demo&repo=test')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });

    it('should generate top contributed repos card SVG', async () => {
      const response = await request(app)
        .get('/api/cards/top-contributed.svg?username=demo')
        .expect('Content-Type', /image\/svg\+xml/);
      expect(response.status).toBe(200);
      const svgText = response.text || (response.body && response.body.toString('utf-8')) || '';
      expect(svgText).toContain('<svg');
      expect(svgText).toContain('</svg>');
    });
  });

  describe('User and Authentication Routes', () => {
    it('should return 401 Unauthorized for /users/me without token', async () => {
      const response = await request(app).get('/api/v1/users/me');
      expect(response.status).toBe(401);
    });

    it('should reject an unsigned bearer value as an identity', async () => {
      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer some-test-id');

      expect(response.status).toBe(401);
    });

    it('should redirect to GitHub authorize URL for login', async () => {
      const response = await request(app).get('/api/v1/auth/github');
      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('github.com/login/oauth/authorize');
    });

    it('should redirect with missing_code error when callback is missing code', async () => {
      const response = await request(app).get('/api/v1/auth/github/callback');
      expect(response.status).toBe(302);
      expect(response.headers.location).toContain('error=missing_code');
    });

    it('should issue a signed session cookie and redirect without an identifier', async () => {
      const response = await request(app)
        .get('/api/v1/auth/github/callback')
        .query({ code: 'some-oauth-code' });

      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('http://localhost:3000/login/callback');
      expect(response.headers.location).not.toContain('5832347');
      expect(response.headers.location).not.toContain('token=');

      const setCookie = response.headers['set-cookie'];
      expect(setCookie).toBeDefined();
      expect(setCookie?.some((cookie) => cookie.startsWith('gitprofilestats_session='))).toBe(true);
      expect(setCookie?.some((cookie) => cookie.includes('HttpOnly'))).toBe(true);
      expect(setCookie?.some((cookie) => cookie.includes('Secure'))).toBe(true);
      expect(setCookie?.some((cookie) => cookie.includes('SameSite=None'))).toBe(true);

      const sessionCookie = setCookie
        ?.find((cookie) => cookie.startsWith('gitprofilestats_session='))
        ?.split(';')[0];
      expect(sessionCookie).toBeDefined();

      const [cookieName, signedSession] = (sessionCookie as string).split('=');
      const [encodedClaims, signature] = signedSession.split('.');
      const forgedSignature = `${signature.startsWith('a') ? 'b' : 'a'}${signature.slice(1)}`;
      const forgedSessionCookie = `${cookieName}=${encodedClaims}.${forgedSignature}`;
      const forgedProfileResponse = await request(app)
        .get('/api/v1/users/me')
        .set('Cookie', forgedSessionCookie);
      expect(forgedProfileResponse.status).toBe(401);

      const profileResponse = await request(app)
        .get('/api/v1/users/me')
        .set('Cookie', sessionCookie as string);
      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.success).toBe(true);
      expect(profileResponse.body.data.username).toBe('demo');
      expect(profileResponse.body.data.hasGithubToken).toBe(true);
      expect(profileResponse.body.data).not.toHaveProperty('githubAccessToken');
      expect(JSON.stringify(profileResponse.body)).not.toContain('mock-access-token');

      mockFetch.mockClear();
      const statisticsResponse = await request(app)
        .get('/api/statistics?username=demo')
        .set('Cookie', sessionCookie as string);
      expect(statisticsResponse.status).toBe(200);
      const userRequest = mockFetch.mock.calls.find(([url]) => String(url).includes('/user'));
      expect(userRequest?.[1]?.headers?.Authorization).toBe('Bearer mock-access-token');
      expect(JSON.stringify(statisticsResponse.body)).not.toContain('mock-access-token');

      const replacementToken = 'replacement-token-kept-server-side';
      const setTokenResponse = await request(app)
        .put('/api/v1/users/github-token')
        .set('Cookie', sessionCookie as string)
        .send({ token: replacementToken });
      expect(setTokenResponse.status).toBe(200);
      expect(setTokenResponse.body.data).toEqual({ hasGithubToken: true });
      expect(JSON.stringify(setTokenResponse.body)).not.toContain(replacementToken);

      const clearTokenResponse = await request(app)
        .delete('/api/v1/users/github-token')
        .set('Cookie', sessionCookie as string);
      expect(clearTokenResponse.status).toBe(200);
      expect(clearTokenResponse.body.data).toEqual({ hasGithubToken: false });
      expect(JSON.stringify(clearTokenResponse.body)).not.toContain(replacementToken);
    });

    it('should not allow spoofing another user private repositories', async () => {
      // 1. Authenticate and get session cookie for 'demo'
      const loginResponse = await request(app)
        .get('/api/v1/auth/github/callback')
        .query({ code: 'some-oauth-code' });
      const setCookie = loginResponse.headers['set-cookie'];
      const sessionCookie = setCookie
        ?.find((cookie) => cookie.startsWith('gitprofilestats_session='))
        ?.split(';')[0];

      // 2. Request statistics for 'attacker' using 'demo's session cookie
      // In this case, 'demo' is the authenticated user, but they request 'attacker'
      mockFetch.mockClear();
      const response = await request(app)
        .get('/api/statistics?username=attacker')
        .set('Cookie', sessionCookie as string);

      expect(response.status).toBe(200);

      // The backend should query public endpoint for 'attacker' (/users/attacker), NOT /user or /user/repos
      const hasUserReposCall = mockFetch.mock.calls.some(([url]) =>
        String(url).includes('/user/repos'),
      );
      const hasViewerReposGraphQLCall = mockFetch.mock.calls.some(
        ([url, opts]) =>
          String(url).includes('/graphql') && String(opts?.body).includes('viewer {'),
      );

      expect(hasUserReposCall).toBe(false);
      expect(hasViewerReposGraphQLCall).toBe(false);
    });

    it('should complete OAuth, store token, and execute GraphQL queries with the OAuth token without manual PAT', async () => {
      // 1. User performs OAuth callback
      const callbackResponse = await request(app)
        .get('/api/v1/auth/github/callback')
        .query({ code: 'valid-oauth-code' });

      expect(callbackResponse.status).toBe(302);
      const sessionCookie = callbackResponse.headers['set-cookie']
        ?.find((cookie) => cookie.startsWith('gitprofilestats_session='))
        ?.split(';')[0];
      expect(sessionCookie).toBeDefined();

      // 2. Dashboard requests user profile
      const profileResponse = await request(app)
        .get('/api/v1/users/me')
        .set('Cookie', sessionCookie as string);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.data.username).toBe('demo');
      expect(profileResponse.body.data.hasGithubToken).toBe(true);

      // 3. Dashboard requests statistics using the session cookie
      mockFetch.mockClear();
      const statsResponse = await request(app)
        .get('/api/statistics?username=demo')
        .set('Cookie', sessionCookie as string);

      expect(statsResponse.status).toBe(200);
      expect(statsResponse.body.success).toBe(true);
      expect(statsResponse.body.data).toHaveProperty('commitStats');
      expect(statsResponse.body.data).toHaveProperty('contributionStats');

      // Verify GraphQL API requests carried the user's OAuth access token in the Authorization header
      const graphqlCalls = mockFetch.mock.calls.filter(([url]) => String(url).includes('/graphql'));
      expect(graphqlCalls.length).toBeGreaterThan(0);
      for (const [, opts] of graphqlCalls) {
        expect(opts?.headers?.Authorization).toBe('Bearer mock-access-token');
      }

      // 4. Logout clears the session cookie
      const logoutResponse = await request(app)
        .post('/api/v1/auth/logout')
        .set('Cookie', sessionCookie as string);

      expect(logoutResponse.status).toBe(200);
      expect(logoutResponse.body.success).toBe(true);
      const clearCookie = logoutResponse.headers['set-cookie'];
      expect(clearCookie).toBeDefined();
      expect(clearCookie?.some((cookie) => cookie.includes('gitprofilestats_session=;'))).toBe(true);
    });
  });
});
