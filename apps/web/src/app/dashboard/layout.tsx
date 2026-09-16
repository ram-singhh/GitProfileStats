'use client';

import React, { useState, useEffect } from 'react';
import { env } from '@/config/env';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Terminal,
  LayoutDashboard,
  Code2,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  ChevronDown,
  CreditCard,
  Palette,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{
    id: string;
    username: string;
    email: string | null;
    avatarUrl: string;
    hasGithubToken?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiBase = env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiBase}/api/v1/users/me`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Unauthorized');
        }

        const data = await response.json();
        if (data.success && data.data) {
          setUser(data.data);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  // Close dropdowns on route change or ESC
  useEffect(() => {
    setProfileDropdownOpen(false);
    setNotificationsOpen(false);
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
        setNotificationsOpen(false);
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      const apiBase = env.NEXT_PUBLIC_API_URL;
      await fetch(`${apiBase}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.push('/');
  };

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Card Preview', href: '/dashboard/cards', icon: CreditCard },
    { name: 'Theme Gallery', href: '/dashboard/themes', icon: Palette },
    { name: 'Repositories', href: '/dashboard/repositories', icon: Code2 },
    { name: 'Activity', href: '/dashboard/activity', icon: Activity },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] text-zinc-100 flex flex-col justify-center items-center select-none relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none filter blur-[50px]" />
        <div className="flex flex-col items-center gap-6 z-10 animate-in fade-in duration-500">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 animate-pulse blur-sm opacity-50" />
            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-white/10 flex items-center justify-center relative shadow-2xl">
              <Terminal className="w-5 h-5 text-violet-400 animate-pulse" />
            </div>
            <div className="absolute -inset-1 rounded-2xl border border-violet-500/20 animate-ping [animation-duration:3s]" />
          </div>
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-xs font-bold tracking-widest text-white uppercase font-mono">
              Verifying Session
            </p>
            <p className="text-[10px] text-zinc-500 font-medium">
              Establishing secure handshake context...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014] text-zinc-100 flex relative overflow-hidden">
      {/* Background glow spots */}
      <div className="w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_70%)] absolute top-[-200px] left-[-100px] opacity-40 pointer-events-none filter blur-[40px]" />
      <div className="w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_70%)] absolute bottom-[-200px] right-[-100px] opacity-40 pointer-events-none filter blur-[40px]" />

      {/* Desktop Sidebar (Left side, fixed layout) */}
      <aside className="hidden md:flex md:w-64 border-r border-white/5 bg-[#030014]/60 backdrop-blur-xl flex-col shrink-0 z-20">
        {/* Brand/Logo */}
        <Link
          href="/dashboard"
          className="h-16 px-6 border-b border-white/5 flex items-center gap-2.5 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Terminal className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            GitProfile<span className="text-violet-500 font-semibold">Stats</span>
          </span>
        </Link>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative group ${
                  isActive
                    ? 'bg-white/5 text-white border border-white/5 shadow-inner'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-md bg-gradient-to-b from-violet-500 to-fuchsia-500" />
                )}
                <Icon
                  className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'text-violet-400' : 'text-zinc-400 group-hover:text-white'}`}
                />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile & Logout */}
        <div className="p-4 border-t border-white/5 bg-[#05021a]/30 flex flex-col gap-3">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1px] overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={`${user.username}'s GitHub avatar`}
                  width={40}
                  height={40}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-sm text-white">
                  {user?.username?.substring(0, 2).toUpperCase() || 'US'}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-semibold text-sm text-white truncate group-hover:text-violet-400 transition-colors">
                @{user?.username}
              </h5>
              <p className="text-zinc-500 text-xs truncate">{user?.email || 'GitHub User'}</p>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 text-sm font-medium transition-all duration-200 group text-left cursor-pointer"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200 text-zinc-500 group-hover:text-rose-400" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />

          {/* Drawer Content */}
          <aside className="relative flex w-full max-w-xs flex-col bg-[#030014] border-r border-white/10 h-full p-6 text-zinc-100 shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-6 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-white">
                  GitProfile<span className="text-violet-500">Stats</span>
                </span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-zinc-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                aria-label="Close sidebar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 py-6 flex flex-col gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative group ${
                      isActive
                        ? 'bg-white/5 text-white border border-white/5'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-3.5 bottom-3.5 w-1 rounded-r-md bg-gradient-to-b from-violet-500 to-fuchsia-500" />
                    )}
                    <Icon
                      className={`w-4 h-4 transition-colors duration-200 ${isActive ? 'text-violet-400' : 'text-zinc-400 group-hover:text-white'}`}
                    />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Sidebar Footer info */}
            <div className="pt-4 border-t border-white/5 flex flex-col gap-4">
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/5"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1px] overflow-hidden shrink-0">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={`${user.username}'s GitHub avatar`}
                      width={40}
                      height={40}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-zinc-950 flex items-center justify-center font-bold text-sm text-white">
                      {user?.username?.substring(0, 2).toUpperCase() || 'US'}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-semibold text-sm text-white truncate">@{user?.username}</h5>
                  <p className="text-zinc-500 text-xs truncate">{user?.email || 'GitHub User'}</p>
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-rose-500/5 text-sm font-medium transition-all group text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-zinc-500 group-hover:text-rose-400" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/5 bg-[#030014]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 md:px-10">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Hamburger Toggle Button for mobile */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page title based on route */}
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {pathname === '/dashboard'
                ? 'Overview'
                : pathname === '/dashboard/cards'
                  ? 'Card Preview & Generator'
                  : pathname === '/dashboard/themes'
                    ? 'Theme Gallery'
                    : pathname === '/dashboard/repositories'
                      ? 'Repositories'
                      : pathname === '/dashboard/activity'
                        ? 'Activity & Streaks'
                        : pathname === '/dashboard/settings'
                          ? 'Settings'
                          : 'GitProfileStats'}
            </h2>
          </div>

          {/* Header Action Items */}
          <div className="flex items-center gap-2 sm:gap-3 relative">
            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileDropdownOpen(false);
                }}
                className={`p-2 rounded-xl border text-zinc-400 hover:text-white transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  notificationsOpen
                    ? 'border-violet-500/50 bg-violet-500/10 text-violet-300'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
                aria-label="System status and notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500" />
              </button>

              {/* Notification Popover Dropdown */}
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm rounded-2xl bg-[#08051e] border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        System Status
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        Operational
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5 mt-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-zinc-300 font-semibold">
                          <span>GitHub API Connection</span>
                          <span className="text-emerald-400 text-[10px]">Active</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          Card SVG generation endpoints are connected and cached at the edge.
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex flex-col gap-1">
                        <div className="flex items-center justify-between text-zinc-300 font-semibold">
                          <span>Rate Limits</span>
                          <span className="text-violet-400 text-[10px]">Normal</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-normal">
                          Public metrics are enabled by default. A Personal Access Token (PAT) is optional for private repo metrics.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Profile Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className={`flex items-center gap-2 border px-3 py-1.5 rounded-xl text-zinc-300 hover:text-white cursor-pointer transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  profileDropdownOpen
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                }`}
                aria-expanded={profileDropdownOpen}
                aria-label="User profile menu"
              >
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-white/10">
                  {user?.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={`${user.username}'s GitHub avatar`}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-white">
                      U
                    </div>
                  )}
                </div>
                <span className="hidden sm:inline text-xs font-semibold">@{user?.username}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${
                    profileDropdownOpen ? 'rotate-180 text-violet-400' : ''
                  }`}
                />
              </button>

              {/* Profile Menu Dropdown */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#08051e] border border-white/10 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-1">
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-xs font-bold text-white truncate">@{user?.username}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'GitHub Account'}</p>
                    </div>

                    <a
                      href={`https://github.com/${user?.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <span>GitHub Profile</span>
                      <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                    </a>

                    <Link
                      href="/dashboard/cards"
                      className="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <span>Card Studio</span>
                      <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
                    </Link>

                    <Link
                      href="/dashboard/settings"
                      className="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <span>Settings & PAT</span>
                      <Settings className="w-3.5 h-3.5 text-zinc-500" />
                    </Link>

                    <div className="border-t border-white/5 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center justify-between text-left cursor-pointer"
                    >
                      <span>Log Out</span>
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content viewport */}
        <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
