'use client';

import React, { useState } from 'react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  CalendarDays,
  Flame,
  Award,
  GitCommit,
  Info,
  RefreshCw,
  AlertTriangle,
  WifiOff,
  Folder,
} from 'lucide-react';

export default function ActivityPage() {
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
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            Recent Activity
          </h1>
          <p className="text-zinc-400 text-xs mt-2.5 leading-relaxed max-w-3xl font-medium">
            View detailed stats about your contribution history, streaks, and commit frequencies
            over the last year.
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
              Your developer activity details are currently empty. Click &quot;Refresh Stats Data&quot; or check your connection to load activity.
            </p>
          </div>
        </div>
      )}

      {/* SKELETON STATE */}
      {loadingStats && (
        <div className="flex flex-col gap-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="glass-card rounded-3xl p-5 relative overflow-hidden flex flex-col gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-shimmer" />
                <div className="w-8 h-8 rounded-lg bg-zinc-800/40 animate-pulse" />
                <div className="h-3 bg-zinc-800/40 rounded w-1/2 animate-pulse mt-2" />
                <div className="h-6 bg-zinc-800/40 rounded w-3/4 animate-pulse mt-1" />
              </div>
            ))}
          </div>
          <div className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col gap-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-shimmer" />
            <div className="h-4 bg-zinc-800/40 rounded w-1/4 animate-pulse" />
            <div className="h-28 bg-zinc-800/20 rounded-xl animate-pulse mt-2" />
          </div>
        </div>
      )}

      {/* DATA LOADED VIEWS */}
      {stats && !loadingStats && (
        <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
          {/* Metrics Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 group relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-violet-500/5 blur-lg group-hover:bg-violet-500/10 transition-all pointer-events-none" />
              <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 transition-transform group-hover:scale-105">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs font-semibold">Total Contributions</span>
                <h4 className="font-extrabold text-2xl text-white tracking-tight mt-0.5">
                  {stats.contributionStats.totalContributions.toLocaleString()}
                </h4>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 group relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-fuchsia-500/5 blur-lg group-hover:bg-fuchsia-500/10 transition-all pointer-events-none" />
              <div className="w-9 h-9 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 transition-transform group-hover:scale-105">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs font-semibold">Current Streak</span>
                <h4 className="font-extrabold text-2xl text-white tracking-tight mt-0.5">
                  {stats.contributionStats.currentStreak} Days
                </h4>
              </div>
            </div>

            <div className="glass-card rounded-3xl p-5 flex flex-col gap-3 group relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-amber-500/5 blur-lg group-hover:bg-amber-500/10 transition-all pointer-events-none" />
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 transition-transform group-hover:scale-105">
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-zinc-500 text-xs font-semibold">Longest Streak</span>
                <h4 className="font-extrabold text-2xl text-white tracking-tight mt-0.5">
                  {stats.contributionStats.longestStreak} Days
                </h4>
              </div>
            </div>
          </div>

          {/* Heatmap Section */}
          <div className="glass-card rounded-3xl p-6">
            <div className="pb-5 border-b border-white/5 mb-5">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-violet-400" />
                Annual Contribution Pulse
              </h3>
              <p className="text-zinc-500 text-xs mt-0.5">
                A day-by-day heatmap visualizing your GitHub contributions and development momentum
                over the past year.
              </p>
            </div>

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
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Hover over any pixel block to inspect daily contribution stats.</span>
                </div>
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
          </div>

          {/* Commit Statistics Grid */}
          <div className="glass-card rounded-3xl p-6">
            <div className="pb-5 border-b border-white/5 mb-5 flex items-center gap-2">
              <GitCommit className="w-5 h-5 text-violet-400" />
              <h3 className="font-bold text-base text-white">Commit History</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  Total Commits
                </span>
                <span className="text-xl font-extrabold text-white mt-1 block">
                  {stats.commitStats.totalCommits.toLocaleString()}
                </span>
              </div>
              <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  This Year
                </span>
                <span className="text-xl font-extrabold text-violet-400 mt-1 block">
                  {stats.commitStats.commitsThisYear.toLocaleString()}
                </span>
              </div>
              <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  This Month
                </span>
                <span className="text-xl font-extrabold text-fuchsia-400 mt-1 block">
                  {stats.commitStats.commitsThisMonth.toLocaleString()}
                </span>
              </div>
              <div className="bg-black/35 border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                  This Week
                </span>
                <span className="text-xl font-extrabold text-cyan-400 mt-1 block">
                  {stats.commitStats.commitsThisWeek.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
