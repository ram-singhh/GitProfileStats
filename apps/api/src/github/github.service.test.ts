import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GitHubService } from './github.service.js';
import { GitHubApiError } from '../domain/errors/DomainError.js';
import { logger } from '../config/logger.js';

describe('GitHubService', () => {
  let gitHubService: GitHubService;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    gitHubService = new GitHubService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('REST Requests', () => {
    it('should fetch the authenticated user profile', async () => {
      const mockUser = { login: 'octocat', id: 1 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const user = await gitHubService.getAuthenticatedUser('some-token');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer some-token',
          }),
        }),
      );
      expect(user).toEqual(mockUser);
    });

    it('should fetch a specific user profile by username', async () => {
      const mockUser = { login: 'john_doe', id: 2 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      const user = await gitHubService.getUser('john_doe');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/users/john_doe',
        expect.any(Object),
      );
      expect(user).toEqual(mockUser);
    });

    it('should fetch repositories for authenticated user when no username is provided', async () => {
      const mockRepos = [{ id: 101, name: 'repo-1' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepos,
      });

      const repos = await gitHubService.getRepositories(undefined, {
        token: 'token',
        page: 1,
        perPage: 30,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/user/repos?page=1&per_page=30&type=owner',
        expect.any(Object),
      );
      expect(repos).toEqual(mockRepos);
    });

    it('should fetch repositories for specific user when username is provided', async () => {
      const mockRepos = [{ id: 102, name: 'repo-2' }];
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'different_user' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRepos,
        });

      const repos = await gitHubService.getRepositories('john_doe', 'some-token');

      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://api.github.com/users/john_doe/repos',
        expect.any(Object),
      );
      expect(repos).toEqual(mockRepos);
    });

    it('should fetch repositories from /user/repos when username matches authenticated user', async () => {
      const mockRepos = [{ id: 104, name: 'repo-4' }];
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'john_doe' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRepos,
        });

      const repos = await gitHubService.getRepositories('john_doe', 'some-token');

      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://api.github.com/user/repos?type=owner',
        expect.any(Object),
      );
      expect(repos).toEqual(mockRepos);
    });

    it('should fetch repositories from public endpoint when username does not match authenticated user', async () => {
      const mockRepos = [{ id: 105, name: 'repo-5' }];
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'john_doe' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockRepos,
        });

      const repos = await gitHubService.getRepositories('other_user', 'some-token');

      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://api.github.com/users/other_user/repos',
        expect.any(Object),
      );
      expect(repos).toEqual(mockRepos);
    });

    it('should fetch a specific repository details', async () => {
      const mockRepo = { id: 103, name: 'special-repo' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepo,
      });

      const repo = await gitHubService.getRepository('john_doe', 'special-repo');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/john_doe/special-repo',
        expect.any(Object),
      );
      expect(repo).toEqual(mockRepo);
    });

    it('should fetch repository languages', async () => {
      const mockLanguages = { TypeScript: 12345, JavaScript: 500 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockLanguages,
      });

      const langs = await gitHubService.getRepositoryLanguages('john_doe', 'special-repo');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/john_doe/special-repo/languages',
        expect.any(Object),
      );
      expect(langs).toEqual(mockLanguages);
    });

    it('should fetch all pages of repositories in getAllRepositories', async () => {
      const page1 = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `repo-${i}` }));
      const page2 = [{ id: 100, name: 'repo-100' }];

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page1,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page2,
        });

      const repos = await gitHubService.getAllRepositories('john_doe');

      expect(repos.length).toBe(101);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw GitHubApiError when fetch responds with non-200', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'User does not exist',
      });

      await expect(gitHubService.getUser('invalid_user')).rejects.toThrow(GitHubApiError);
    });

    it('should throw original error when fetch throws network error', async () => {
      const networkError = new Error('Network failure');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(gitHubService.getUser('john_doe')).rejects.toThrow('Network failure');
    });

    it('should not expose a raw token in cache-key logs', async () => {
      const rawToken = 'cache-key-token-must-not-be-logged';
      const debugSpy = vi.spyOn(logger, 'debug').mockImplementation(() => undefined);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ login: 'octocat', id: 1 }),
      });

      await gitHubService.getAuthenticatedUser(rawToken);
      await gitHubService.getAuthenticatedUser(rawToken);

      expect(JSON.stringify(debugSpy.mock.calls)).not.toContain(rawToken);
    });

    it('should not expose a raw token in GitHub error logs', async () => {
      const rawToken = 'error-log-token-must-not-be-logged';
      const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => undefined);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => `invalid token ${rawToken}`,
      });

      await expect(gitHubService.getAuthenticatedUser(rawToken)).rejects.toThrow(GitHubApiError);

      expect(JSON.stringify(errorSpy.mock.calls)).not.toContain(rawToken);
    });
  });

  describe('GraphQL Requests', () => {
    it('should perform a successful GraphQL query', async () => {
      const mockData = { user: { contributionsCollection: {} } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const query = 'query { viewer { login } }';
      const variables = { x: 1 };
      const result = await gitHubService.graphql(query, variables, 'token');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/graphql',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer token',
          }),
          body: JSON.stringify({ query, variables }),
        }),
      );
      expect(result).toEqual(mockData);
    });

    it('should not double-prefix Bearer when token already contains Bearer prefix in GraphQL', async () => {
      const mockData = { viewer: { login: 'octocat' } };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      await gitHubService.graphql('query { viewer { login } }', {}, 'Bearer prefixed-token');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.github.com/graphql',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer prefixed-token',
          }),
        }),
      );
    });

    it('should throw GitHubApiError if response is not ok', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Error',
        text: async () => 'server crash',
      });

      await expect(gitHubService.graphql('query {}')).rejects.toThrow(GitHubApiError);
    });

    it('should throw GitHubApiError if response contains errors array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ errors: [{ message: 'GraphQL syntax error' }] }),
      });

      await expect(gitHubService.graphql('query {}')).rejects.toThrow(GitHubApiError);
    });

    it('should throw GitHubApiError if response lacks data property', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await expect(gitHubService.graphql('query {}')).rejects.toThrow(GitHubApiError);
    });
  });
});
