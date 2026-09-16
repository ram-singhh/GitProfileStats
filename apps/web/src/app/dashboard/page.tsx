'use client';

import React, { useState } from 'react';
import { env } from '@/config/env';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Link as LinkIcon,
  Mail,
  GitCommit,
  GitPullRequest,
  Star,
  GitFork,
  RefreshCw,
  ExternalLink,
  Globe,
  Award,
  Folder,
  Eye,
  AlertTriangle,
  FileCode2,
  Lock,
  BookOpen,
  CalendarDays,
  Flame,
  Settings,
  KeyRound,
  X,
  WifiOff,
  CreditCard,
  Palette,
  ArrowRight,
} from 'lucide-react';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useDashboardStats } from './hooks/useDashboardStats';
import { LANGUAGE_COLORS } from './types';

export default function DashboardPage() {
  const isOnline = useOnlineStatus();
  const {
    user,
    loading,
    loadingStats,
    stats,
    statsError,
    setStatsError,
    hasGithubToken,
    loadStats,
    setHasGithubToken,
  } = useDashboardStats();

  const [syncing, setSyncing] = useState(false);
  const [patToken, setPatToken] = useState('');
  const [showPatModal, setShowPatModal] = useState(false);
  const [patSaving, setPatSaving] = useState(false);

  const handleSavePat = async () => {
    if (!user || !patToken.trim()) return;

    setPatSaving(true);
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

      setPatToken('');
      setHasGithubToken(true);
      setShowPatModal(false);
      loadStats(user.username);
    } catch (err) {
      console.error('Failed to save GitHub token:', err);
      setStatsError('Failed to save the GitHub token securely.');
    } finally {
      setPatSaving(false);
    }
  };

  const handleClearPat = async () => {
    if (!user) return;

    setPatSaving(true);
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
      setShowPatModal(false);
      loadStats(user.username);
    } catch (err) {
      console.error('Failed to clear GitHub token:', err);
      setStatsError('Failed to clear the GitHub token securely.');
    } finally {
      setPatSaving(false);
    }
  };

  const handleSync = () => {
    if (!user) return;
    setSyncing(true);
    loadStats(user.username).then(() => {
      setSyncing(false);
    });
  };

  if (loading) {
    return null; // layout.tsx displays session verifier spinner
  }

  const bio = stats?.userProfile?.bio ?? 'Developer on GitHub';
  const location = stats?.userProfile?.location ?? null;
  const company = stats?.userProfile?.company ?? null;
  const website = stats?.userProfile?.blog ?? null;

  const getWebsiteLink = (webStr: string) => {
    if (!webStr) return '';
    if (webStr.startsWith('http://') || webStr.startsWith('https://')) {
      return webStr;
    }
    return `https://${webStr}`;
  };

  const getWebsiteDisplay = (webStr: string) => {
    if (!webStr) return '';
    return webStr.replace(/^https?:\/\/(www\.)?/, '');
  };

  const getContributionColor = (count: number) => {
    if (count === 0) return 'rgba(255, 255, 255, 0.03)';
    if (count <= 2) return 'rgba(139, 92, 246, 0.25)';
    if (count <= 5) return 'rgba(139, 92, 246, 0.55)';
    if (count <= 8) return 'rgba(139, 92, 246, 0.85)';
    return 'rgba(236, 72, 153, 0.95)';
  };

  const renderMonthLabels = () => {
    if (!stats?.contributionStats?.contributionCalendar?.weeks) return null;
    const weeks = stats.contributionStats.contributionCalendar.weeks;
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const labels: { text: string; index: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, wIndex) => {
      if (week.contributionDays && week.contributionDays[0]) {
        const date = new Date(week.contributionDays[0].date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          labels.push({ text: months[month], index: wIndex });
          lastMonth = month;
        }
      }
    });

    return (
      <div className="relative h-5 text-[10px] text-zinc-500 font-semibold mb-1 select-none min-w-[720px]">
        {labels.map((lbl, idx) => (
          <span key={idx} className="absolute" style={{ left: `${lbl.index * 13.5}px` }}>
            {lbl.text}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8 w-full select-none pb-16">
      {/* Offline Alert */}
      {!isOnline && (
        <div className="w-full flex flex-col sm:flex-row items-center justify-between px-6 py-4 rounded-3xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400 backdrop-blur-md shadow-lg shadow-amber-950/20 animate-in fade-in duration-300 gap-4">
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

      {/* GitHub Token Config Modal */}
      {showPatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md glass-card rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col gap-4 relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-white">GitHub Access Token</h3>
              </div>
              <button
                onClick={() => setShowPatModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed">
              Your standard GitHub login is already connected. A Personal Access Token (PAT) is{' '}
              <strong className="text-zinc-200">completely optional</strong>, useful if you want to include
              private repositories or bypass public API rate limits. Note: Private repository access requires appropriate GitHub repository permissions (e.g. <code className="text-violet-400 font-mono text-[11px]">repo</code> scope for classic tokens or repository read permissions for fine-grained tokens).
            </p>

            <div className="flex flex-col gap-2">
              <label htmlFor="modal-pat-input" className="text-xs font-semibold text-zinc-300">
                Token (classic or fine-grained)
              </label>
              <input
                id="modal-pat-input"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={patToken}
                onChange={(e) => setPatToken(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-2">
              {hasGithubToken ? (
                <button
                  type="button"
                  onClick={handleClearPat}
                  disabled={patSaving}
                  className="px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Clear Saved Token
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPatModal(false)}
                  className="px-4 py-2 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePat}
                  disabled={patSaving || !patToken.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-extrabold text-white rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {patSaving ? 'Saving...' : 'Save Token'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP PROFILE & HERO BANNER */}
      <section className="glass-card rounded-3xl overflow-hidden relative border border-white/10 shadow-xl">
        {/* Decorative Top Accent Bar */}
        <div className="h-20 sm:h-28 bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2">
            <button
              onClick={() => setShowPatModal(true)}
              className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold backdrop-blur-md flex items-center gap-1.5 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                hasGithubToken
                  ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  : 'border-white/10 bg-black/40 text-zinc-400 hover:text-zinc-200 hover:bg-black/60'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{hasGithubToken ? 'PAT Active' : 'PAT (Optional)'}</span>
            </button>
          </div>
        </div>

        {/* Profile Content Details */}
        <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-5 -mt-10 sm:-mt-12 text-center sm:text-left">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-2xl shrink-0 overflow-hidden">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={`${user.username}'s GitHub avatar`}
                  width={112}
                  height={112}
                  className="w-full h-full rounded-[22px] object-cover bg-zinc-950"
                />
              ) : (
                <div className="w-full h-full rounded-[22px] bg-zinc-950 flex items-center justify-center font-black text-2xl sm:text-3xl text-white">
                  {user?.username?.substring(0, 2).toUpperCase() || 'US'}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-extrabold text-xl sm:text-3xl text-white tracking-tight break-all">
                  {user?.username}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 border border-violet-500/20 text-violet-400">
                  @{user?.username}
                </span>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm max-w-xl line-clamp-2 leading-relaxed">
                {bio}
              </p>

              {/* Meta tags */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-2 text-xs text-zinc-400">
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    {location}
                  </span>
                )}
                {company && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-zinc-500" />
                    {company}
                  </span>
                )}
                {user?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    {user.email}
                  </span>
                )}
                {website && (
                  <a
                    href={getWebsiteLink(website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-violet-400 hover:underline"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    {getWebsiteDisplay(website)}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Buttons */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start md:justify-end gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={handleSync}
              disabled={syncing || loadingStats || !isOnline}
              className="px-4 py-2.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${syncing || loadingStats ? 'animate-spin text-violet-400' : 'text-zinc-400'}`}
              />
              <span>{syncing ? 'Syncing...' : 'Sync Stats'}</span>
            </button>

            <Link
              href="/dashboard/cards"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-violet-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <CreditCard className="w-4 h-4" />
              <span>Customize Cards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. ERROR STATE NOTIFICATION */}
      {statsError && !loadingStats && !stats && (
        <div className="glass-card rounded-3xl p-6 border-rose-500/25 bg-rose-500/5 flex flex-col sm:flex-row gap-5 items-start animate-in fade-in duration-300">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <h4 className="font-bold text-base text-white">GitHub API Connection Issue</h4>
            <p className="text-zinc-400 text-xs leading-relaxed">{statsError}</p>
            <div className="flex flex-wrap gap-3 mt-2">
              <button
                onClick={() => setShowPatModal(true)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Configure GitHub PAT</span>
              </button>
              {isOnline && user && (
                <button
                  onClick={() => loadStats(user.username)}
                  className="px-4 py-2 rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Connection</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SKELETON LOADERS */}
      {loadingStats && (
        <div className="flex flex-col gap-6 w-full animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card rounded-3xl p-5 h-28 bg-white/5" />
            ))}
          </div>
          <div className="glass-card rounded-3xl p-6 h-56 bg-white/5" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card rounded-3xl p-6 h-72 bg-white/5" />
            <div className="glass-card rounded-3xl p-6 h-72 bg-white/5" />
          </div>
        </div>
      )}

      {/* 4. LOADED DASHBOARD CONTENT */}
      {stats && !loadingStats && (
        <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
          {/* A. KEY METRICS GRID */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stars Card */}
            <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 group relative overflow-hidden border border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 transition-transform group-hover:scale-105">
                <Star className="w-5 h-5 fill-amber-400/10" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  Total Stars
                </span>
                <h3 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                  {stats.repositoryStats.totalStars.toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Commits Card */}
            <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 group relative overflow-hidden border border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 transition-transform group-hover:scale-105">
                <GitCommit className="w-5 h-5" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  Total Commits
                </span>
                <h3 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                  {stats.commitStats.totalCommits.toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Contributions Card */}
            <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 group relative overflow-hidden border border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 transition-transform group-hover:scale-105">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  Contributions
                </span>
                <h3 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                  {stats.contributionStats.totalContributions.toLocaleString()}
                </h3>
              </div>
            </div>

            {/* Repositories Card */}
            <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 group relative overflow-hidden border border-white/5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 transition-transform group-hover:scale-105">
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs font-bold uppercase tracking-wider">
                  Repositories
                </span>
                <h3 className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight mt-0.5">
                  {stats.repositoryStats.total.toLocaleString()}
                </h3>
              </div>
            </div>
          </section>

          {/* B. FIRST-TIME QUICK LAUNCH ACTIONS */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/dashboard/cards"
              className="glass-card rounded-3xl p-6 flex flex-col justify-between gap-4 border border-violet-500/20 hover:border-violet-500/40 bg-violet-500/[0.03] transition-all group hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white">Card Studio & Embeds</h4>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                  Customize SVG cards, adjust zoom, and generate copy-paste markdown for your GitHub
                  Profile README.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/themes"
              className="glass-card rounded-3xl p-6 flex flex-col justify-between gap-4 border border-fuchsia-500/20 hover:border-fuchsia-500/40 bg-fuchsia-500/[0.03] transition-all group hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                  <Palette className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-fuchsia-400 group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white">Theme Gallery</h4>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                  Browse modern color palettes (Dark, Dracula, Nord, GitHub) and set your default card
                  theme.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/settings"
              className="glass-card rounded-3xl p-6 flex flex-col justify-between gap-4 border border-white/5 hover:border-white/10 bg-white/[0.01] transition-all group hover:scale-[1.01]"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
                  <Settings className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-white">Preferences & Token</h4>
                <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                  Configure default card styles, language sorting, card visibility, and security PAT
                  settings.
                </p>
              </div>
            </Link>
          </section>

          {/* C. ACTIVITY CALENDAR HEATMAP */}
          <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/5 mb-5">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-violet-400" />
                  Contribution Activity
                </h3>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Daily GitHub contributions and active streaks over the past year.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-400">
                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                  <Flame className="w-3.5 h-3.5 text-fuchsia-400" />
                  <span>
                    Current:{' '}
                    <strong className="text-white font-bold">
                      {stats.contributionStats.currentStreak} Days
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-xl border border-white/5">
                  <Award className="w-3.5 h-3.5 text-violet-400" />
                  <span>
                    Longest:{' '}
                    <strong className="text-white font-bold">
                      {stats.contributionStats.longestStreak} Days
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Heatmap Grid Container */}
            <div className="pt-2">
              <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <div className="flex flex-col gap-[3px] min-w-[720px]">
                  {renderMonthLabels()}
                  <div className="flex gap-[3px] select-none">
                    {stats.contributionStats.contributionCalendar.weeks.map((week, wIndex) => (
                      <div key={wIndex} className="flex flex-col gap-[3px]">
                        {week.contributionDays.map((day) => (
                          <div
                            key={day.date}
                            className="w-[10px] h-[10px] rounded-[2px] transition-colors duration-200 cursor-pointer relative group"
                            style={{
                              backgroundColor: getContributionColor(day.contributionCount),
                            }}
                          >
                            {/* Hover Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex bg-zinc-950/95 border border-white/10 rounded-xl px-2.5 py-1.5 text-[10px] whitespace-nowrap z-50 shadow-2xl pointer-events-none flex-col gap-0.5 font-sans">
                              <span className="font-extrabold text-zinc-100">
                                {day.contributionCount} contributions
                              </span>
                              <span className="text-zinc-500 font-medium">
                                {new Date(day.date).toLocaleDateString(undefined, {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Heatmap Legend */}
              <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2 border-t border-white/5 pt-4">
                <Link
                  href="/dashboard/activity"
                  className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 hover:underline"
                >
                  <span>View detailed activity stats</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <div className="w-[10px] h-[10px] rounded-[2px] bg-white/[0.03]" />
                  <div className="w-[10px] h-[10px] rounded-[2px] bg-violet-600/25" />
                  <div className="w-[10px] h-[10px] rounded-[2px] bg-violet-600/55" />
                  <div className="w-[10px] h-[10px] rounded-[2px] bg-violet-600/85" />
                  <div className="w-[10px] h-[10px] rounded-[2px] bg-fuchsia-500" />
                  <span>More</span>
                </div>
              </div>
            </div>
          </section>

          {/* D. TWO COLUMNS: Languages Breakdown & Repositories Breakdown */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Language Breakdown Card (5 columns) */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 lg:col-span-5 flex flex-col justify-between border border-white/5">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <FileCode2 className="w-5 h-5 text-violet-400" />
                    Top Languages
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">By Source Code</span>
                </div>

                {stats.languageStats.length > 0 ? (
                  <div className="flex flex-col gap-4 mt-5">
                    {/* Stacked Percentage Bar */}
                    <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden flex mb-2">
                      {stats.languageStats.slice(0, 5).map((lang, index) => (
                        <div
                          key={lang.language}
                          style={{
                            width: `${lang.percentage}%`,
                            backgroundColor: LANGUAGE_COLORS[lang.language] || '#8250df',
                          }}
                          className={`h-full ${index === 0 ? 'rounded-l-full' : ''} ${
                            index === stats.languageStats.slice(0, 5).length - 1
                              ? 'rounded-r-full'
                              : ''
                          }`}
                          title={`${lang.language}: ${lang.percentage}%`}
                        />
                      ))}
                    </div>

                    {/* Language Rows */}
                    {stats.languageStats.slice(0, 5).map((lang) => {
                      const dotColor = LANGUAGE_COLORS[lang.language] || '#8250df';
                      return (
                        <div key={lang.language} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: dotColor }}
                            />
                            <span className="font-bold text-zinc-200">{lang.language}</span>
                            <span className="text-[10px] text-zinc-500">
                              ({lang.repositoryCount}{' '}
                              {lang.repositoryCount === 1 ? 'repo' : 'repos'})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-500 font-mono text-[11px]">
                              {(lang.bytes / 1024).toFixed(0)} KB
                            </span>
                            <span className="font-extrabold text-white min-w-[40px] text-right">
                              {lang.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-10 text-center text-zinc-500 text-xs">
                    No language data detected.
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-white/5 pt-4 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">Public repository bytes</span>
                <Link
                  href="/dashboard/cards"
                  className="text-[10px] text-violet-400 hover:text-violet-300 font-bold hover:underline"
                >
                  Generate card →
                </Link>
              </div>
            </div>

            {/* Repositories Metrics & Breakdown (7 columns) */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 lg:col-span-7 flex flex-col justify-between border border-white/5">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Folder className="w-5 h-5 text-violet-400" />
                    Repository Breakdown
                  </h3>
                  <a
                    href={`https://github.com/${user?.username}?tab=repositories`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>GitHub Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Summary Pills Grid */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-5">
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                      Total
                    </span>
                    <span className="text-xl font-extrabold text-white mt-1 block">
                      {stats.repositoryStats.total}
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                      Public
                    </span>
                    <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                      {stats.repositoryStats.public}
                    </span>
                  </div>
                  <div className="bg-black/40 border border-white/5 rounded-2xl p-4 text-center">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                      Private
                    </span>
                    <span className="text-xl font-extrabold text-fuchsia-400 mt-1 block">
                      {stats.repositoryStats.private}
                    </span>
                  </div>
                </div>

                {/* Metrics list */}
                <div className="flex flex-col gap-2.5 mt-5 text-xs text-zinc-400">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-zinc-500" /> Private Repository Access:
                    </span>
                    <span className="font-semibold text-zinc-300">
                      {stats.repositoryStats.private > 0 ? 'Enabled' : hasGithubToken ? 'Configured' : 'Public Only'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5">
                      <GitFork className="w-3.5 h-3.5 text-zinc-500" /> Total Forks:
                    </span>
                    <span className="font-semibold text-zinc-300">
                      {stats.repositoryStats.forks}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-zinc-500" /> Original Repositories:
                    </span>
                    <span className="font-semibold text-zinc-300">
                      {stats.repositoryStats.original}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5">
                      <GitPullRequest className="w-3.5 h-3.5 text-zinc-500" /> Merged Pull Requests:
                    </span>
                    <span className="font-semibold text-zinc-300">
                      {stats.pullRequestStats.mergedPullRequests}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/5 pt-4 flex items-center justify-between">
                <span className="text-[10px] text-zinc-500">Repository analysis completed</span>
                <Link
                  href="/dashboard/repositories"
                  className="text-[10px] text-violet-400 hover:text-violet-300 font-bold hover:underline"
                >
                  View all repo insights →
                </Link>
              </div>
            </div>
          </section>

          {/* E. TOP REPOSITORIES HIGHLIGHTS */}
          <section className="glass-card rounded-3xl p-6 sm:p-8 border border-white/5">
            <div className="flex items-center justify-between pb-5 border-b border-white/5 mb-5">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-400" />
                  Highlighted Repositories
                </h3>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Featured repositories based on stars, forks, and recent commit updates.
                </p>
              </div>
              <Link
                href="/dashboard/repositories"
                className="text-xs text-violet-400 hover:text-violet-300 font-bold hover:underline flex items-center gap-1"
              >
                <span>All Repositories</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Most Starred Repo */}
              {stats.repositoryRankings.mostStarred ? (
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group hover:border-violet-500/30 transition-all">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400/10" />
                      <span>Most Starred</span>
                    </div>
                    <h4 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors truncate">
                      {stats.repositoryRankings.mostStarred.name}
                    </h4>
                    <p className="text-zinc-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {stats.repositoryRankings.mostStarred.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400/20" />{' '}
                        {stats.repositoryRankings.mostStarred.stars}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <GitFork className="w-3 h-3" />{' '}
                        {stats.repositoryRankings.mostStarred.forks}
                      </span>
                    </div>
                    <a
                      href={stats.repositoryRankings.mostStarred.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[140px]">
                  <Star className="w-5 h-5 text-zinc-600" />
                  <span className="text-xs text-zinc-400">No starred repositories detected</span>
                </div>
              )}

              {/* Most Forked Repo */}
              {stats.repositoryRankings.mostForked ? (
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group hover:border-violet-500/30 transition-all">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-violet-400 font-bold uppercase tracking-wider mb-2">
                      <GitFork className="w-3.5 h-3.5" />
                      <span>Most Forked</span>
                    </div>
                    <h4 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors truncate">
                      {stats.repositoryRankings.mostForked.name}
                    </h4>
                    <p className="text-zinc-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {stats.repositoryRankings.mostForked.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3 h-3" />{' '}
                        {stats.repositoryRankings.mostForked.stars}
                      </span>
                      <span className="flex items-center gap-1 text-violet-400 font-semibold">
                        <GitFork className="w-3 h-3" />{' '}
                        {stats.repositoryRankings.mostForked.forks}
                      </span>
                    </div>
                    <a
                      href={stats.repositoryRankings.mostForked.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[140px]">
                  <GitFork className="w-5 h-5 text-zinc-600" />
                  <span className="text-xs text-zinc-400">No forked repositories detected</span>
                </div>
              )}

              {/* Recently Updated Repo */}
              {stats.repositoryRankings.mostRecentlyUpdated ? (
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group hover:border-violet-500/30 transition-all">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider mb-2">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Recently Updated</span>
                    </div>
                    <h4 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors truncate">
                      {stats.repositoryRankings.mostRecentlyUpdated.name}
                    </h4>
                    <p className="text-zinc-500 text-xs mt-2 line-clamp-2 leading-relaxed">
                      {stats.repositoryRankings.mostRecentlyUpdated.description || 'No description provided.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      {new Date(
                        stats.repositoryRankings.mostRecentlyUpdated.updatedAt,
                      ).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <a
                      href={stats.repositoryRankings.mostRecentlyUpdated.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[140px]">
                  <Eye className="w-5 h-5 text-zinc-600" />
                  <span className="text-xs text-zinc-400">No recent repositories</span>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

