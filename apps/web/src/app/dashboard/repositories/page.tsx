'use client';

import React, { useState } from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { LANGUAGE_COLORS } from '../types';
import {
  Code2,
  Folder,
  FileCode2,
  Award,
  Star,
  GitFork,
  Eye,
  Lock,
  BookOpen,
  GitPullRequest,
  AlertTriangle,
  RefreshCw,
  WifiOff,
  ExternalLink,
} from 'lucide-react';

export default function RepositoriesPage() {
  const isOnline = useOnlineStatus();
  const { user, loading, loadingStats, stats, statsError, loadStats } = useDashboardStats();

  const [syncing, setSyncing] = useState(false);

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

  return (
    <div className="flex flex-col gap-6 w-full select-none pb-16">
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            GitHub Repositories
          </h1>
          <p className="text-zinc-400 text-xs mt-2.5 leading-relaxed max-w-3xl font-medium">
            Explore your repository counts, language composition breakdowns, and highlighted
            codebases.
          </p>
        </div>

        {user && (
          <button
            onClick={handleSync}
            disabled={syncing || loadingStats || !isOnline}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-xs font-extrabold text-white rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-violet-500/15"
          >
            <RefreshCw
              className={`w-4 h-4 ${syncing || loadingStats ? 'animate-spin text-white' : 'text-white'}`}
            />
            <span>
              {!isOnline
                ? 'Sync Disabled (Offline)'
                : syncing
                  ? 'Fetching stats...'
                  : 'Refresh Stats Data'}
            </span>
          </button>
        )}
      </div>

      {/* FAILURE STATE */}
      {statsError && !loadingStats && !stats && (
        <div className="glass-card rounded-3xl p-6.5 border-rose-500/25 bg-rose-500/5 flex flex-col gap-5 animate-in fade-in duration-300">
          <div className="flex gap-4.5 items-start">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shrink-0 shadow-lg shadow-rose-500/5">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-base text-white">GitHub API Connection Failed</h4>
              <p className="text-zinc-400 text-xs mt-1 leading-relaxed">{statsError}</p>
            </div>
          </div>
          {isOnline && (
            <button
              onClick={() => {
                if (user) {
                  loadStats(user.username);
                }
              }}
              className="px-4 py-2.5 border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 text-violet-400 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.01] active:scale-[0.99] self-start"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          )}
        </div>
      )}

      {/* NO STATS STATE */}
      {!stats && !loadingStats && !statsError && (
        <div className="glass-card rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-5 border-zinc-500/10 bg-zinc-500/2">
          <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Folder className="w-8 h-8" />
          </div>
          <div className="max-w-md">
            <h3 className="font-extrabold text-lg text-white">No Statistics Loaded</h3>
            <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
              Your developer statistics details are currently empty. Click &quot;Refresh Stats Data&quot; or check your connection. You can also optionally configure a personal access token in Settings to include private repository metrics.
            </p>
          </div>
        </div>
      )}

      {/* SKELETON STATE */}
      {loadingStats && (
        <div className="flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-shimmer" />
              <div className="h-4 bg-zinc-800/40 rounded w-1/3 animate-pulse" />
              <div className="h-24 bg-zinc-800/20 rounded-xl animate-pulse" />
            </div>
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-shimmer" />
              <div className="h-4 bg-zinc-800/40 rounded w-1/3 animate-pulse" />
              <div className="h-24 bg-zinc-800/20 rounded-xl animate-pulse" />
            </div>
          </div>
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-shimmer" />
            <div className="h-4 bg-zinc-800/40 rounded w-1/4 animate-pulse" />
            <div className="h-28 bg-zinc-800/20 rounded-xl animate-pulse" />
          </div>
        </div>
      )}

      {/* DATA LOADED VIEWS */}
      {stats && !loadingStats && (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Repository Statistics (Left / 7 cols) */}
            <div className="glass-card rounded-3xl p-6 lg:col-span-7 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2 pb-4 border-b border-white/5">
                  <Folder className="w-5 h-5 text-violet-400" />
                  Repository Statistics
                </h3>

                {stats.repositoryStats.total > 0 ? (
                  <>
                    <div className="grid grid-cols-3 gap-4 mt-5">
                      <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                          Total
                        </span>
                        <span className="text-xl font-extrabold text-white mt-1 block">
                          {stats.repositoryStats.total}
                        </span>
                      </div>
                      <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                          Public
                        </span>
                        <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                          {stats.repositoryStats.public}
                        </span>
                      </div>
                      <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                          Private
                        </span>
                        <span className="text-xl font-extrabold text-fuchsia-400 mt-1 block">
                          {stats.repositoryStats.private}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 mt-5 text-xs text-zinc-400">
                      <div className="flex justify-between border-b border-white/3 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-zinc-500" /> Private Repository access:
                        </span>
                        <span className="font-semibold text-zinc-300">
                          {stats.repositoryStats.private > 0 ? 'Enabled' : 'None Detected'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/3 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <GitFork className="w-3.5 h-3.5 text-zinc-500" /> Repository forks count:
                        </span>
                        <span className="font-semibold text-zinc-300">
                          {stats.repositoryStats.forks}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/3 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-zinc-500" /> Original templates:
                        </span>
                        <span className="font-semibold text-zinc-300">
                          {stats.repositoryStats.original}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-white/3 pb-1.5">
                        <span className="flex items-center gap-1.5">
                          <GitPullRequest className="w-3.5 h-3.5 text-zinc-500" /> Merged PR count:
                        </span>
                        <span className="font-semibold text-zinc-300">
                          {stats.pullRequestStats.mergedPullRequests}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" /> Average Issue
                          Close Time:
                        </span>
                        <span className="font-semibold text-zinc-300">
                          {stats.issueStats.averageCloseTimeFormatted}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-500 shadow-inner">
                      <Folder className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">No Repositories Found</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[240px] mx-auto mt-1">
                        No public repositories were detected for this profile. You can optionally configure a personal access token in Settings to include private repository metrics.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-white/5 pt-4 text-left flex justify-between items-center">
                <span className="text-[10px] text-zinc-500">
                  Repository stats mapping completed.
                </span>
                <a
                  href={`https://github.com/${user?.username}?tab=repositories`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5 hover:underline"
                >
                  <span>View all repositories</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Language Breakdown (Right / 5 cols) */}
            <div className="glass-card rounded-3xl p-6 lg:col-span-5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2 pb-4 border-b border-white/5">
                  <FileCode2 className="w-5 h-5 text-violet-400" />
                  Language Composition
                </h3>

                {stats.languageStats.length > 0 ? (
                  <div className="flex flex-col gap-4 mt-5">
                    {/* Unified Bar Chart Stack */}
                    <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden flex mb-2">
                      {stats.languageStats.slice(0, 5).map((lang, index) => (
                        <div
                          key={lang.language}
                          style={{
                            width: `${lang.percentage}%`,
                            backgroundColor: LANGUAGE_COLORS[lang.language] || '#8250df',
                          }}
                          className={`h-full ${index === 0 ? 'rounded-l-full' : ''} ${index === stats.languageStats.slice(0, 5).length - 1 ? 'rounded-r-full' : ''}`}
                          title={`${lang.language}: ${lang.percentage}%`}
                        />
                      ))}
                    </div>

                    {/* Detail list rows */}
                    {stats.languageStats.slice(0, 5).map((lang) => {
                      const dotColor = LANGUAGE_COLORS[lang.language] || '#8250df';
                      return (
                        <div
                          key={lang.language}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: dotColor }}
                            />
                            <span className="font-bold text-zinc-300">{lang.language}</span>
                            <span className="text-[10px] text-zinc-500">
                              ({lang.repositoryCount}{' '}
                              {lang.repositoryCount === 1 ? 'repo' : 'repos'})
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-500 font-mono">
                              {(lang.bytes / 1024).toFixed(0)} KB
                            </span>
                            <span className="font-extrabold text-white min-w-[42px] text-right">
                              {lang.percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center gap-3 animate-in fade-in duration-300">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-500 shadow-inner">
                      <FileCode2 className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">No Languages Detected</h4>
                      <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[200px] mx-auto mt-1">
                        We couldn&apos;t analyze any programming language bytes in your public
                        repositories.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 border-t border-white/5 pt-4 text-center">
                <span className="text-[10px] text-zinc-500 leading-relaxed block">
                  Calculated by analyzing source-code bytes across all public repositories.
                </span>
              </div>
            </div>
          </div>

          {/* Rankings Highlights Section */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="font-bold text-base text-white flex items-center gap-2 pb-4 border-b border-white/5 mb-5 font-sans">
              <Award className="w-5 h-5 text-violet-400" />
              Repository Rankings Highlights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Most Starred Repo */}
              {stats.repositoryRankings.mostStarred ? (
                <div className="bg-black/35 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">
                      <Star className="w-3.5 h-3.5 fill-amber-400/10" />
                      <span>Most Starred</span>
                    </div>
                    <h4 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors truncate">
                      {stats.repositoryRankings.mostStarred.name}
                    </h4>
                    <p className="text-zinc-500 text-xs mt-2 line-clamp-3 leading-relaxed">
                      {stats.repositoryRankings.mostStarred.description ||
                        'No description provided.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />{' '}
                        {stats.repositoryRankings.mostStarred.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3 text-violet-500" />{' '}
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
                <div className="bg-black/35 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] animate-in fade-in duration-300">
                  <Star className="w-5 h-5 text-zinc-600" />
                  <div>
                    <h4 className="font-bold text-xs text-zinc-400">No Starred Repos</h4>
                    <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[140px] mt-0.5">
                      We couldn&apos;t detect starred repositories.
                    </p>
                  </div>
                </div>
              )}

              {/* Most Forked Repo */}
              {stats.repositoryRankings.mostForked ? (
                <div className="bg-black/35 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-violet-400 font-bold uppercase tracking-wider mb-2">
                      <GitFork className="w-3.5 h-3.5" />
                      <span>Most Forked</span>
                    </div>
                    <h4 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors truncate">
                      {stats.repositoryRankings.mostForked.name}
                    </h4>
                    <p className="text-zinc-500 text-xs mt-2 line-clamp-3 leading-relaxed">
                      {stats.repositoryRankings.mostForked.description ||
                        'No description provided.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" />{' '}
                        {stats.repositoryRankings.mostForked.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3 text-violet-500" />{' '}
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
                <div className="bg-black/35 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] animate-in fade-in duration-300">
                  <GitFork className="w-5 h-5 text-zinc-600" />
                  <div>
                    <h4 className="font-bold text-xs text-zinc-400">No Forked Repos</h4>
                    <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[140px] mt-0.5">
                      Forked repositories will show up here.
                    </p>
                  </div>
                </div>
              )}

              {/* Recently Updated Repo */}
              {stats.repositoryRankings.mostRecentlyUpdated ? (
                <div className="bg-black/35 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-bold uppercase tracking-wider mb-2">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Recently Updated</span>
                    </div>
                    <h4 className="font-bold text-sm text-white group-hover:text-violet-400 transition-colors truncate">
                      {stats.repositoryRankings.mostRecentlyUpdated.name}
                    </h4>
                    <p className="text-zinc-500 text-xs mt-2 line-clamp-3 leading-relaxed">
                      {stats.repositoryRankings.mostRecentlyUpdated.description ||
                        'No description provided.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400 mt-4 border-t border-white/5 pt-3">
                    <div className="flex items-center gap-1 truncate max-w-[130px]">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {new Date(
                          stats.repositoryRankings.mostRecentlyUpdated.updatedAt,
                        ).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <a
                      href={stats.repositoryRankings.mostRecentlyUpdated.htmlUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300 font-bold flex items-center gap-0.5 shrink-0"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="bg-black/35 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[140px] animate-in fade-in duration-300">
                  <Eye className="w-5 h-5 text-zinc-600" />
                  <div>
                    <h4 className="font-bold text-xs text-zinc-400">No Active Repos</h4>
                    <p className="text-[9px] text-zinc-500 leading-relaxed max-w-[140px] mt-0.5">
                      Active public repositories will be listed here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
