'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Terminal,
  Sparkles,
  LogIn,
  BarChart3,
  Palette,
  Shield,
  ArrowRight,
  Check,
  Copy,
  Code,
  Settings,
  Zap,
  Flame,
  FolderGit2,
  Star,
  GitFork,
  Menu,
  X,
  Activity,
  ChevronRight,
} from 'lucide-react';

// GitHub SVG Component
const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Type definitions for Themes
interface ThemeConfig {
  name: string;
  id: string;
  borderClass: string;
  glowClass: string;
  bgGradient: string;
  accentText: string;
  barColor: string;
  badgeClass: string;
  dotColor: string;
}

const THEMES: Record<string, ThemeConfig> = {
  amethyst: {
    name: 'Neon Amethyst',
    id: 'amethyst',
    borderClass: 'border-violet-500/25 group-hover:border-violet-500/40',
    glowClass: 'bg-violet-600/10',
    bgGradient: 'from-violet-600/20 to-fuchsia-600/20',
    accentText: 'text-violet-400',
    barColor: 'from-violet-600 to-fuchsia-600',
    badgeClass: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    dotColor: 'bg-violet-500',
  },
  cyberpunk: {
    name: 'Cyberpunk Gold',
    id: 'cyberpunk',
    borderClass: 'border-amber-500/25 group-hover:border-amber-500/40',
    glowClass: 'bg-amber-600/10',
    bgGradient: 'from-amber-600/20 to-orange-600/20',
    accentText: 'text-amber-400',
    barColor: 'from-amber-500 to-orange-500',
    badgeClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    dotColor: 'bg-amber-500',
  },
  emerald: {
    name: 'Emerald Forest',
    id: 'emerald',
    borderClass: 'border-emerald-500/25 group-hover:border-emerald-500/40',
    glowClass: 'bg-emerald-600/10',
    bgGradient: 'from-emerald-600/20 to-teal-600/20',
    accentText: 'text-emerald-400',
    barColor: 'from-emerald-500 to-teal-500',
    badgeClass: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    dotColor: 'bg-emerald-500',
  },
  frost: {
    name: 'Arctic Frost',
    id: 'frost',
    borderClass: 'border-cyan-500/25 group-hover:border-cyan-500/40',
    glowClass: 'bg-cyan-600/10',
    bgGradient: 'from-cyan-600/20 to-blue-600/20',
    accentText: 'text-cyan-400',
    barColor: 'from-cyan-500 to-blue-500',
    badgeClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
    dotColor: 'bg-cyan-500',
  },
  rose: {
    name: 'Rose Pine',
    id: 'rose',
    borderClass: 'border-rose-400/25 group-hover:border-rose-400/40',
    glowClass: 'bg-rose-500/10',
    bgGradient: 'from-rose-500/20 to-pink-600/20',
    accentText: 'text-rose-400',
    barColor: 'from-rose-400 to-pink-500',
    badgeClass: 'bg-rose-400/10 border-rose-400/20 text-rose-400',
    dotColor: 'bg-rose-400',
  },
};

export default function Home() {
  // Navigation Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hero Section Interactive State
  const [heroTheme, setHeroTheme] = useState<string>('amethyst');
  const [showRank, setShowRank] = useState<boolean>(true);

  // Example Cards Interactive State
  const [activeTab, setActiveTab] = useState<'stats' | 'languages' | 'streak' | 'repos'>('stats');
  const [exampleTheme, setExampleTheme] = useState<string>('rose');

  // How it works Interactive State
  const [previewUsername, setPreviewUsername] = useState<string>('octocat');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [selectedWidgetType, setSelectedWidgetType] = useState<string>('stats');

  // Simulated live typing effect for hero username
  const [animatedUsername, setAnimatedUsername] = useState('o');
  const targetUsername = 'octocat';

  useEffect(() => {
    let index = 1;
    const interval = setInterval(() => {
      if (index < targetUsername.length) {
        setAnimatedUsername(targetUsername.substring(0, index + 1));
        index++;
      } else {
        setTimeout(() => {
          index = 0;
          setAnimatedUsername('o');
        }, 5000);
      }
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const widgetEndpoint =
    selectedWidgetType === 'repos' ? 'repository.svg' : `${selectedWidgetType}.svg`;
  const widgetQuery =
    selectedWidgetType === 'repos'
      ? `owner=${previewUsername || 'octocat'}&repo=hello-world&theme=${exampleTheme}`
      : `username=${previewUsername || 'octocat'}&theme=${exampleTheme}`;

  const handleCopyCode = () => {
    const code = `[![GitProfileStats](https://gitprofilestats.com/api/cards/${widgetEndpoint}?${widgetQuery})](https://github.com/${previewUsername || 'octocat'})`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const currentHeroTheme = THEMES[heroTheme] || THEMES.amethyst;
  const currentExampleTheme = THEMES[exampleTheme] || THEMES.rose;

  return (
    <div className="relative min-h-screen bg-[#030014] text-zinc-100 flex flex-col justify-between selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background glow spots */}
      <div className="glow-spot top-[-250px] left-[-100px] opacity-60 animate-pulse-slow" />
      <div className="glow-spot top-[40%] right-[-150px] opacity-50 animate-pulse-slow" />
      <div className="glow-spot bottom-[-200px] left-[20%] opacity-40 animate-pulse-slow" />

      {/* Modern Radial Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_10%,#000_60%,transparent_100%)] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#030014]/70 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" id="nav-logo">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-all duration-300">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
              GitProfile<span className="text-violet-500 font-semibold">Stats</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors duration-200">
              Features
            </a>
            <a href="#example-cards" className="hover:text-white transition-colors duration-200">
              Example Cards
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-200">
              How It Works
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-200 flex items-center gap-1.5"
            >
              GitHub <Github className="w-4 h-4" />
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold hover:text-white hover:border-white/20 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] flex items-center gap-2 hover:bg-white/[0.06] transition-all duration-200"
              id="btn-signin"
            >
              <LogIn className="w-4 h-4 text-zinc-400" />
              <span>Sign In</span>
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-white px-5 py-2 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 flex items-center gap-1.5 shadow-lg shadow-violet-500/15 hover:shadow-violet-500/25 hover:scale-[1.02] active:scale-[0.98]"
              id="btn-getstarted"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
            id="mobile-menu-toggle"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full border-b border-white/5 bg-[#030014]/95 backdrop-blur-xl px-6 py-6 flex flex-col gap-5 shadow-2xl">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#example-cards"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Example Cards
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-zinc-300 hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium text-zinc-300 hover:text-white flex items-center gap-2"
            >
              GitHub <Github className="w-5 h-5" />
            </a>
            <hr className="border-white/5 my-1" />
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center font-semibold text-white py-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center gap-2 hover:bg-white/10 hover-lift"
              >
                <LogIn className="w-4 h-4 text-zinc-400" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center font-semibold text-white py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center gap-2 hover-lift"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 pt-16 pb-28 flex flex-col lg:flex-row items-center gap-16 relative">
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left gap-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Premium GitHub Cards & Live Analytics</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.08] bg-gradient-to-br from-white via-zinc-100 to-zinc-500 bg-clip-text text-transparent">
              Elevate Your GitHub Profile in a Single Click
            </h1>

            <p className="text-zinc-400 text-lg md:text-xl max-w-xl leading-relaxed">
              Create gorgeous, dynamically generated SVG cards representing your commits, stars,
              streaks, and repository stats. Personalize with stunning presets and enrich your
              profile README.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-xl font-bold bg-white text-zinc-950 hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 group"
                id="hero-cta-dashboard"
              >
                <span>Customize Your Cards</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-xl font-bold border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
                id="hero-cta-howitworks"
              >
                <span>See How It Works</span>
                <Code className="w-5 h-5 text-zinc-400" />
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="pt-6 border-t border-white/5 w-full flex flex-wrap justify-center lg:justify-start gap-8 text-zinc-500 text-xs font-mono">
              <div>
                <span className="text-white font-bold block text-lg font-sans">15+</span>
                Theme Presets
              </div>
              <div>
                <span className="text-white font-bold block text-lg font-sans">&lt; 15ms</span>
                Response Latency
              </div>
              <div>
                <span className="text-white font-bold block text-lg font-sans">100%</span>
                Open Source
              </div>
            </div>
          </div>

          {/* Interactive Card Mockup Showcase */}
          <div className="flex-1 w-full max-w-md lg:max-w-none relative flex flex-col items-center">
            {/* Background Accent glow */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full ${currentHeroTheme.glowClass} blur-3xl transition-colors duration-500 pointer-events-none`}
            />

            {/* Live customizer controls */}
            <div className="w-full max-w-lg mb-4 glass-panel rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs border border-white/5">
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-zinc-300 font-medium">Theme:</span>
                <div className="flex gap-1.5" role="radiogroup" aria-label="Select hero card theme">
                  {Object.keys(THEMES).map((themeKey) => (
                    <button
                      key={themeKey}
                      onClick={() => setHeroTheme(themeKey)}
                      className={`w-5 h-5 rounded-full border transition-all duration-200 ${
                        heroTheme === themeKey
                          ? 'border-white scale-120 ring-2 ring-violet-500/30'
                          : 'border-transparent opacity-60 hover:opacity-100 hover:scale-110'
                      } ${THEMES[themeKey].dotColor} focus-visible:ring-2 focus-visible:ring-violet-500 focus:outline-none`}
                      title={THEMES[themeKey].name}
                      id={`theme-btn-${themeKey}`}
                      role="radio"
                      aria-checked={heroTheme === themeKey}
                      aria-label={`Select ${THEMES[themeKey].name} theme`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Show Rank:</span>
                <button
                  onClick={() => setShowRank(!showRank)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    showRank ? 'bg-violet-600' : 'bg-zinc-800'
                  }`}
                  id="rank-toggle-btn"
                  role="switch"
                  aria-checked={showRank}
                  aria-label="Show rank in stats card"
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showRank ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* The Live Rendered Card */}
            <div
              className={`w-full max-w-lg glass-card rounded-2xl p-6 relative overflow-hidden group border ${currentHeroTheme.borderClass} animate-float`}
            >
              {/* Glossy highlight shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2.2s_infinite] pointer-events-none" />

              {/* Card Title Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center relative">
                    <Image
                      src={`https://github.com/identicons/${animatedUsername || 'octocat'}.png`}
                      alt={`GitHub avatar of ${animatedUsername || 'octocat'}`}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg opacity-85"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ${currentHeroTheme.dotColor} border-2 border-[#090620]`}
                    />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-white tracking-tight flex items-center gap-1.5">
                      @{animatedUsername}
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </h4>
                    <p className="text-zinc-500 text-xs">San Francisco, CA</p>
                  </div>
                </div>

                {showRank && (
                  <div
                    className={`px-3 py-1 rounded-lg border font-black text-sm tracking-wide ${currentHeroTheme.badgeClass}`}
                  >
                    A+ RANK
                  </div>
                )}
              </div>

              {/* Stats Metrics */}
              <div className="py-6 grid grid-cols-3 gap-4 border-b border-white/5">
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-extrabold font-mono">
                    Repositories
                  </p>
                  <p className="text-2xl font-black text-white mt-0.5">142</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-extrabold font-mono">
                    Followers
                  </p>
                  <p className="text-2xl font-black text-white mt-0.5">8.9k</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-extrabold font-mono">
                    Total Stars
                  </p>
                  <p className="text-2xl font-black text-white mt-0.5">2,385</p>
                </div>
              </div>

              {/* Graph representation */}
              <div className="py-5 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-wider font-extrabold font-mono flex items-center gap-1.5">
                    <Activity className={`w-3 h-3 ${currentHeroTheme.accentText}`} />
                    Commit Activity Frequency
                  </p>
                  <span className={`text-[10px] font-bold ${currentHeroTheme.accentText}`}>
                    86 commits this month
                  </span>
                </div>

                {/* Horizontal bar languages chart representation */}
                <div className="h-6 flex rounded-lg overflow-hidden bg-white/5 p-1 border border-white/5">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-l-md transition-all duration-500"
                    style={{ width: '55%' }}
                    title="TypeScript (55%)"
                  />
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: '25%' }}
                    title="Rust (25%)"
                  />
                  <div
                    className="bg-amber-500 h-full transition-all duration-500"
                    style={{ width: '12%' }}
                    title="Go (12%)"
                  />
                  <div
                    className="bg-zinc-600 h-full rounded-r-md transition-all duration-500"
                    style={{ width: '8%' }}
                    title="Other (8%)"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-500 mt-2 font-mono">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 block" /> TypeScript
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 block" /> Rust
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 block" /> Go
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 block" /> Other
                  </span>
                </div>
              </div>

              {/* Tag / Meta */}
              <div className="pt-4 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span className="flex items-center gap-1">
                  <Zap className={`w-3.5 h-3.5 ${currentHeroTheme.accentText}`} />
                  Updates in real time
                </span>
                <span>Powered by GitProfileStats</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section
          id="features"
          className="border-t border-white/5 bg-white/[0.005] py-28 relative scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
                Full-Featured Stats Engine
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg">
                Everything you need to turn your profile README into a dynamic resume that tells
                your unique developer story.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass-card rounded-2xl p-8 flex flex-col gap-5 hover:border-violet-500/30 group">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-white">Dynamic SVG Rendering</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Real-time generated vector badges that require zero hosting. Simply reference the
                  API endpoint in your Markdown and let it handle the rest automatically.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="glass-card rounded-2xl p-8 flex flex-col gap-5 hover:border-pink-500/30 group">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform duration-300">
                  <Palette className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-white">Interactive Theme Editor</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Choose from custom built-in themes like Neon Amethyst, Synthwave, or Nord, or
                  write your own custom parameters using direct Hex/HSL queries.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="glass-card rounded-2xl p-8 flex flex-col gap-5 hover:border-indigo-500/30 group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-white">Complete Privacy Shield</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Your token security is paramount. Your authorization is kept safe and clean. We
                  never track or store individual repository details to database schemas.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="glass-card rounded-2xl p-8 flex flex-col gap-5 hover:border-emerald-500/30 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                  <Activity className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-white">Advanced Language Graphs</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Generate pie charts, progress blocks, or horizontal metrics representing your
                  actual codebase volume. Filter out forks and system files automatically.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="glass-card rounded-2xl p-8 flex flex-col gap-5 hover:border-amber-500/30 group">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform duration-300">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-white">Contribution Streaks</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Track and display your consistency streaks without relying on external widgets.
                  Display current streak, peak achievements, and overall records.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="glass-card rounded-2xl p-8 flex flex-col gap-5 hover:border-cyan-500/30 group">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-white">Edge Caching Speed</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Cards are distributed using Vercel/Cloudflare Edge networks. Response times
                  average 12-25 milliseconds, guaranteeing your profile README loads instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Example Cards Section */}
        <section id="example-cards" className="border-t border-white/5 py-28 relative scroll-mt-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
                Explore Card Layouts & Presets
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg">
                Toggle through different widget styles and colors to find the exact format for your
                profile page.
              </p>
            </div>

            {/* Layout Customizer interface */}
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              {/* Selection Column */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                {/* 1. Card Type Selectors */}
                <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col gap-3">
                  <h4 className="font-bold text-sm text-zinc-300 tracking-wide uppercase font-mono">
                    1. Select Widget Type
                  </h4>
                  <div
                    className="flex flex-col gap-2"
                    role="tablist"
                    aria-label="Widget preview type"
                  >
                    <button
                      onClick={() => {
                        setActiveTab('stats');
                        setSelectedWidgetType('stats');
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        activeTab === 'stats'
                          ? 'bg-violet-600/10 border-violet-500 text-white font-semibold'
                          : 'bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/[0.03] hover:text-white'
                      }`}
                      id="tab-btn-stats"
                      role="tab"
                      aria-selected={activeTab === 'stats'}
                      aria-controls="widget-preview-panel"
                    >
                      <span className="flex items-center gap-2.5">
                        <BarChart3 className="w-4.5 h-4.5" />
                        Overview Stats
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('languages');
                        setSelectedWidgetType('languages');
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        activeTab === 'languages'
                          ? 'bg-violet-600/10 border-violet-500 text-white font-semibold'
                          : 'bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/[0.03] hover:text-white'
                      }`}
                      id="tab-btn-languages"
                      role="tab"
                      aria-selected={activeTab === 'languages'}
                      aria-controls="widget-preview-panel"
                    >
                      <span className="flex items-center gap-2.5">
                        <Palette className="w-4.5 h-4.5" />
                        Top Languages
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('streak');
                        setSelectedWidgetType('streak');
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        activeTab === 'streak'
                          ? 'bg-violet-600/10 border-violet-500 text-white font-semibold'
                          : 'bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/[0.03] hover:text-white'
                      }`}
                      id="tab-btn-streak"
                      role="tab"
                      aria-selected={activeTab === 'streak'}
                      aria-controls="widget-preview-panel"
                    >
                      <span className="flex items-center gap-2.5">
                        <Flame className="w-4.5 h-4.5" />
                        Contribution Streak
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('repos');
                        setSelectedWidgetType('repos');
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                        activeTab === 'repos'
                          ? 'bg-violet-600/10 border-violet-500 text-white font-semibold'
                          : 'bg-white/[0.01] border-white/5 text-zinc-400 hover:bg-white/[0.03] hover:text-white'
                      }`}
                      id="tab-btn-repos"
                      role="tab"
                      aria-selected={activeTab === 'repos'}
                      aria-controls="widget-preview-panel"
                    >
                      <span className="flex items-center gap-2.5">
                        <FolderGit2 className="w-4.5 h-4.5" />
                        Top Repositories
                      </span>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </button>
                  </div>
                </div>

                {/* 2. Theme Selection */}
                <div className="glass-panel rounded-2xl p-5 border border-white/5 flex flex-col gap-3">
                  <h4 className="font-bold text-sm text-zinc-300 tracking-wide uppercase font-mono">
                    2. Choose Card Theme
                  </h4>
                  <div
                    className="grid grid-cols-2 gap-2"
                    role="radiogroup"
                    aria-label="Select widget preview theme"
                  >
                    {Object.keys(THEMES).map((themeKey) => (
                      <button
                        key={themeKey}
                        onClick={() => setExampleTheme(themeKey)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all text-xs text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                          exampleTheme === themeKey
                            ? 'border-violet-500/60 bg-violet-500/5 text-white font-semibold'
                            : 'border-white/5 bg-white/[0.01] text-zinc-400 hover:bg-white/[0.03] hover:text-white'
                        }`}
                        id={`example-theme-btn-${themeKey}`}
                        role="radio"
                        aria-checked={exampleTheme === themeKey}
                        aria-label={`Select ${THEMES[themeKey].name} preview theme`}
                      >
                        <span
                          className={`w-3.5 h-3.5 rounded-full ${THEMES[themeKey].dotColor} shrink-0`}
                        />
                        <span className="truncate">{THEMES[themeKey].name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rendering Column */}
              <div className="lg:col-span-8 flex flex-col gap-6 w-full items-center lg:items-stretch">
                {/* Visualizer Frame */}
                <div
                  id="widget-preview-panel"
                  role="tabpanel"
                  aria-label="Widget preview visualizer"
                  className="w-full glass-panel border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[350px]"
                >
                  {/* Glowing background layer matching selection */}
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full ${currentExampleTheme.glowClass} blur-3xl transition-all duration-500 pointer-events-none`}
                  />

                  {/* Live Render container */}
                  <div className="w-full max-w-lg z-10 transition-all duration-500">
                    {/* STATS CARD PREVIEW */}
                    {activeTab === 'stats' && (
                      <div
                        className={`glass-card p-6 rounded-2xl border ${currentExampleTheme.borderClass}`}
                      >
                        <div className="flex items-center justify-between pb-5 border-b border-white/5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-bold ${currentExampleTheme.accentText}`}
                            >
                              GPS
                            </div>
                            <div>
                              <h5 className="font-extrabold text-sm text-white">GitHub Stats</h5>
                              <p className="text-zinc-500 text-xs">Generated for @octocat</p>
                            </div>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-md border text-xs font-black tracking-wide ${currentExampleTheme.badgeClass}`}
                          >
                            RANK A
                          </span>
                        </div>
                        <div className="py-5 flex flex-col gap-3.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400">Total Commits:</span>
                            <span className="font-bold text-white font-mono">1,824</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400">Pull Requests Merged:</span>
                            <span className="font-bold text-white font-mono">92</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400">Issues Resolved:</span>
                            <span className="font-bold text-white font-mono">48</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400">Repositories Starred:</span>
                            <span className="font-bold text-white font-mono">612</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                          <span>Theme: {currentExampleTheme.name}</span>
                          <span>api/cards/stats.svg</span>
                        </div>
                      </div>
                    )}

                    {/* LANGUAGES CARD PREVIEW */}
                    {activeTab === 'languages' && (
                      <div
                        className={`glass-card p-6 rounded-2xl border ${currentExampleTheme.borderClass}`}
                      >
                        <div className="pb-5 border-b border-white/5">
                          <h5 className="font-extrabold text-sm text-white">Language Breakdown</h5>
                          <p className="text-zinc-500 text-xs">
                            Actual volume in bytes based on 84 repos
                          </p>
                        </div>

                        <div className="py-5 flex flex-col gap-4">
                          {/* Progress bar stack */}
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-white">TypeScript</span>
                              <span className="text-zinc-400 font-mono">64.5%</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div
                                className={`bg-gradient-to-r ${currentExampleTheme.barColor} h-full rounded-full`}
                                style={{ width: '64.5%' }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-white">Rust</span>
                              <span className="text-zinc-400 font-mono">22.1%</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{ width: '22.1%' }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-semibold text-white">Python</span>
                              <span className="text-zinc-400 font-mono">8.4%</span>
                            </div>
                            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-amber-500 h-full rounded-full"
                                style={{ width: '8.4%' }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                          <span>3 main languages parsed</span>
                          <span>api/cards/languages.svg</span>
                        </div>
                      </div>
                    )}

                    {/* STREAK CARD PREVIEW */}
                    {activeTab === 'streak' && (
                      <div
                        className={`glass-card p-6 rounded-2xl border ${currentExampleTheme.borderClass}`}
                      >
                        <div className="pb-5 border-b border-white/5 flex items-center justify-between">
                          <div>
                            <h5 className="font-extrabold text-sm text-white">Commit Streak</h5>
                            <p className="text-zinc-500 text-xs">Consistency calendar tracker</p>
                          </div>
                          <Flame className={`w-6 h-6 text-orange-500 animate-bounce`} />
                        </div>

                        <div className="py-6 grid grid-cols-3 gap-3 text-center">
                          <div className="p-2 border border-white/5 bg-white/[0.01] rounded-xl">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold font-mono">
                              Current Streak
                            </p>
                            <p
                              className={`text-2xl font-black ${currentExampleTheme.accentText} mt-1`}
                            >
                              18
                            </p>
                            <p className="text-[9px] text-zinc-500 mt-0.5">Days</p>
                          </div>
                          <div className="p-2 border border-white/5 bg-white/[0.01] rounded-xl">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold font-mono">
                              Longest Streak
                            </p>
                            <p className="text-2xl font-black text-white mt-1">42</p>
                            <p className="text-[9px] text-zinc-500 mt-0.5">Days (Jul 2026)</p>
                          </div>
                          <div className="p-2 border border-white/5 bg-white/[0.01] rounded-xl">
                            <p className="text-[10px] text-zinc-500 uppercase font-bold font-mono">
                              Total Commits
                            </p>
                            <p className="text-2xl font-black text-white mt-1">1.4k</p>
                            <p className="text-[9px] text-zinc-500 mt-0.5">Lifetime</p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                          <span>Updated minutes ago</span>
                          <span>api/cards/streak.svg</span>
                        </div>
                      </div>
                    )}

                    {/* REPOSITORIES CARD PREVIEW */}
                    {activeTab === 'repos' && (
                      <div
                        className={`glass-card p-6.5 rounded-2xl border ${currentExampleTheme.borderClass}`}
                      >
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                          <div className="flex items-center gap-2 text-white">
                            <FolderGit2 className={`w-5 h-5 ${currentExampleTheme.accentText}`} />
                            <h5 className="font-extrabold text-sm tracking-tight">
                              octocat/hello-world
                            </h5>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            Public
                          </span>
                        </div>

                        <p className="py-4 text-xs text-zinc-300 leading-relaxed">
                          A simple demonstration project that displays welcome messages and sets
                          standard greetings in multiple localizations. Beautifully configured
                          container models.
                        </p>

                        <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1.5">
                              <span
                                className={`w-2.5 h-2.5 rounded-full ${currentExampleTheme.dotColor}`}
                              />{' '}
                              TypeScript
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-500/20 text-amber-500" /> 182
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="w-3.5 h-3.5 text-zinc-500" /> 45
                            </span>
                          </div>
                          <span>api/cards/repository.svg</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Displaying API markdown code snippet for copying */}
                <div className="w-full glass-panel rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
                  <div className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none py-3 px-4 text-zinc-400 bg-black/25 rounded-lg border border-white/5">
                    <span className="text-zinc-600 select-none">!</span>
                    <span className="text-violet-400">[GitProfileStats]</span>
                    <span className="text-zinc-500">(https://gitprofilestats.com/api/cards/</span>
                    <span className="text-emerald-400">{widgetEndpoint}</span>
                    <span className="text-zinc-500">?</span>
                    <span className="text-amber-400">{widgetQuery}</span>
                    <span className="text-zinc-500">)</span>
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className={`px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 shrink-0 ${
                      copiedCode
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-zinc-950 hover:bg-zinc-200'
                    }`}
                    id="btn-copy-code"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Copied snippet!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Markdown</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how-it-works"
          className="border-t border-white/5 bg-white/[0.005] py-28 relative scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
                Integration in 4 Simple Steps
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg">
                Setting up GitProfileStats is straightforward and takes less than a minute. No
                coding required.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 relative flex flex-col gap-4">
                <span className="absolute top-4 right-4 text-3xl font-black text-white/5 font-mono select-none">
                  01
                </span>
                <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1.5">Enter Username</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                    Input your public GitHub username in our quick search helper to load initial
                    metrics.
                  </p>

                  {/* Interactive username input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={previewUsername}
                      onChange={(e) => setPreviewUsername(e.target.value)}
                      placeholder="e.g. torvalds"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-black/40 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/25 transition-all"
                      id="input-preview-username"
                    />
                    <span className="absolute right-2.5 top-2.5 text-[10px] text-zinc-500 font-mono">
                      handle
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 relative flex flex-col gap-4">
                <span className="absolute top-4 right-4 text-3xl font-black text-white/5 font-mono select-none">
                  02
                </span>
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1.5">Customize Styling</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Select layouts (Stats, Streak, Languages) and choose preconfigured themes or
                    custom color inputs to match your README layout style.
                  </p>
                </div>
                <div className="mt-auto pt-2 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                  <span>Layout: {selectedWidgetType}</span>
                  <span>Theme: {exampleTheme}</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 relative flex flex-col gap-4">
                <span className="absolute top-4 right-4 text-3xl font-black text-white/5 font-mono select-none">
                  03
                </span>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1.5">Grab Embed Code</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                    Copy the auto-generated raw Markdown string or absolute HTML component tag.
                  </p>

                  {/* Interactive click to copy button */}
                  <button
                    onClick={handleCopyCode}
                    className={`w-full py-2.5 rounded-lg border text-xs font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 ${
                      copiedCode
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                    }`}
                    id="step-copy-btn"
                  >
                    {copiedCode ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedCode ? 'Code Copied' : 'Copy Markdown'}</span>
                  </button>
                </div>
              </div>

              {/* Step 4 */}
              <div className="glass-card rounded-2xl p-6 border border-white/5 relative flex flex-col gap-4">
                <span className="absolute top-4 right-4 text-3xl font-black text-white/5 font-mono select-none">
                  04
                </span>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white mb-1.5">Embed & Impress</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed">
                    Paste the Markdown code into your profile description repository files, save,
                    and enjoy your beautiful automatic stats widget!
                  </p>
                </div>
                <div className="mt-auto pt-2 flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ready to go live
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative bg-black/25">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand info */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
                <Terminal className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                GitProfile<span className="text-violet-500">Stats</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-xs text-center md:text-left">
              Advanced GitHub profile card rendering engine. Designed with developer aesthetics.
            </p>
          </div>

          {/* Social / Info Links */}
          <div className="flex flex-wrap justify-center gap-8 text-xs font-semibold text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors duration-200">
              Features
            </a>
            <a href="#example-cards" className="hover:text-white transition-colors duration-200">
              Examples
            </a>
            <a href="#how-it-works" className="hover:text-white transition-colors duration-200">
              How It Works
            </a>
            <Link href="/dashboard" className="hover:text-white transition-colors duration-200">
              Dashboard
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors duration-200"
            >
              GitHub
            </a>
          </div>

          {/* Operational Status & Copyright */}
          <div className="flex flex-col items-center md:items-end gap-2 text-xs text-zinc-500">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-[10px] font-bold font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </div>
            <p>© {new Date().getFullYear()} GitProfileStats. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
