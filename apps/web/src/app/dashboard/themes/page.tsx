'use client';

import React, { useState, useEffect } from 'react';
import { env } from '@/config/env';
import { useRouter } from 'next/navigation';
import {
  Palette,
  Terminal,
  Info,
  RefreshCw,
  Copy,
  Check,
  Code2,
  AlertTriangle,
  Download,
} from 'lucide-react';

// Themes information matching the backend
const THEMES_INFO = [
  {
    id: 'dark',
    name: 'Dark Default',
    desc: 'Sleek and professional dark mode',
    bg: '#0d1117',
    border: '#30363d',
    text: '#c9d1d9',
    accent: '#58a6ff',
    secondary: '#8b949e',
  },
  {
    id: 'light',
    name: 'Light Mode',
    desc: 'Clean, crisp and classic bright look',
    bg: '#ffffff',
    border: '#d0d7de',
    text: '#24292f',
    accent: '#0969da',
    secondary: '#57606a',
  },
  {
    id: 'github',
    name: 'GitHub Green',
    desc: 'Vibrant developer-focused green theme',
    bg: '#0d1117',
    border: '#30363d',
    text: '#c9d1d9',
    accent: '#2ea44f',
    secondary: '#8b949e',
  },
  {
    id: 'dracula',
    name: 'Dracula Classic',
    desc: 'Vibrant high-contrast hacker aesthetic',
    bg: '#282a36',
    border: '#44475a',
    text: '#f8f8f2',
    accent: '#50fa7b',
    secondary: '#6272a4',
  },
  {
    id: 'nord',
    name: 'Nord Arctic',
    desc: 'Chilly, clean, and cool north-sea design',
    bg: '#2e3440',
    border: '#3b4252',
    text: '#d8dee9',
    accent: '#88c0d0',
    secondary: '#4c566a',
  },
];

type CardType = 'profile' | 'stats' | 'languages' | 'streak' | 'repository' | 'trophies' | 'top-contributed' | 'rankings';

interface CardConfig {
  title: string;
  desc: string;
  defaultWidth: number;
  defaultHeight: number;
}

const CARD_TYPES: Record<CardType, CardConfig> = {
  profile: {
    title: 'Profile Card',
    desc: 'Compact developer identity overview',
    defaultWidth: 800,
    defaultHeight: 120,
  },
  stats: {
    title: 'Stats Card',
    desc: 'Repository count, stars, forks, commits, and issues tracker',
    defaultWidth: 440,
    defaultHeight: 195,
  },
  languages: {
    title: 'Languages Card',
    desc: 'Breakdown of coding languages and bytes written',
    defaultWidth: 440,
    defaultHeight: 195,
  },
  streak: {
    title: 'Streak Card',
    desc: 'Contributions count, current coding streak, and longest streak',
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

interface PreviewState {
  svg: string;
  loading: boolean;
  error: string | null;
  copied: 'url' | 'markdown' | 'html' | 'svg' | null;
}

interface UserSettings {
  preferredTheme?: string;
  defaultCardStyle?: string;
  languageSorting?: string;
  defaultCardVisibility?: {
    profile: boolean;
    stats: boolean;
    languages: boolean;
    streak: boolean;
    trophies?: boolean;
    topContributed?: boolean;
    rankings?: boolean;
  };
}

export default function ThemeGalleryPage() {
  const router = useRouter();

  // Target config states
  const [username, setUsername] = useState('octocat');
  const [usernameInput, setUsernameInput] = useState('octocat');
  const [repoName, setRepoName] = useState('GitProfileStats');
  const [repoNameInput, setRepoNameInput] = useState('GitProfileStats');

  // Customization controls
  const [selectedCard, setSelectedCard] = useState<CardType>('profile');
  const [preferredTheme, setPreferredTheme] = useState<string>('dark');
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  // Status triggers
  const [applyingTheme, setApplyingTheme] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Map of previews per theme id
  const [previews, setPreviews] = useState<Record<string, PreviewState>>({
    dark: { svg: '', loading: true, error: null, copied: null },
    light: { svg: '', loading: true, error: null, copied: null },
    github: { svg: '', loading: true, error: null, copied: null },
    dracula: { svg: '', loading: true, error: null, copied: null },
    nord: { svg: '', loading: true, error: null, copied: null },
  });

  // Verify auth session, load user settings to find current preferredTheme
  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const apiBase = env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiBase}/api/v1/users/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            if (data.data.username) {
              setUsername(data.data.username);
              setUsernameInput(data.data.username);
            }
            if (data.data.settings) {
              setUserSettings(data.data.settings);
              if (data.data.settings.preferredTheme) {
                setPreferredTheme(data.data.settings.preferredTheme);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load user profile in theme gallery:', err);
      }
    };

    fetchUserSettings();
  }, [router]);

  // Fetch single theme preview SVG
  const fetchThemePreview = React.useCallback(
    async (themeId: string) => {
      setPreviews((prev) => ({
        ...prev,
        [themeId]: { ...prev[themeId], loading: true, error: null },
      }));

      try {
        const apiBase = env.NEXT_PUBLIC_API_URL;
        const params = new URLSearchParams();
        params.append('theme', themeId);

        let endpoint = '';
        if (selectedCard === 'repository') {
          params.append('owner', username);
          params.append('repo', repoName);
          endpoint = `${apiBase}/api/cards/repository.svg?${params.toString()}`;
        } else {
          params.append('username', username);
          endpoint = `${apiBase}/api/cards/${selectedCard}.svg?${params.toString()}`;
        }

        const response = await fetch(endpoint, {
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const svgContent = await response.text();
        if (!svgContent.startsWith('<svg')) {
          throw new Error('Invalid SVG content response');
        }

        setPreviews((prev) => ({
          ...prev,
          [themeId]: {
            ...prev[themeId],
            svg: svgContent,
            loading: false,
            error: null,
          },
        }));
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error(`Theme gallery error fetching ${selectedCard} for theme ${themeId}:`, error);
        setPreviews((prev) => ({
          ...prev,
          [themeId]: {
            ...prev[themeId],
            loading: false,
            error: error.message || 'Failed to load card.',
          },
        }));
      }
    },
    [username, repoName, selectedCard]
  );

  // Load preview SVGs when username, repo, or selected card change
  useEffect(() => {
    THEMES_INFO.forEach((theme) => {
      fetchThemePreview(theme.id);
    });
  }, [fetchThemePreview]);

  // Handle username/repo form submissions
  const handleApplyTargets = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setUsername(usernameInput.trim());
    }
    if (repoNameInput.trim()) {
      setRepoName(repoNameInput.trim());
    }
  };

  // Helper to construct embed code strings
  const getEmbedCode = (themeId: string, format: 'url' | 'markdown' | 'html') => {
    const apiBase = env.NEXT_PUBLIC_API_URL;
    const params = new URLSearchParams();
    params.append('theme', themeId);

    let endpoint = '';
    if (selectedCard === 'repository') {
      params.append('owner', username);
      params.append('repo', repoName);
      endpoint = `${apiBase}/api/cards/repository.svg?${params.toString()}`;
    } else {
      params.append('username', username);
      endpoint = `${apiBase}/api/cards/${selectedCard}.svg?${params.toString()}`;
    }

    if (format === 'url') return endpoint;
    if (format === 'markdown') return `![GitHub Profile Stats Card](${endpoint})`;
    return `<img src="${endpoint}" alt="GitHub Profile Stats Card" />`;
  };

  // Copy code to clipboard
  const handleCopyCode = async (themeId: string, format: 'url' | 'markdown' | 'html' | 'svg') => {
    let content = '';
    if (format === 'svg') {
      content = previews[themeId].svg;
    } else {
      content = getEmbedCode(themeId, format);
    }

    try {
      await navigator.clipboard.writeText(content);
      setPreviews((prev) => ({
        ...prev,
        [themeId]: { ...prev[themeId], copied: format },
      }));
      setTimeout(() => {
        setPreviews((prev) => ({
          ...prev,
          [themeId]: { ...prev[themeId], copied: null },
        }));
      }, 2000);
    } catch (err) {
      console.error('Copy theme embed code failed:', err);
    }
  };

  // Download raw SVG
  const handleDownloadSVG = (themeId: string) => {
    const svgContent = previews[themeId].svg;
    if (!svgContent) return;
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(svgBlob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `${username}-${themeId}-${selectedCard}-card.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
  };

  // Apply theme as profile default settings
  const handleApplyTheme = async (themeId: string) => {
    setApplyingTheme(themeId);
    setErrorMsg(null);
    setApplySuccess(null);

    try {
      const apiBase = env.NEXT_PUBLIC_API_URL;

      // Merge setting preferences safely
      const updatedSettings = {
        preferredTheme: themeId,
        defaultCardStyle: userSettings?.defaultCardStyle || 'classic',
        languageSorting: userSettings?.languageSorting || 'size',
        defaultCardVisibility: userSettings?.defaultCardVisibility || {
          profile: true,
          stats: true,
          languages: true,
          streak: true,
          trophies: true,
          topContributed: true,
          rankings: true,
        },
      };

      const response = await fetch(`${apiBase}/api/v1/users/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedSettings),
      });

      if (!response.ok) {
        throw new Error(`Failed to update theme options (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setPreferredTheme(themeId);
        setUserSettings(updatedSettings);
        setApplySuccess(themeId);
        setTimeout(() => setApplySuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Theme apply failed.');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Theme gallery error applying theme settings:', error);
      setErrorMsg(error.message || 'Failed to update preferred theme settings.');
    } finally {
      setApplyingTheme(null);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full relative pb-16 overflow-x-hidden">
      {/* Background radial glow */}
      <div className="w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] absolute top-[-5%] left-[-5%] opacity-60 pointer-events-none filter blur-[35px] z-0" />
      <div className="w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.06)_0%,transparent_70%)] absolute bottom-[10%] right-[-5%] opacity-60 pointer-events-none filter blur-[35px] z-0" />

      {/* Floating Status Notification */}
      {applySuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl shadow-xl shadow-emerald-950/20 text-emerald-400 text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Preferred theme updated to{' '}
          <span className="font-extrabold capitalize">{applySuccess}</span>!
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 px-5 py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-medium z-10">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-white/5 pb-6">
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Palette className="w-5 h-5 text-white" />
          </div>
          Theme Gallery
        </h1>
        <p className="text-zinc-400 text-xs mt-2.5 leading-relaxed max-w-3xl font-medium">
          Browse all built-in style designs for your GitHub Profile Cards. Customize targets, select
          a card format, compare live mock templates, and apply templates directly to your dashboard
          settings.
        </p>
      </div>

      {/* Config Form Panel */}
      <div className="glass-card rounded-3xl p-6 flex flex-col lg:flex-row items-center justify-between gap-6 z-10">
        <form
          onSubmit={handleApplyTargets}
          className="flex flex-col sm:flex-row gap-4 items-end w-full lg:w-auto"
        >
          <div className="flex flex-col gap-1.5 w-full sm:w-44">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-medium">
              <Terminal className="w-3.5 h-3.5 text-violet-400" /> Username
            </label>
            <input
              type="text"
              placeholder="Username"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/80 transition-all font-mono"
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-56">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 font-medium">
              <Code2 className="w-3.5 h-3.5 text-violet-400" /> Repository
            </label>
            <input
              type="text"
              placeholder="Repo Name"
              value={repoNameInput}
              onChange={(e) => setRepoNameInput(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500/80 transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            Apply Target
          </button>
        </form>

        <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-[11px] text-zinc-400">
            <Info className="w-4 h-4 text-violet-400 shrink-0" />
            <span className="font-medium">
              Target: <strong className="text-white font-semibold">@{username}</strong>
              {selectedCard === 'repository' && (
                <>
                  {' '}
                  / <strong className="text-white font-semibold">{repoName}</strong>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Card Switcher Navigation */}
      <div className="flex flex-wrap gap-2.5 z-10 border-b border-white/5 pb-4">
        {(Object.keys(CARD_TYPES) as CardType[]).map((type) => {
          const config = CARD_TYPES[type];
          const isSelected = selectedCard === type;
          return (
            <button
              key={type}
              onClick={() => setSelectedCard(type)}
              className={`px-4.5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white/5 border-violet-500/50 text-white shadow-inner'
                  : 'border-white/5 text-zinc-400 hover:text-white hover:bg-white/[0.01]'
              }`}
            >
              {config.title}
            </button>
          );
        })}
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start z-10">
        {THEMES_INFO.map((theme) => {
          const preview = previews[theme.id] || {
            svg: '',
            loading: true,
            error: null,
            copied: null,
          };
          const isActive = preferredTheme === theme.id;
          const isApplying = applyingTheme === theme.id;

          return (
            <div
              key={theme.id}
              className={`glass-card rounded-3xl p-6 flex flex-col gap-5 border transition-all ${
                isActive ? 'border-violet-500/40 ring-1 ring-violet-500/10 shadow-lg' : ''
              }`}
            >
              {/* Theme Header Info */}
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-extrabold text-white flex items-center gap-2">
                    {theme.name}
                    {isActive && (
                      <span className="bg-violet-500/15 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase">
                        Preferred
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium">{theme.desc}</span>
                </div>

                <button
                  disabled={isActive || isApplying}
                  onClick={() => handleApplyTheme(theme.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    isActive
                      ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 cursor-default'
                      : 'border-white/5 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50'
                  }`}
                >
                  {isApplying ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-zinc-400 inline" />
                  ) : isActive ? (
                    'Active'
                  ) : (
                    'Apply Theme'
                  )}
                </button>
              </div>

              {/* Card SVG Preview Container */}
              <div className="w-full flex items-center justify-center p-6 bg-black/40 rounded-2xl border border-white/5 min-h-[220px] relative overflow-hidden group/preview">
                {preview.loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <svg
                      className="animate-spin h-6 w-6 text-violet-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">
                      Loading SVG Preview...
                    </span>
                  </div>
                ) : preview.error ? (
                  <div className="flex flex-col items-center gap-3 p-4 text-center max-w-[80%]">
                    <AlertTriangle className="w-8 h-8 text-rose-500/80 animate-bounce" />
                    <span className="text-[11px] font-bold text-zinc-400 leading-normal">
                      {preview.error}
                    </span>
                    <button
                      onClick={() => fetchThemePreview(theme.id)}
                      className="px-3 py-1.5 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="w-full flex justify-center items-center select-none overflow-hidden py-2">
                    <div
                      className="shrink-0 flex items-center justify-center w-full [&>svg]:w-full [&>svg]:h-full"
                      style={{
                        maxWidth: `${CARD_TYPES[selectedCard].defaultWidth}px`,
                        aspectRatio: `${CARD_TYPES[selectedCard].defaultWidth} / ${CARD_TYPES[selectedCard].defaultHeight}`,
                      }}
                      dangerouslySetInnerHTML={{ __html: preview.svg }}
                    />
                  </div>
                )}
              </div>

              {/* Theme Color Palette Swatches */}
              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Palette Color Swatches
                </span>
                <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                  <div
                    className="w-4 h-4 rounded-full border border-white/10 relative group/swatch cursor-help"
                    style={{ backgroundColor: theme.bg }}
                  >
                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black border border-white/10 text-[9px] font-semibold text-white font-mono opacity-0 pointer-events-none group-hover/swatch:opacity-100 transition-opacity uppercase z-20">
                      bg:{theme.bg}
                    </span>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border border-white/10 relative group/swatch cursor-help"
                    style={{ backgroundColor: theme.text }}
                  >
                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black border border-white/10 text-[9px] font-semibold text-white font-mono opacity-0 pointer-events-none group-hover/swatch:opacity-100 transition-opacity uppercase z-20">
                      text:{theme.text}
                    </span>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border border-white/10 relative group/swatch cursor-help"
                    style={{ backgroundColor: theme.secondary }}
                  >
                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black border border-white/10 text-[9px] font-semibold text-white font-mono opacity-0 pointer-events-none group-hover/swatch:opacity-100 transition-opacity uppercase z-20">
                      muted:{theme.secondary}
                    </span>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border border-white/10 relative group/swatch cursor-help"
                    style={{ backgroundColor: theme.accent }}
                  >
                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black border border-white/10 text-[9px] font-semibold text-white font-mono opacity-0 pointer-events-none group-hover/swatch:opacity-100 transition-opacity uppercase z-20">
                      accent:{theme.accent}
                    </span>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border border-white/10 relative group/swatch cursor-help"
                    style={{ backgroundColor: theme.border }}
                  >
                    <span className="absolute bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black border border-white/10 text-[9px] font-semibold text-white font-mono opacity-0 pointer-events-none group-hover/swatch:opacity-100 transition-opacity uppercase z-20">
                      border:{theme.border}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons (Copy Embed Options) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  disabled={preview.loading || !!preview.error}
                  onClick={() => handleCopyCode(theme.id, 'markdown')}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 hover:text-white font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                  title="Copy GitHub Markdown Embed Code"
                >
                  {preview.copied === 'markdown' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>Markdown</span>
                </button>

                <button
                  disabled={preview.loading || !!preview.error}
                  onClick={() => handleCopyCode(theme.id, 'html')}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 hover:text-white font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                  title="Copy HTML Image Embed Code"
                >
                  {preview.copied === 'html' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>HTML</span>
                </button>

                <button
                  disabled={preview.loading || !!preview.error}
                  onClick={() => handleCopyCode(theme.id, 'url')}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 hover:text-white font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                  title="Copy Direct SVG URL Endpoint Link"
                >
                  {preview.copied === 'url' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>URL</span>
                </button>

                <button
                  disabled={preview.loading || !!preview.error}
                  onClick={() => handleDownloadSVG(theme.id)}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 hover:text-white font-bold uppercase tracking-wider transition-all cursor-pointer active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                  title="Download Raw SVG File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
