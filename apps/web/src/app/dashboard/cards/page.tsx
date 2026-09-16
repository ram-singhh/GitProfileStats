'use client';

import React, { useState, useEffect } from 'react';
import { env } from '@/config/env';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  RefreshCw,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  Terminal,
  Settings,
  AlertTriangle,
  Info,
  Download,
  Code2,
  Globe,
  WifiOff,
} from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

// Predefined Themes for Swatch Rendering
const THEME_SWATCHES = [
  {
    id: 'dark',
    name: 'Dark Default',
    bg: '#0d1117',
    border: '#30363d',
    text: '#c9d1d9',
    accent: '#58a6ff',
  },
  {
    id: 'light',
    name: 'Light Mode',
    bg: '#ffffff',
    border: '#d0d7de',
    text: '#24292f',
    accent: '#0969da',
  },
  {
    id: 'github',
    name: 'GitHub Green',
    bg: '#0d1117',
    border: '#30363d',
    text: '#c9d1d9',
    accent: '#2ea44f',
  },
  {
    id: 'dracula',
    name: 'Dracula Classic',
    bg: '#282a36',
    border: '#44475a',
    text: '#f8f8f2',
    accent: '#50fa7b',
  },
  {
    id: 'nord',
    name: 'Nord Arctic',
    bg: '#2e3440',
    border: '#3b4252',
    text: '#d8dee9',
    accent: '#88c0d0',
  },
];

interface CardState {
  svg: string;
  loading: boolean;
  error: string | null;
  copied: string | null; // "url" | "markdown" | "html" | "svg" | null
  tab: 'preview' | 'embed' | 'source';
  zoom: number;
}

type CardType = 'profile' | 'stats' | 'languages' | 'streak' | 'repository' | 'trophies' | 'top-contributed' | 'rankings';

const CARD_INFOS: Record<
  CardType,
  { title: string; desc: string; defaultHeight: number; defaultWidth: number }
> = {
  profile: {
    title: 'Profile Card',
    desc: 'Compact summary of your public developer profile identity',
    defaultWidth: 800,
    defaultHeight: 120,
  },
  stats: {
    title: 'Stats Card',
    desc: 'Overall repository count, stars, forks, commits, and issues tracker',
    defaultWidth: 440,
    defaultHeight: 195,
  },
  languages: {
    title: 'Languages Card',
    desc: 'Visual representation of your most frequent coding languages and bytes written',
    defaultWidth: 440,
    defaultHeight: 195,
  },
  streak: {
    title: 'Streak Card',
    desc: 'Contributions count, current coding streak, and your longest streak',
    defaultWidth: 490,
    defaultHeight: 165,
  },
  repository: {
    title: 'Repository Card',
    desc: 'Repository status, stars, forks, and licenses info',
    defaultWidth: 450,
    defaultHeight: 150,
  },
  trophies: {
    title: 'Trophies Card',
    desc: 'Achievement-style badges for stars, commits, pull requests, issues, followers, and repo count',
    defaultWidth: 490,
    defaultHeight: 182,
  },
  'top-contributed': {
    title: 'Top Contributed Repos',
    desc: 'Ranked list of repositories you contributed to by commit activity',
    defaultWidth: 490,
    defaultHeight: 195,
  },
  rankings: {
    title: 'Repository Rankings',
    desc: 'Highlights of your repositories (Most Starred, Most Forked, Recently Updated)',
    defaultWidth: 490,
    defaultHeight: 240,
  },
};

export default function CardPreviewPage() {
  const router = useRouter();
  const isOnline = useOnlineStatus();

  // Settings states
  const [username, setUsername] = useState('octocat');
  const [selectedTheme, setSelectedTheme] = useState('dark');
  const [langsCount, setLangsCount] = useState(5);
  const [contribLimit, setContribLimit] = useState(5);
  const [customAccent, setCustomAccent] = useState('');
  const [customBackground, setCustomBackground] = useState('');
  const [borderRadius, setBorderRadius] = useState(10);
  const [hideBorder, setHideBorder] = useState(false);
  const [fontStyle, setFontStyle] = useState('sans');

  const [repoName, setRepoName] = useState('GitProfileStats');
  const [repoNameInput, setRepoNameInput] = useState('GitProfileStats');

  // README Generator states
  const [readmeCards, setReadmeCards] = useState<Record<CardType, boolean>>({
    profile: true,
    stats: true,
    languages: true,
    streak: true,
    repository: true,
    trophies: true,
    'top-contributed': true,
    rankings: true,
  });
  const [readmeLayout, setReadmeLayout] = useState<'vertical' | 'centered' | 'grid'>('vertical');
  const [customApiHost, setCustomApiHost] = useState(() => {
    if (typeof window !== 'undefined') {
      return env.NEXT_PUBLIC_API_URL || window.location.origin;
    }
    return '';
  });
  const [readmeCopied, setReadmeCopied] = useState(false);

  const [isPatVerified, setIsPatVerified] = useState(false);

  // Global UI controls
  const [globalZoom, setGlobalZoom] = useState(1);
  const [usernameInput, setUsernameInput] = useState('octocat');

  // Individual card state values
  const [cards, setCards] = useState<Record<CardType, CardState>>({
    profile: { svg: '', loading: true, error: null, copied: null, tab: 'preview', zoom: 1 },
    stats: { svg: '', loading: true, error: null, copied: null, tab: 'preview', zoom: 1 },
    languages: { svg: '', loading: true, error: null, copied: null, tab: 'preview', zoom: 1 },
    streak: { svg: '', loading: true, error: null, copied: null, tab: 'preview', zoom: 1 },
    repository: { svg: '', loading: true, error: null, copied: null, tab: 'preview', zoom: 1 },
    trophies: { svg: '', loading: true, error: null, copied: null, tab: 'preview', zoom: 1 },
    'top-contributed': { svg: '', loading: true, error: null, copied: null, tab: 'preview', zoom: 1 },
    rankings: { svg: '', loading: true, error: null, copied: null, tab: 'preview', zoom: 1 },
  });

  // Verify auth session on load
  useEffect(() => {
    // Prefill username with logged-in user profile
    const fetchProfile = async () => {
      try {
        const apiBase = env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiBase}/api/v1/users/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.username) {
            setUsername(data.data.username);
            setIsPatVerified(Boolean(data.data.hasGithubToken));
            setUsernameInput(data.data.username);

            // Prefill with backend user settings if available
            if (data.data.settings) {
              const { preferredTheme, defaultCardStyle, defaultCardVisibility } =
                data.data.settings;
              if (preferredTheme) {
                setSelectedTheme(preferredTheme);
              }
              if (defaultCardStyle) {
                if (defaultCardStyle === 'glassmorphism') {
                  setCustomBackground('#090d16');
                  setBorderRadius(16);
                  setHideBorder(false);
                } else if (defaultCardStyle === 'modern') {
                  setCustomBackground('#121212');
                  setBorderRadius(12);
                  setHideBorder(false);
                } else if (defaultCardStyle === 'minimal') {
                  setBorderRadius(0);
                  setHideBorder(true);
                } else {
                  setCustomBackground('');
                  setBorderRadius(10);
                  setHideBorder(false);
                }
              }
              if (defaultCardVisibility) {
                setReadmeCards({
                  profile: defaultCardVisibility.profile ?? true,
                  stats: defaultCardVisibility.stats ?? true,
                  languages: defaultCardVisibility.languages ?? true,
                  streak: defaultCardVisibility.streak ?? true,
                  repository: defaultCardVisibility.repository ?? true,
                  trophies: defaultCardVisibility.trophies ?? true,
                  'top-contributed': defaultCardVisibility.topContributed ?? true,
                  rankings: defaultCardVisibility.rankings ?? true,
                });
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      }
    };

    fetchProfile();
  }, [router]);

  // Fetch SVG for a single card type
  const fetchCard = React.useCallback(
    async (type: CardType) => {
      setCards((prev) => ({
        ...prev,
        [type]: { ...prev[type], loading: true, error: null },
      }));

      try {
        const apiBase = env.NEXT_PUBLIC_API_URL;
        // Construct query parameters
        const params = new URLSearchParams();
        if (type === 'repository') {
          params.append('owner', username);
          params.append('repo', repoName);
        } else {
          params.append('username', username);
        }
        params.append('theme', selectedTheme);

        if (type === 'languages') {
          params.append('langs_count', langsCount.toString());
        }

        if (type === 'top-contributed') {
          params.append('limit', contribLimit.toString());
        }

        if (customAccent) {
          params.append('accent', customAccent.replace('#', ''));
        }
        if (customBackground) {
          params.append('background', customBackground.replace('#', ''));
        }
        params.append('border_radius', borderRadius.toString());
        if (hideBorder) {
          params.append('hide_border', 'true');
        }
        if (fontStyle && fontStyle !== 'sans') {
          params.append('font_style', fontStyle);
        }

        const url = `${apiBase}/api/cards/${type}.svg?${params.toString()}`;
        const response = await fetch(url, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to load card (${response.status} ${response.statusText})`);
        }

        const svgContent = await response.text();
        if (!svgContent.startsWith('<svg')) {
          throw new Error('Invalid response content: Expected SVG XML structure.');
        }

        setCards((prev) => ({
          ...prev,
          [type]: { ...prev[type], svg: svgContent, loading: false, error: null },
        }));
      } catch (err: unknown) {
        console.error(`Error loading SVG for ${type}:`, err);
        const errorMsg =
          err instanceof Error ? err.message : 'Failed to load dynamic card from backend server.';
        setCards((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            loading: false,
            error: errorMsg,
          },
        }));
      }
    },
    [
      username,
      repoName,
      selectedTheme,
      langsCount,
      contribLimit,
      customAccent,
      customBackground,
      borderRadius,
      hideBorder,
      fontStyle,
    ]
  );

  // Main effect to fetch SVGs when parameters change
  useEffect(() => {
    const types: CardType[] = [
      'profile',
      'stats',
      'languages',
      'streak',
      'repository',
      'trophies',
      'top-contributed',
      'rankings',
    ];

    types.forEach((type) => {
      fetchCard(type);
    });
  }, [fetchCard]);

  // Apply global zoom value when updated
  const handleGlobalZoomChange = (val: number) => {
    setGlobalZoom(val);
    setCards((prev) => ({
      profile: { ...prev.profile, zoom: val },
      stats: { ...prev.stats, zoom: val },
      languages: { ...prev.languages, zoom: val },
      streak: { ...prev.streak, zoom: val },
      repository: { ...prev.repository, zoom: val },
      trophies: { ...prev.trophies, zoom: val },
      'top-contributed': { ...prev['top-contributed'], zoom: val },
      rankings: { ...prev.rankings, zoom: val },
    }));
  };

  // Adjust card-level zoom levels
  const setCardZoom = (type: CardType, zoomVal: number) => {
    setCards((prev) => ({
      ...prev,
      [type]: { ...prev[type], zoom: Math.max(0.4, Math.min(2.5, zoomVal)) },
    }));
  };

  // Switch tabs in a card preview container
  const setCardTab = (type: CardType, tab: 'preview' | 'embed' | 'source') => {
    setCards((prev) => ({
      ...prev,
      [type]: { ...prev[type], tab },
    }));
  };

  // Trigger Apply for Username updates
  const handleApplyUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setUsername(usernameInput.trim());
    }
    if (repoNameInput.trim()) {
      setRepoName(repoNameInput.trim());
    }
  };

  // Build the embed code strings
  const getEmbedCode = (type: CardType, format: 'url' | 'markdown' | 'html') => {
    const apiBase = env.NEXT_PUBLIC_API_URL;
    const params = new URLSearchParams();
    if (type === 'repository') {
      params.append('owner', username);
      params.append('repo', repoName);
    } else {
      params.append('username', username);
    }
    params.append('theme', selectedTheme);
    if (type === 'languages') {
      params.append('langs_count', langsCount.toString());
    }
    if (type === 'top-contributed') {
      params.append('limit', contribLimit.toString());
    }
    if (customAccent) {
      params.append('accent', customAccent.replace('#', ''));
    }
    if (customBackground) {
      params.append('background', customBackground.replace('#', ''));
    }
    params.append('border_radius', borderRadius.toString());
    if (hideBorder) {
      params.append('hide_border', 'true');
    }
    if (fontStyle && fontStyle !== 'sans') {
      params.append('font_style', fontStyle);
    }
    const endpoint = `${apiBase}/api/cards/${type}.svg?${params.toString()}`;

    if (format === 'url') return endpoint;
    if (format === 'markdown') return `![GitHub Profile Stats Card](${endpoint})`;
    return `<img src="${endpoint}" alt="GitHub Profile Stats Card" />`;
  };

  // Copy code blocks to clipboard helper
  const handleCopy = async (type: CardType, format: 'url' | 'markdown' | 'html' | 'svg') => {
    let content = '';
    if (format === 'svg') {
      content = cards[type].svg;
    } else {
      content = getEmbedCode(type, format);
    }

    try {
      await navigator.clipboard.writeText(content);
      setCards((prev) => ({
        ...prev,
        [type]: { ...prev[type], copied: format },
      }));
      setTimeout(() => {
        setCards((prev) => ({
          ...prev,
          [type]: { ...prev[type], copied: null },
        }));
      }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Download raw SVG helper
  const handleDownloadSVG = (type: CardType) => {
    const svgBlob = new Blob([cards[type].svg], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${username}-${type}-card.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  // Generate GitHub Profile README Markdown
  const generateReadmeMarkdown = () => {
    const host =
      customApiHost ||
      env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '');

    const getCardUrl = (type: CardType) => {
      const params = new URLSearchParams();
      if (type === 'repository') {
        params.append('owner', username);
        params.append('repo', repoName);
      } else {
        params.append('username', username);
      }
      params.append('theme', selectedTheme);
      if (type === 'languages') {
        params.append('langs_count', langsCount.toString());
      }
      if (type === 'top-contributed') {
        params.append('limit', contribLimit.toString());
      }
      if (customAccent) {
        params.append('accent', customAccent.replace('#', ''));
      }
      if (customBackground) {
        params.append('background', customBackground.replace('#', ''));
      }
      params.append('border_radius', borderRadius.toString());
      if (hideBorder) {
        params.append('hide_border', 'true');
      }
      if (fontStyle && fontStyle !== 'sans') {
        params.append('font_style', fontStyle);
      }

      return `${host}/api/cards/${type}.svg?${params.toString()}`;
    };

    const activeTypes = (Object.keys(CARD_INFOS) as CardType[]).filter((type) => readmeCards[type]);

    if (activeTypes.length === 0) {
      return '<!-- No cards selected. Enable cards in the configuration block to generate markdown. -->';
    }

    if (readmeLayout === 'vertical') {
      return activeTypes
        .map((type) => {
          const title = CARD_INFOS[type].title;
          const href =
            type === 'repository'
              ? `https://github.com/${username}/${repoName}`
              : `https://github.com/${username}`;
          return `[![${title}](${getCardUrl(type)})](${href})`;
        })
        .join('\n\n');
    } else if (readmeLayout === 'centered') {
      const imagesHtml = activeTypes
        .map((type) => {
          const title = CARD_INFOS[type].title;
          const height = CARD_INFOS[type].defaultHeight;
          const href =
            type === 'repository'
              ? `https://github.com/${username}/${repoName}`
              : `https://github.com/${username}`;
          return `  <a href="${href}">\n    <img src="${getCardUrl(type)}" alt="${title}" height="${height}" />\n  </a>`;
        })
        .join('\n  <br />\n\n');

      return `<p align="center">\n${imagesHtml}\n</p>`;
    } else {
      // Grid/Dashboard layout
      let markdown = `<p align="center">\n`;

      if (readmeCards.profile) {
        markdown += `  <a href="https://github.com/${username}">\n    <img src="${getCardUrl('profile')}" alt="Profile Card" height="120" />\n  </a>\n  <br />\n`;
      }

      const gridCards = activeTypes.filter((t) => t !== 'profile');
      if (gridCards.length > 0) {
        markdown += `  <br />\n`;
        gridCards.forEach((type, idx) => {
          const title = CARD_INFOS[type].title;
          const height = CARD_INFOS[type].defaultHeight;
          const href =
            type === 'repository'
              ? `https://github.com/${username}/${repoName}`
              : `https://github.com/${username}`;
          markdown += `  <a href="${href}">\n    <img src="${getCardUrl(type)}" alt="${title}" height="${height}" />\n  </a>`;
          if (idx < gridCards.length - 1) {
            markdown += `\n`;
          }
        });
        markdown += `\n`;
      }

      markdown += `</p>`;
      return markdown;
    }
  };

  const handleCopyReadme = async () => {
    const content = generateReadmeMarkdown();
    try {
      await navigator.clipboard.writeText(content);
      setReadmeCopied(true);
      setTimeout(() => {
        setReadmeCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Copy README markdown failed:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full relative">
      {!isOnline && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between px-6 py-4 rounded-3xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400 backdrop-blur-md shadow-lg shadow-amber-950/20 animate-in fade-in duration-300 gap-4 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-white font-bold block text-sm">Offline Mode Active</strong>
              <span className="text-zinc-400">
                You are currently disconnected from the internet. Action buttons requiring
                connection are disabled.
              </span>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold rounded-xl transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0 text-center"
          >
            Reconnect & Retry
          </button>
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-8 items-start w-full relative overflow-x-hidden">
        {/* Background neon dots */}
        <div className="w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.1)_0%,transparent_70%)] absolute top-[10%] left-[-5%] opacity-50 pointer-events-none filter blur-[35px]" />
        <div className="w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.08)_0%,transparent_70%)] absolute bottom-[15%] right-[-5%] opacity-50 pointer-events-none filter blur-[35px]" />

        {/* LEFT COLUMN: Controls & customizer sidebar */}
        <aside className="w-full xl:w-80 shrink-0 flex flex-col gap-6 z-10">
          {/* Username Setup Form */}
          <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
            <h4 className="font-extrabold text-xs text-zinc-400 tracking-wider uppercase flex items-center gap-2 border-b border-white/5 pb-3">
              <Terminal className="w-4 h-4 text-violet-400" />
              GitHub Target Config
            </h4>
            <form onSubmit={handleApplyUsername} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Target Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. octocat"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/80 transition-all font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                  Target Repository
                </label>
                <input
                  type="text"
                  placeholder="e.g. GitProfileStats"
                  value={repoNameInput}
                  onChange={(e) => setRepoNameInput(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/80 transition-all font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={!isOnline}
                className="w-full py-2.5 mt-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-bold text-white rounded-xl flex items-center justify-center transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-violet-600/10 disabled:opacity-50 disabled:pointer-events-none"
              >
                {!isOnline ? 'Sync Disabled (Offline)' : 'Apply Targets'}
              </button>
            </form>
            <div className="flex flex-col gap-1.5 px-3 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] text-zinc-400 leading-normal">
              <div className="flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>
                  Username: <strong className="text-white font-semibold">@{username}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span>
                  Repository: <strong className="text-white font-semibold">{repoName}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Theme Settings Selector */}
          <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
            <h4 className="font-extrabold text-xs text-zinc-400 tracking-wider uppercase flex items-center gap-2 border-b border-white/5 pb-3">
              <Sliders className="w-4 h-4 text-violet-400" />
              Card Theme Select
            </h4>
            <div className="flex flex-col gap-2">
              {THEME_SWATCHES.map((swatch) => (
                <button
                  key={swatch.id}
                  onClick={() => setSelectedTheme(swatch.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer group ${
                    selectedTheme === swatch.id
                      ? 'bg-white/5 border-violet-500/50 shadow-inner'
                      : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white">{swatch.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{swatch.id}</span>
                  </div>
                  {/* Theme Palette Swatch preview dots */}
                  <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1.5 rounded-lg border border-white/5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: swatch.bg }}
                      title="Background"
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: swatch.text }}
                      title="Text color"
                    />
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: swatch.accent }}
                      title="Accent color"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Card Style Customizer */}
          <div className="glass-card rounded-3xl p-6 flex flex-col gap-5">
            <h4 className="font-extrabold text-xs text-zinc-400 tracking-wider uppercase flex items-center gap-2 border-b border-white/5 pb-3">
              <Sliders className="w-4 h-4 text-violet-400" />
              Style Customizer
            </h4>

            {/* Accent Color Customizer */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Accent Color
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {[
                  { hex: '', name: 'Default' },
                  { hex: '58a6ff', name: 'Blue' },
                  { hex: '10b981', name: 'Emerald' },
                  { hex: 'ef4444', name: 'Ruby' },
                  { hex: 'f59e0b', name: 'Amber' },
                  { hex: 'a855f7', name: 'Purple' },
                ].map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setCustomAccent(color.hex ? `#${color.hex}` : '')}
                    className={`w-6 h-6 rounded-full border transition-all relative flex items-center justify-center cursor-pointer ${
                      (color.hex === '' && customAccent === '') ||
                      (color.hex !== '' && customAccent === `#${color.hex}`)
                        ? 'border-violet-500 ring-2 ring-violet-500/20 scale-110'
                        : 'border-white/10 hover:scale-105'
                    }`}
                    style={{
                      background: color.hex
                        ? `#${color.hex}`
                        : 'linear-gradient(135deg, #58a6ff, #2ea44f)',
                    }}
                    title={color.name}
                  >
                    {((color.hex === '' && customAccent === '') ||
                      (color.hex !== '' && customAccent === `#${color.hex}`)) && (
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    )}
                  </button>
                ))}

                {/* Custom Color Input */}
                <div className="relative w-8 h-8 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center group overflow-hidden">
                  <input
                    type="color"
                    value={customAccent || '#58a6ff'}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Custom Accent Color"
                  />
                  <div
                    className="w-5 h-5 rounded-lg border border-white/10"
                    style={{ backgroundColor: customAccent || '#58a6ff' }}
                  />
                </div>
              </div>
            </div>

            {/* Background Color Customizer */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Background Color
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                {[
                  { hex: '', name: 'Default' },
                  { hex: '0d1117', name: 'GitHub' },
                  { hex: '090d16', name: 'Slate' },
                  { hex: '121212', name: 'Charcoal' },
                  { hex: 'ffffff', name: 'Light' },
                ].map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setCustomBackground(color.hex ? `#${color.hex}` : '')}
                    className={`w-6 h-6 rounded-full border transition-all relative flex items-center justify-center cursor-pointer ${
                      (color.hex === '' && customBackground === '') ||
                      (color.hex !== '' && customBackground === `#${color.hex}`)
                        ? 'border-violet-500 ring-2 ring-violet-500/20 scale-110'
                        : 'border-white/10 hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: color.hex ? `#${color.hex}` : '#161b22',
                    }}
                    title={color.name}
                  >
                    {((color.hex === '' && customBackground === '') ||
                      (color.hex !== '' && customBackground === `#${color.hex}`)) && (
                      <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                    )}
                  </button>
                ))}

                {/* Custom Color Input */}
                <div className="relative w-8 h-8 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center group overflow-hidden">
                  <input
                    type="color"
                    value={customBackground || '#0d1117'}
                    onChange={(e) => setCustomBackground(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    title="Custom Background Color"
                  />
                  <div
                    className="w-5 h-5 rounded-lg border border-white/10"
                    style={{ backgroundColor: customBackground || '#0d1117' }}
                  />
                </div>
              </div>
            </div>

            {/* Border Radius Customizer */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-medium">Border Radius</span>
                <span className="font-bold text-violet-400 font-mono">{borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={borderRadius}
                onChange={(e) => setBorderRadius(parseInt(e.target.value))}
                className="w-full accent-violet-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Hide Border Toggle */}
            <div className="flex items-center justify-between border-t border-white/5 pt-3">
              <span id="hide-border-label" className="text-xs text-zinc-300 font-medium">
                Hide Card Border
              </span>
              <button
                onClick={() => setHideBorder(!hideBorder)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  hideBorder ? 'bg-violet-600' : 'bg-zinc-800'
                }`}
                role="switch"
                aria-checked={hideBorder}
                aria-labelledby="hide-border-label"
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                    hideBorder ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Font Style Dropdown */}
            <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wide">
                Font Style
              </label>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/80 transition-all font-semibold"
              >
                <option value="sans">Sans-Serif (Default)</option>
                <option value="serif">Elegant Serif</option>
                <option value="mono">Developer Mono</option>
                <option value="rounded">Modern Rounded</option>
              </select>
            </div>

            {/* Reset Style Settings */}
            {(customAccent !== '' ||
              customBackground !== '' ||
              borderRadius !== 10 ||
              hideBorder ||
              fontStyle !== 'sans') && (
              <button
                onClick={() => {
                  setCustomAccent('');
                  setCustomBackground('');
                  setBorderRadius(10);
                  setHideBorder(false);
                  setFontStyle('sans');
                }}
                className="w-full mt-1.5 py-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 font-bold tracking-wide uppercase transition-all cursor-pointer"
              >
                Reset Custom Styles
              </button>
            )}
          </div>

          {/* Advanced Options panel */}
          <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
            <h4 className="font-extrabold text-xs text-zinc-400 tracking-wider uppercase flex items-center gap-2 border-b border-white/5 pb-3">
              <Settings className="w-4 h-4 text-violet-400" />
              Fine Tune Settings
            </h4>

            {/* Languages Limit Count */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-medium">Languages Count</span>
                <span className="font-bold text-violet-400 font-mono">{langsCount} languages</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={langsCount}
                onChange={(e) => setLangsCount(parseInt(e.target.value))}
                className="w-full accent-violet-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[9px] text-zinc-500 leading-tight">
                Adjusts the number of top languages rendering on the language breakdown card.
              </span>
            </div>

            {/* Top Contributed Repos Limit */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-medium">Contributed Repos Limit</span>
                <span className="font-bold text-violet-400 font-mono">{contribLimit} repos</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={contribLimit}
                onChange={(e) => setContribLimit(parseInt(e.target.value))}
                className="w-full accent-violet-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[9px] text-zinc-500 leading-tight">
                Adjusts the maximum number of repositories listed in the top contributed card.
              </span>
            </div>

            {/* Token usage indicator */}
            <div className="border-t border-white/5 pt-4 mt-1 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-300 font-medium">GitHub PAT Status</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    isPatVerified
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-800 border border-white/5 text-zinc-400'
                  }`}
                >
                  {isPatVerified ? 'Active' : 'Optional (OAuth Active)'}
                </span>
              </div>
              <p className="text-[9px] text-zinc-500 leading-relaxed">
                Standard public metrics are active. A Personal Access Token is optional for private repo metrics or higher rate limits.
              </p>
            </div>
          </div>

          {/* Global Zoom tool */}
          <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
            <h4 className="font-extrabold text-xs text-zinc-400 tracking-wider uppercase flex items-center gap-2 border-b border-white/5 pb-3">
              <Maximize2 className="w-4 h-4 text-violet-400" />
              Global Canvas Zoom
            </h4>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-zinc-300">Scale All Previews</span>
                <span className="font-mono text-violet-400">{Math.round(globalZoom * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleGlobalZoomChange(Math.max(0.5, globalZoom - 0.1))}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                >
                  -
                </button>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={globalZoom}
                  onChange={(e) => handleGlobalZoomChange(parseFloat(e.target.value))}
                  className="flex-1 accent-violet-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                />
                <button
                  onClick={() => handleGlobalZoomChange(Math.min(2.0, globalZoom + 0.1))}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 text-xs font-bold transition-all cursor-pointer"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => handleGlobalZoomChange(1.0)}
                disabled={globalZoom === 1.0}
                className="w-full mt-1.5 py-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 font-bold tracking-wide uppercase transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                Reset All to 100%
              </button>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: The preview grid containing the card preview modules */}
        <section className="flex-1 w-full flex flex-col gap-6 z-10">
          {/* Main Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01] border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-violet-500" />
                Card Preview Studio
              </h1>
              <p className="text-sm text-zinc-400 mt-1 max-w-xl">
                Live design playground. Customize theme palettes, preview mock layouts, and copy
                visual widget embed scripts to configure on your GitHub Profile README.
              </p>
            </div>
            {/* Status indicators */}
            <div className="flex gap-2 self-start sm:self-center">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Live synchronization
              </span>
            </div>
          </div>

          {/* The Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(Object.keys(CARD_INFOS) as CardType[]).map((type) => {
              const card = cards[type];
              const info = CARD_INFOS[type];

              return (
                <div
                  key={type}
                  className="glass-card rounded-3xl p-6 flex flex-col gap-4 relative group"
                >
                  {/* Individual Card Container Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-1.5">
                        {info.title}
                      </h3>
                      <p className="text-zinc-500 text-xs truncate max-w-[200px] sm:max-w-[300px]">
                        {info.desc}
                      </p>
                    </div>

                    {/* Header control buttons */}
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                      {/* Zoom actions */}
                      <button
                        onClick={() => setCardZoom(type, card.zoom - 0.1)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                        title="Zoom Out"
                      >
                        <ZoomOut className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-[10px] text-zinc-500 font-mono px-1 font-bold min-w-[32px] text-center">
                        {Math.round(card.zoom * 100)}%
                      </span>
                      <button
                        onClick={() => setCardZoom(type, card.zoom + 0.1)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                        title="Zoom In"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setCardZoom(type, 1.0)}
                        disabled={card.zoom === 1.0}
                        className="p-1 text-[9px] font-bold text-zinc-500 hover:text-violet-400 rounded transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        title="Reset Zoom"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Sub-Navigation tabs for Preview, Embed Snippet, SVG source */}
                  <div
                    className="flex items-center gap-1.5"
                    role="tablist"
                    aria-label={`${CARD_INFOS[type].title} options`}
                  >
                    {(['preview', 'embed', 'source'] as const).map((tabName) => (
                      <button
                        key={tabName}
                        id={`tab-${type}-${tabName}`}
                        onClick={() => setCardTab(type, tabName)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                          card.tab === tabName
                            ? 'bg-violet-600/10 text-violet-400 border border-violet-500/20'
                            : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                        }`}
                        role="tab"
                        aria-selected={card.tab === tabName}
                        aria-controls={`tabpanel-${type}-${tabName}`}
                      >
                        {tabName}
                      </button>
                    ))}

                    {/* Download Action on side */}
                    <button
                      onClick={() => handleDownloadSVG(type)}
                      disabled={card.loading || !!card.error}
                      className="ml-auto p-1.5 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                      title="Download SVG File"
                      aria-label={`Download ${CARD_INFOS[type].title} SVG file`}
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Content Viewport Frame */}
                  <div
                    id={`tabpanel-${type}-${card.tab}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${type}-${card.tab}`}
                    className="relative rounded-2xl bg-black/40 border border-white/5 overflow-hidden flex items-center justify-center p-6 min-h-[260px] max-h-[360px]"
                  >
                    {/* 1. PREVIEW TAB */}
                    {card.tab === 'preview' && (
                      <>
                        {card.loading && (
                          <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#030014]/50 backdrop-blur-md">
                            <div
                              style={{
                                width: '100%',
                                maxWidth: `${info.defaultWidth}px`,
                                aspectRatio: `${info.defaultWidth} / ${info.defaultHeight}`,
                              }}
                              className="glass-card rounded-[10px] border border-white/5 relative overflow-hidden flex flex-col justify-between p-5 animate-pulse"
                            >
                              {/* Glossy shimmer effect overlay */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-shimmer" />

                              <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <div className="flex gap-2 items-center">
                                  <div className="w-8 h-8 rounded-lg bg-white/5" />
                                  <div className="flex flex-col gap-1.5">
                                    <div className="h-3.5 w-24 bg-white/5 rounded-md" />
                                    <div className="h-2 w-16 bg-white/5 rounded-sm" />
                                  </div>
                                </div>
                                <div className="h-6 w-12 bg-white/5 rounded-md" />
                              </div>

                              <div className="flex flex-col gap-3 py-3">
                                <div className="h-3 w-3/4 bg-white/5 rounded-sm" />
                                <div className="h-3 w-1/2 bg-white/5 rounded-sm" />
                              </div>

                              <div className="h-4 w-full bg-white/5 rounded-md mt-auto" />
                            </div>
                          </div>
                        )}

                        {card.error && (
                          <div className="p-5 text-center flex flex-col items-center gap-3.5 max-w-[320px] animate-in fade-in duration-300">
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/5">
                              <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                              <h5 className="font-extrabold text-sm text-white">
                                Widget Preview Blocked
                              </h5>
                              <p className="text-[10px] text-zinc-500 leading-relaxed mt-1">
                                {card.error}. Common triggers include bad token configurations,
                                missing public repo files, or API limits.
                              </p>
                            </div>
                            <button
                              onClick={() => fetchCard(type)}
                              className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                            >
                              Retry Loading
                            </button>
                          </div>
                        )}

                        {!card.loading && !card.error && card.svg && (
                          <div className="overflow-hidden max-w-full flex items-center justify-center p-3 select-none w-full">
                            <div
                              style={{
                                transform: `scale(${card.zoom})`,
                                transformOrigin: 'center center',
                                transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                                width: '100%',
                                maxWidth: `${info.defaultWidth}px`,
                                aspectRatio: `${info.defaultWidth} / ${info.defaultHeight}`,
                              }}
                              className="flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full"
                              dangerouslySetInnerHTML={{ __html: card.svg }}
                            />
                          </div>
                        )}
                      </>
                    )}

                    {/* 2. EMBED INSTRUCTIONS TAB */}
                    {card.tab === 'embed' && (
                      <div className="w-full h-full flex flex-col gap-4 text-left p-2 overflow-y-auto">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                              Markdown Embed
                            </span>
                            <button
                              onClick={() => handleCopy(type, 'markdown')}
                              className="text-[10px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {card.copied === 'markdown' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Code</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="bg-black/60 rounded-xl border border-white/5 p-3 font-mono text-[10px] text-zinc-300 break-all select-all leading-normal">
                            {getEmbedCode(type, 'markdown')}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                              HTML Embed
                            </span>
                            <button
                              onClick={() => handleCopy(type, 'html')}
                              className="text-[10px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {card.copied === 'html' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Code</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="bg-black/60 rounded-xl border border-white/5 p-3 font-mono text-[10px] text-zinc-300 break-all select-all leading-normal">
                            {getEmbedCode(type, 'html')}
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                              Direct API URL
                            </span>
                            <button
                              onClick={() => handleCopy(type, 'url')}
                              className="text-[10px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {card.copied === 'url' ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span className="text-emerald-400">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy URL</span>
                                </>
                              )}
                            </button>
                          </div>
                          <div className="bg-black/60 rounded-xl border border-white/5 p-3 font-mono text-[10px] text-zinc-300 break-all select-all leading-normal">
                            {getEmbedCode(type, 'url')}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 3. SVG SOURCE TAB */}
                    {card.tab === 'source' && (
                      <div className="w-full h-full flex flex-col gap-2 p-1 text-left relative">
                        <div className="flex justify-between items-center pb-1">
                          <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono">
                            {card.svg
                              ? `${Math.round((card.svg.length / 1024) * 10) / 10} KB`
                              : '0 KB'}
                          </span>
                          <button
                            onClick={() => handleCopy(type, 'svg')}
                            disabled={!card.svg}
                            className="text-[10px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                          >
                            {card.copied === 'svg' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied SVG!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Source</span>
                              </>
                            )}
                          </button>
                        </div>
                        <textarea
                          readOnly
                          value={card.svg || 'No SVG data loaded.'}
                          className="w-full h-[220px] bg-black/60 border border-white/5 rounded-xl p-3 font-mono text-[9px] text-zinc-400 focus:outline-none resize-none leading-relaxed select-all"
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer specs details block */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono bg-white/[0.01] px-4 py-2 border border-white/5 rounded-xl">
                    <span>
                      Aspect: {info.defaultWidth} × {info.defaultHeight} px
                    </span>
                    <span>Format: XML Vector SVG</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* GitHub Profile README Markdown Generator */}
          <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden mt-6 border border-white/10 shadow-2xl">
            {/* Neon inner glow */}
            <div className="w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] absolute -top-10 -right-10 opacity-60 pointer-events-none filter blur-[30px]" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5 z-10">
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-violet-400" />
                  GitHub README Markdown Generator
                </h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  Select your cards, pick a layout, and copy the unified markdown to display this
                  stats suite directly on your GitHub Profile README.
                </p>
              </div>
              {/* Warning if localhost is used */}
              {customApiHost.includes('localhost') && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[11px] font-semibold animate-pulse-slow self-start md:self-center">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>
                    Local Host Warning: SVGs won&apos;t render on GitHub until you use a public
                    domain.
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
              {/* Left side: Controls */}
              <div className="lg:col-span-5 flex flex-col gap-5">
                {/* Card Toggles */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Included Cards
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(CARD_INFOS) as CardType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setReadmeCards((prev) => ({ ...prev, [type]: !prev[type] }))}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                          readmeCards[type]
                            ? 'bg-violet-600/10 border-violet-500/50 text-white font-bold'
                            : 'bg-white/[0.01] border-white/5 text-zinc-500 hover:border-white/10'
                        }`}
                      >
                        <span className="text-xs">
                          {CARD_INFOS[type].title.replace(' Card', '')}
                        </span>
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${
                            readmeCards[type]
                              ? 'bg-violet-500 border-violet-400 text-white'
                              : 'border-white/20'
                          }`}
                        >
                          {readmeCards[type] && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Layout Picker */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Layout Template
                  </label>
                  <div className="flex flex-col gap-2">
                    {[
                      {
                        id: 'vertical',
                        name: 'Vertical Stack',
                        desc: 'Cards stacked using markdown image links',
                      },
                      {
                        id: 'centered',
                        name: 'Centered Stack',
                        desc: 'HTML centered alignment, neat and readable',
                      },
                      {
                        id: 'grid',
                        name: 'Dashboard Grid',
                        desc: 'Profile card on top, remaining cards side-by-side',
                      },
                    ].map((layout) => (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() =>
                          setReadmeLayout(layout.id as 'vertical' | 'centered' | 'grid')
                        }
                        className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col gap-0.5 ${
                          readmeLayout === layout.id
                            ? 'bg-violet-600/10 border-violet-500/50 text-white font-bold'
                            : 'bg-white/[0.01] border-white/5 text-zinc-400 hover:border-white/10'
                        }`}
                      >
                        <span className="text-xs">{layout.name}</span>
                        <span className="text-[10px] text-zinc-500 font-normal leading-normal">
                          {layout.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* API Base Host Override */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-violet-400" />
                    API Host URL
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. https://your-domain.com"
                    value={customApiHost}
                    onChange={(e) => setCustomApiHost(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/80 transition-all font-mono"
                  />
                  <span className="text-[9px] text-zinc-500 leading-normal">
                    Define the host URL where your profile stats service API endpoints are deployed.
                  </span>
                </div>
              </div>

              {/* Right side: Code Output & Quick Copy */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Generated Markdown Source
                  </span>

                  <button
                    type="button"
                    onClick={handleCopyReadme}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-violet-600/10"
                  >
                    {readmeCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy README Markdown</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="relative flex-1 min-h-[220px] rounded-2xl bg-black/60 border border-white/5 overflow-hidden flex flex-col">
                  <textarea
                    readOnly
                    value={generateReadmeMarkdown()}
                    className="w-full h-full min-h-[260px] bg-transparent p-4 font-mono text-[10px] text-zinc-300 focus:outline-none resize-none leading-relaxed select-all"
                  />
                </div>

                <div className="flex items-start gap-2.5 p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl text-[10px] text-zinc-400 leading-normal">
                  <Info className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tip:</strong> Create a GitHub repository with the name matching your
                    username (e.g. <code>github.com/octocat/octocat</code>), create a{' '}
                    <code>README.md</code> file inside it, and paste this markdown code to enable
                    the widgets.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
