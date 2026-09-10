'use client';

import React, { useState, useEffect } from 'react';
import { env } from '@/config/env';
import { useRouter } from 'next/navigation';
import {
  Palette,
  Sliders,
  Eye,
  SortAsc,
  Save,
  RefreshCw,
  Check,
  AlertTriangle,
  KeyRound,
  Lock,
} from 'lucide-react';

// Predefined Themes with color preview swatches
const THEME_OPTIONS = [
  {
    id: 'dark',
    name: 'Dark Default',
    bg: '#0d1117',
    border: '#30363d',
    text: '#c9d1d9',
    accent: '#58a6ff',
    desc: 'Default sleek dark mode',
  },
  {
    id: 'light',
    name: 'Light Mode',
    bg: '#ffffff',
    border: '#d0d7de',
    text: '#24292f',
    accent: '#0969da',
    desc: 'Clean bright look',
  },
  {
    id: 'github',
    name: 'GitHub Green',
    bg: '#0d1117',
    border: '#30363d',
    text: '#c9d1d9',
    accent: '#2ea44f',
    desc: 'Classic GitHub developer styling',
  },
  {
    id: 'dracula',
    name: 'Dracula Classic',
    bg: '#282a36',
    border: '#44475a',
    text: '#f8f8f2',
    accent: '#50fa7b',
    desc: 'Vibrant high-contrast dark theme',
  },
  {
    id: 'nord',
    name: 'Nord Arctic',
    bg: '#2e3440',
    border: '#3b4252',
    text: '#d8dee9',
    accent: '#88c0d0',
    desc: 'Clean and cool clean-room slate',
  },
];

// Card Styles with visual description
const STYLE_OPTIONS = [
  {
    id: 'classic',
    name: 'Classic',
    desc: 'Standard 10px rounded corners with standard thin border',
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    desc: 'Frosted translucent panel style with 16px soft corners',
  },
  {
    id: 'modern',
    name: 'Modern Flat',
    desc: 'Bold flat panel with 12px corners and solid background',
  },
  {
    id: 'minimal',
    name: 'Minimalist',
    desc: 'Borderless layout with sharp 0px corners for absolute minimalism',
  },
];

// Sorting options for language collector card
const SORTING_OPTIONS = [
  {
    id: 'size',
    name: 'Sort by Size (Bytes)',
    desc: 'Show languages based on total bytes of source code written',
  },
  {
    id: 'count',
    name: 'Sort by Repo Count',
    desc: 'Sort languages based on the number of repositories featuring them',
  },
  { id: 'alphabetical', name: 'Alphabetical', desc: 'Order languages standard alphabetically A-Z' },
];

interface SettingsState {
  preferredTheme: string;
  defaultCardStyle: string;
  languageSorting: string;
  defaultCardVisibility: {
    profile: boolean;
    stats: boolean;
    languages: boolean;
    streak: boolean;
    trophies: boolean;
    topContributed: boolean;
    rankings: boolean;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasGithubToken, setHasGithubToken] = useState(false);
  const [patToken, setPatToken] = useState('');
  const [savingPat, setSavingPat] = useState(false);
  const [patSuccessMsg, setPatSuccessMsg] = useState<string | null>(null);

  // Settings State
  const [settings, setSettings] = useState<SettingsState>({
    preferredTheme: 'dark',
    defaultCardStyle: 'classic',
    languageSorting: 'size',
    defaultCardVisibility: {
      profile: true,
      stats: true,
      languages: true,
      streak: true,
      trophies: true,
      topContributed: true,
      rankings: true,
    },
  });

  // Verify session & Load saved settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiBase = env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiBase}/api/v1/users/me`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to load profile data (${response.status})`);
        }

        const data = await response.json();
        if (data.success && data.data) {
          setHasGithubToken(Boolean(data.data.hasGithubToken));
          if (data.data.settings) {
            setSettings(data.data.settings);
          }
        }
      } catch (err) {
        console.error('Failed to load user settings:', err);
        setErrorMsg('Failed to retrieve user preferences from the backend. Using default config.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [router]);

  // Handle GitHub PAT Token Save
  const handleSavePat = async () => {
    if (!patToken.trim()) return;

    setSavingPat(true);
    setErrorMsg(null);
    setPatSuccessMsg(null);

    try {
      const apiBase = env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiBase}/api/v1/users/github-token`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: patToken.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save GitHub token (${response.status})`);
      }

      setHasGithubToken(true);
      setPatToken('');
      setPatSuccessMsg('GitHub Personal Access Token securely stored.');
      setTimeout(() => setPatSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to save GitHub token:', err);
      setErrorMsg('Failed to save the GitHub token.');
    } finally {
      setSavingPat(false);
    }
  };

  // Handle GitHub PAT Token Clear
  const handleClearPat = async () => {
    setSavingPat(true);
    setErrorMsg(null);
    setPatSuccessMsg(null);

    try {
      const apiBase = env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiBase}/api/v1/users/github-token`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to clear GitHub token (${response.status})`);
      }

      setHasGithubToken(false);
      setPatToken('');
      setPatSuccessMsg('GitHub Personal Access Token cleared.');
      setTimeout(() => setPatSuccessMsg(null), 3000);
    } catch (err) {
      console.error('Failed to clear GitHub token:', err);
      setErrorMsg('Failed to clear the GitHub token.');
    } finally {
      setSavingPat(false);
    }
  };

  // Handle Settings Saving
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      const apiBase = env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiBase}/api/v1/users/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`Save request failed (${response.status})`);
      }

      const data = await response.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(data.error || 'Save operation failed.');
      }
    } catch (err: unknown) {
      console.error('Failed to save settings:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Error saving preferences to backend.');
    } finally {
      setSaving(false);
    }
  };

  const updateVisibility = (key: keyof SettingsState['defaultCardVisibility']) => {
    setSettings((prev) => ({
      ...prev,
      defaultCardVisibility: {
        ...prev.defaultCardVisibility,
        [key]: !prev.defaultCardVisibility[key],
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-5xl animate-pulse">
        {/* Loading Skeletons */}
        <div className="h-10 bg-white/5 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-white/5 rounded-3xl" />
          <div className="h-80 bg-white/5 rounded-3xl" />
          <div className="h-40 bg-white/5 rounded-3xl" />
          <div className="h-40 bg-white/5 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl relative pb-16 overflow-x-hidden">
      {/* Background glow spots */}
      <div className="w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] absolute top-[-5%] left-[-10%] opacity-50 pointer-events-none filter blur-[30px]" />
      <div className="w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.06)_0%,transparent_70%)] absolute bottom-[10%] right-[-5%] opacity-50 pointer-events-none filter blur-[35px]" />

      {/* Floating Status Notification */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl shadow-xl shadow-emerald-950/20 text-emerald-400 text-sm font-semibold animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          Settings successfully persisted to backend server!
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 px-5 py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm font-medium">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System Preferences</h1>
          <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
            Configure defaults for theme colors, layouts, and cards visibility that render across
            your profile README embeds.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-extrabold text-white rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-violet-500/15"
        >
          {saving ? (
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Save className="w-4 h-4 text-white" />
          )}
          <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Preferred Theme Block */}
        <div className="glass-card rounded-3xl p-6 flex flex-col gap-5">
          <h3 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-2.5 border-b border-white/5 pb-4">
            <Palette className="w-5 h-5 text-violet-400" />
            Preferred Card Theme
          </h3>
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Preferred card theme">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = settings.preferredTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => setSettings((prev) => ({ ...prev, preferredTheme: theme.id }))}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    isSelected
                      ? 'bg-white/5 border-violet-500/50 shadow-inner'
                      : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Theme ${theme.name}`}
                >
                  <div className="flex flex-col gap-0.5 max-w-[70%]">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      {theme.name}
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium leading-normal">
                      {theme.desc}
                    </span>
                  </div>
                  {/* Theme Palette Swatch preview dots */}
                  <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-2 rounded-xl border border-white/5 shrink-0">
                    <div
                      className="w-3 h-3 rounded-full border border-white/10"
                      style={{ backgroundColor: theme.bg }}
                      title="Background"
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-white/10"
                      style={{ backgroundColor: theme.text }}
                      title="Text color"
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-white/10"
                      style={{ backgroundColor: theme.accent }}
                      title="Accent color"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Default Card Style Block */}
        <div className="glass-card rounded-3xl p-6 flex flex-col gap-5">
          <h3 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-2.5 border-b border-white/5 pb-4">
            <Sliders className="w-5 h-5 text-violet-400" />
            Default Card Style
          </h3>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            role="radiogroup"
            aria-label="Default card style"
          >
            {STYLE_OPTIONS.map((style) => {
              const isSelected = settings.defaultCardStyle === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setSettings((prev) => ({ ...prev, defaultCardStyle: style.id }))}
                  className={`flex flex-col gap-2 p-5 rounded-2xl border transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    isSelected
                      ? 'bg-white/5 border-violet-500/50 shadow-inner'
                      : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Card style ${style.name}`}
                >
                  <span className="text-xs font-bold text-white flex items-center justify-between w-full">
                    {style.name}
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-[9px] text-violet-400 font-extrabold">
                        ✓
                      </span>
                    )}
                  </span>
                  <p className="text-[10px] text-zinc-400 leading-normal">{style.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Language Sorting preferences */}
        <div className="glass-card rounded-3xl p-6 flex flex-col gap-5">
          <h3 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-2.5 border-b border-white/5 pb-4">
            <SortAsc className="w-5 h-5 text-violet-400" />
            Language Card Sorting
          </h3>
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Language card sorting">
            {SORTING_OPTIONS.map((opt) => {
              const isSelected = settings.languageSorting === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSettings((prev) => ({ ...prev, languageSorting: opt.id }))}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    isSelected
                      ? 'bg-white/5 border-violet-500/50 shadow-inner'
                      : 'border-white/5 hover:border-white/10 hover:bg-white/[0.01]'
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Sort languages ${opt.name}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-white">{opt.name}</span>
                    <span className="text-[10px] text-zinc-400 leading-normal">{opt.desc}</span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                        : 'border-white/10 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Visibility Block */}
        <div className="glass-card rounded-3xl p-6 flex flex-col gap-5">
          <h3 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-2.5 border-b border-white/5 pb-4">
            <Eye className="w-5 h-5 text-violet-400" />
            Default Card Visibility
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                key: 'profile',
                label: 'Profile Card',
                desc: 'Short overview of profile name and bio status',
              },
              {
                key: 'stats',
                label: 'Stats Card',
                desc: 'Repo count, stars, contributions, and issues metrics',
              },
              {
                key: 'languages',
                label: 'Languages Card',
                desc: 'Top programming languages percentage bar breakdown',
              },
              {
                key: 'streak',
                label: 'Streak Card',
                desc: 'Contributions streaks tracking details',
              },
              {
                key: 'trophies',
                label: 'Trophies Card',
                desc: 'Achievement badges for stars, commits, followers, and repo count',
              },
              {
                key: 'topContributed',
                label: 'Top Contributed Card',
                desc: 'Top N repositories by commit/contribution activity',
              },
              {
                key: 'rankings',
                label: 'Rankings Card',
                desc: 'Highlights of your repositories (Most Starred, Most Forked, Recently Updated)',
              },
            ].map((card) => {
              const isVisible =
                settings.defaultCardVisibility[
                  card.key as keyof SettingsState['defaultCardVisibility']
                ];
              return (
                <div
                  key={card.key}
                  className="flex flex-col gap-3 p-4 rounded-2xl border border-white/5 bg-white/[0.01]"
                >
                  <div className="flex items-center justify-between">
                    <span id={`label-${card.key}`} className="text-xs font-bold text-white">
                      {card.label}
                    </span>
                    <button
                      onClick={() =>
                        updateVisibility(card.key as keyof SettingsState['defaultCardVisibility'])
                      }
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        isVisible ? 'bg-violet-600' : 'bg-zinc-800'
                      }`}
                      role="switch"
                      aria-checked={isVisible}
                      aria-labelledby={`label-${card.key}`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                          isVisible ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-normal">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* GitHub Access Token Management Block */}
        <div className="glass-card rounded-3xl p-6 flex flex-col gap-5 lg:col-span-2 border border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
            <h3 className="font-extrabold text-sm text-white tracking-wide flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-violet-400" />
              GitHub Personal Access Token (PAT)
            </h3>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold self-start sm:self-auto ${
                hasGithubToken
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-zinc-800 border border-white/5 text-zinc-400'
              }`}
            >
              {hasGithubToken ? 'PAT Active' : 'Optional (OAuth Active)'}
            </span>
          </div>

          {patSuccessMsg && (
            <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-400 text-xs font-semibold">
              <Check className="w-4 h-4" />
              <span>{patSuccessMsg}</span>
            </div>
          )}

          <p className="text-zinc-400 text-xs leading-relaxed max-w-2xl">
            Your normal GitHub account is already authenticated. Adding a Personal Access Token (PAT) is <strong className="text-zinc-200">optional</strong>, and enables higher API rate limits (5,000 req/hr) and access to private repository metrics.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={patToken}
              onChange={(e) => setPatToken(e.target.value)}
              className="bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 font-mono flex-1"
            />
            <button
              onClick={handleSavePat}
              disabled={savingPat || !patToken.trim()}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-xs font-extrabold text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              {savingPat ? 'Saving...' : 'Save Token'}
            </button>
            {hasGithubToken && (
              <button
                onClick={handleClearPat}
                disabled={savingPat}
                className="px-4 py-2.5 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-xs font-bold text-rose-400 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Clear Token
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
