import { describe, it, expect } from 'vitest';
import {
  renderProfileCard,
  renderStatsCard,
  renderLanguagesCard,
  renderStreakCard,
  renderRepositoryCard,
  renderTrophiesCard,
  renderTopContributedCard,
  renderRankingsCard,
  calculateTrophy,
} from './index.js';

describe('Card Generators', () => {
  const dummyOptions = {
    theme: 'dark',
    accent: '#ff0000',
    background: '#000000',
    borderRadius: 8,
    hideBorder: false,
    fontFamily: 'Segoe UI',
  };

  describe('renderProfileCard', () => {
    it('should generate a valid profile card SVG', async () => {
      const mockUser = {
        login: 'john_doe',
        name: 'John Doe',
        avatar_url: 'https://avatars.githubusercontent.com/u/1234?v=4',
        bio: 'Hello world',
        public_repos: 5,
        followers: 12,
        following: 15,
        created_at: '2026-01-01T00:00:00Z',
      };

      const svg = await renderProfileCard(mockUser, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('John Doe');
      expect(svg).toContain('john_doe');
      expect(svg).toContain('12'); // Followers
    });

    it('should show private repository count correctly when stats are provided', async () => {
      const mockUser = {
        login: 'john_doe',
        name: 'John Doe',
        avatar_url: 'https://avatars.githubusercontent.com/u/1234?v=4',
        bio: 'Hello world',
        public_repos: 5,
        followers: 12,
        following: 15,
        created_at: '2026-01-01T00:00:00Z',
      };
      const mockStats = { publicRepositories: 5, privateRepositories: 7 };

      const svg = await renderProfileCard(mockUser, mockStats, dummyOptions);
      expect(svg).toContain('5'); // Public repos
      expect(svg).toContain('7'); // Private repos
      expect(svg).toContain('Public Repos');
      expect(svg).toContain('Private Repos');
    });

    it('should render distinct colors for different themes', async () => {
      const mockUser = {
        login: 'john_doe',
        name: 'John Doe',
        avatar_url: 'https://avatars.githubusercontent.com/u/1234?v=4',
        bio: 'Hello world',
        public_repos: 5,
        followers: 12,
        following: 15,
        created_at: '2026-01-01T00:00:00Z',
      };

      const lightSvg = await renderProfileCard(mockUser, { theme: 'light' });
      const darkSvg = await renderProfileCard(mockUser, { theme: 'dark' });
      const draculaSvg = await renderProfileCard(mockUser, { theme: 'dracula' });

      // Light background is #ffffff
      expect(lightSvg).toContain('#ffffff');
      // Dark background is #0d1117
      expect(darkSvg).toContain('#0d1117');
      // Dracula background is #282a36
      expect(draculaSvg).toContain('#282a36');

      expect(lightSvg).not.toEqual(darkSvg);
      expect(darkSvg).not.toEqual(draculaSvg);
    });
  });

  describe('renderStatsCard', () => {
    it('should generate a valid stats card SVG', () => {
      const mockStats = {
        username: 'john_doe',
        name: 'John Doe',
        totalStars: 42,
        totalCommits: 1337,
        totalRepositories: 8,
        pullRequests: 15,
        issues: 2,
        followers: 12,
      };

      const svg = renderStatsCard(mockStats, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('width="440"');
      expect(svg).toContain('height="195"');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('John Doe');
      expect(svg).toContain('42'); // Stars
      expect(svg).toContain('1,337'); // Commits formatting
    });

    it('should render separate SVG text elements for labels and values with right-aligned values', () => {
      const mockStats = {
        username: 'johndoe',
        name: 'John Doe',
        totalStars: 16,
        pullRequests: 8,
        totalCommits: 632,
        issues: 1,
        totalRepositories: 35,
        followers: 3,
      };

      const svg = renderStatsCard(mockStats, dummyOptions);

      // Separate text elements for labels
      expect(svg).toContain('>Total Stars:<');
      expect(svg).toContain('>Total Commits:<');
      expect(svg).toContain('>Total Repositories:<');
      expect(svg).toContain('>Pull Requests:<');
      expect(svg).toContain('>Issues:<');
      expect(svg).toContain('>Followers:<');

      // Separate text elements for values
      expect(svg).toContain('>16<');
      expect(svg).toContain('>632<');
      expect(svg).toContain('>35<');
      expect(svg).toContain('>8<');
      expect(svg).toContain('>1<');
      expect(svg).toContain('>3<');

      // Right-aligned values within each column
      expect(svg).toContain('text-anchor="end"');
      // Left column values aligned at x="210"
      expect(svg).toMatch(/<text[^>]*x="210"[^>]*text-anchor="end"[^>]*>16<\/text>/);
      expect(svg).toMatch(/<text[^>]*x="210"[^>]*text-anchor="end"[^>]*>632<\/text>/);
      expect(svg).toMatch(/<text[^>]*x="210"[^>]*text-anchor="end"[^>]*>35<\/text>/);
      // Right column values aligned at x="420"
      expect(svg).toMatch(/<text[^>]*x="420"[^>]*text-anchor="end"[^>]*>8<\/text>/);
      expect(svg).toMatch(/<text[^>]*x="420"[^>]*text-anchor="end"[^>]*>1<\/text>/);
      expect(svg).toMatch(/<text[^>]*x="420"[^>]*text-anchor="end"[^>]*>3<\/text>/);
    });

    it('should handle single-digit, multi-digit, and 10,000+ numbers gracefully', () => {
      const largeStats = {
        username: 'rockstar',
        name: 'Rockstar Dev',
        totalStars: 25400,
        pullRequests: 10500,
        totalCommits: 150200,
        issues: 8400,
        totalRepositories: 2500,
        followers: 120000,
      };

      const svg = renderStatsCard(largeStats, dummyOptions);

      expect(svg).toContain('>25,400<');
      expect(svg).toContain('>10,500<');
      expect(svg).toContain('>150,200<');
      expect(svg).toContain('>8,400<');
      expect(svg).toContain('>2,500<');
      expect(svg).toContain('>120,000<');
      expect(svg).toContain('</svg>');
    });

    it('should handle zero and single-digit values correctly', () => {
      const zeroStats = {
        username: 'newbie',
        name: null,
        totalStars: 0,
        pullRequests: 0,
        totalCommits: 0,
        issues: 0,
        totalRepositories: 0,
        followers: 0,
      };

      const svg = renderStatsCard(zeroStats, dummyOptions);

      expect(svg).toContain('newbie&apos;s GitHub Stats');
      expect(svg).toContain('>0<');
      expect(svg).toContain('</svg>');
    });
  });

  describe('renderLanguagesCard', () => {
    it('should generate a valid languages card SVG', () => {
      const mockLanguages = [
        { language: 'TypeScript', bytes: 10000, percentage: 80, repositoryCount: 3 },
        { language: 'JavaScript', bytes: 2500, percentage: 20, repositoryCount: 1 },
      ];

      const svg = renderLanguagesCard(mockLanguages, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('width="440"');
      expect(svg).toContain('height="195"');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('TypeScript');
      expect(svg).toContain('JavaScript');
      expect(svg).toContain('80.0%');
    });
  });

  describe('renderStreakCard', () => {
    it('should generate a valid streak card SVG', () => {
      const mockStreak = {
        username: 'john_doe',
        totalContributions: 245,
        currentStreak: 12,
        longestStreak: 25,
        contributionCalendar: {
          totalContributions: 245,
          weeks: [],
        },
      };

      const svg = renderStreakCard(mockStreak, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('12'); // Current streak
      expect(svg).toContain('25'); // Longest streak
      expect(svg).toContain('245'); // Total contributions
    });
  });

  describe('renderRepositoryCard', () => {
    it('should generate a valid repository card SVG', () => {
      const mockRepo = {
        name: 'git-profile-stats',
        owner: { login: 'john_doe' },
        description: 'Mock repository description text for checking.',
        language: 'TypeScript',
        stargazers_count: 99,
        forks_count: 14,
        license: { name: 'MIT License', spdx_id: 'MIT' },
        updated_at: '2026-08-01T00:00:00Z',
      };

      const svg = renderRepositoryCard(mockRepo, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('git-profile-stats');
      expect(svg).toContain('Mock repository description');
      expect(svg).toContain('TypeScript');
      expect(svg).toContain('99');
    });
  });

  describe('renderTrophiesCard', () => {
    it('should calculate trophy tiers correctly', () => {
      expect(calculateTrophy('stars', 5)).toEqual({
        tier: 'NONE',
        tierName: 'Beginner',
        color: '#8b949e',
      });
      expect(calculateTrophy('stars', 10)).toEqual({
        tier: 'BRONZE',
        tierName: 'Bronze',
        color: '#c5a059',
      });
      expect(calculateTrophy('stars', 50)).toEqual({
        tier: 'SILVER',
        tierName: 'Silver',
        color: '#a6a6a6',
      });
      expect(calculateTrophy('stars', 200)).toEqual({
        tier: 'GOLD',
        tierName: 'Gold',
        color: '#ffd700',
      });
      expect(calculateTrophy('stars', 1000)).toEqual({
        tier: 'PLATINUM',
        tierName: 'Platinum',
        color: '#00e5ff',
      });

      expect(calculateTrophy('commits', 50)).toEqual({
        tier: 'NONE',
        tierName: 'Beginner',
        color: '#8b949e',
      });
      expect(calculateTrophy('commits', 100)).toEqual({
        tier: 'BRONZE',
        tierName: 'Bronze',
        color: '#c5a059',
      });
      expect(calculateTrophy('commits', 500)).toEqual({
        tier: 'SILVER',
        tierName: 'Silver',
        color: '#a6a6a6',
      });
      expect(calculateTrophy('commits', 2000)).toEqual({
        tier: 'GOLD',
        tierName: 'Gold',
        color: '#ffd700',
      });
      expect(calculateTrophy('commits', 10000)).toEqual({
        tier: 'PLATINUM',
        tierName: 'Platinum',
        color: '#00e5ff',
      });
    });

    it('should generate a valid trophies card SVG with dynamic height and tier-based styles', () => {
      const mockStats = {
        username: 'john_doe',
        name: 'John Doe',
        totalStars: 42,
        totalCommits: 1337,
        totalRepositories: 8,
        pullRequests: 15,
        issues: 2,
        followers: 12,
      };

      const svg = renderTrophiesCard(mockStats, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('width="490"');
      expect(svg).toContain('height="182"'); // dynamic height: 20 padding-top + 20 title + 16 spacing + 48 row1 + 10 spacing + 48 row2 + 20 padding-bottom = 182
      expect(svg).toContain('</svg>');
      expect(svg).toContain('John Doe');
      expect(svg).toContain('Stars');
      expect(svg).toContain('Commits');
      expect(svg).toContain('PRs');
      expect(svg).toContain('Issues');
      expect(svg).toContain('Followers');
      expect(svg).toContain('Repos');

      // Check for tier color coding classes
      expect(svg).toContain('trophy-block-silver'); // Stars (42 -> Silver)
      expect(svg).toContain('trophy-block-bronze'); // Commits (1337 -> Bronze)
      expect(svg).toContain('trophy-block-none'); // Issues (2 -> None/Beginner)
    });
  });

  describe('renderTopContributedCard', () => {
    const mockContributions = [
      {
        name: 'repo-A',
        owner: 'owner-A',
        primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
        contributionCount: 15,
      },
      {
        name: 'repo-B',
        owner: 'owner-B',
        primaryLanguage: { name: 'JavaScript', color: '#f1e05a' },
        contributionCount: 42,
      },
      { name: 'repo-C', owner: 'owner-C', primaryLanguage: null, contributionCount: 5 },
    ];

    it('should generate a valid top contributed repos card SVG with default limit', () => {
      const svg = renderTopContributedCard(mockContributions, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('width="490"');
      expect(svg).toContain('height="195"'); // default limit 5 -> height 195
      expect(svg).toContain('</svg>');
      expect(svg).toContain('Top Contributed Repositories');
      expect(svg).toContain('owner-A/repo-A');
      expect(svg).toContain('owner-B/repo-B');
      expect(svg).toContain('15 commits');
      expect(svg).toContain('42 commits');
    });

    it('should scale dynamic height based on the limit parameter', () => {
      const svgLimit3 = renderTopContributedCard(mockContributions, { ...dummyOptions, limit: 3 });
      const svgLimit7 = renderTopContributedCard(mockContributions, { ...dummyOptions, limit: 7 });

      expect(svgLimit3).toContain('height="143"'); // 65 + 3 * 26 = 143
      expect(svgLimit7).toContain('height="247"'); // 65 + 7 * 26 = 247
    });

    it('should handle empty contributions array gracefully', () => {
      const svg = renderTopContributedCard([], dummyOptions);

      expect(svg).toContain('No contributions detected');
      expect(svg).toContain('Contributions to public/private repositories will show up here.');
    });
  });

  describe('renderRankingsCard', () => {
    const mockRankings = {
      username: 'john_doe',
      name: 'John Doe',
      mostStarred: {
        id: 1,
        name: 'starred-repo',
        fullName: 'john_doe/starred-repo',
        htmlUrl: 'https://github.com/john_doe/starred-repo',
        description: 'Starred repo description.',
        stars: 15,
        forks: 3,
        size: 50,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-08-01T00:00:00Z',
      },
      mostForked: {
        id: 2,
        name: 'forked-repo',
        fullName: 'john_doe/forked-repo',
        htmlUrl: 'https://github.com/john_doe/forked-repo',
        description: 'Forked repo description.',
        stars: 5,
        forks: 42,
        size: 60,
        createdAt: '2026-01-02T00:00:00Z',
        updatedAt: '2026-08-02T00:00:00Z',
      },
      mostRecentlyUpdated: {
        id: 3,
        name: 'updated-repo',
        fullName: 'john_doe/updated-repo',
        htmlUrl: 'https://github.com/john_doe/updated-repo',
        description: 'Updated repo description.',
        stars: 2,
        forks: 1,
        size: 70,
        createdAt: '2026-01-03T00:00:00Z',
        updatedAt: '2026-08-28T00:00:00Z',
      },
    };

    it('should generate a valid rankings card SVG', () => {
      const svg = renderRankingsCard(mockRankings, dummyOptions);

      expect(svg).toContain('<svg');
      expect(svg).toContain('width="490"');
      expect(svg).toContain('height="240"');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('John Doe&apos;s Repository Rankings');
      expect(svg).toContain('starred-repo');
      expect(svg).toContain('forked-repo');
      expect(svg).toContain('updated-repo');
      expect(svg).toContain('15'); // Stars stat
      expect(svg).toContain('42'); // Forks stat
      expect(svg).toContain('Aug 28'); // Date stat
    });

    it('should handle null/empty rankings gracefully', () => {
      const svg = renderRankingsCard(
        {
          username: 'john_doe',
          name: null,
          mostStarred: null,
          mostForked: null,
          mostRecentlyUpdated: null,
        },
        dummyOptions,
      );

      expect(svg).toContain('john_doe&apos;s Repository Rankings');
      expect(svg).toContain('No repository found');
      expect(svg).toContain('No repository meets this highlight criteria.');
    });
  });
});
