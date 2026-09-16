import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Terminal, Sparkles, KeyRound } from 'lucide-react';
import { env } from '@/config/env';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Connect your GitHub account to GitProfileStats to personalize your cards and analytics.',
  robots: {
    index: false,
    follow: false,
  },
};

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

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-[#030014] text-zinc-100 flex flex-col justify-center items-center px-4 sm:px-6 py-12 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background glow spots */}
      <div className="glow-spot top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-6 flex justify-start">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to home</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col items-center border border-white/10 shadow-2xl">
        {/* Decorative corner glows */}
        <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-violet-600/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-fuchsia-600/10 blur-xl pointer-events-none" />

        {/* Logo Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-6">
          <Terminal className="w-6 h-6 text-white" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold tracking-tight text-white mb-2 text-center">Welcome Back</h1>
        <p className="text-zinc-400 text-sm text-center mb-8 max-w-xs leading-relaxed">
          Connect your GitHub account to personalize your profile cards and access real-time
          analytics.
        </p>

        {/* Sign-In Button */}
        <a
          href={`${env.NEXT_PUBLIC_API_URL}/api/v1/auth/github`}
          className="w-full py-3.5 rounded-xl font-bold bg-white text-zinc-950 hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-xl shadow-white/5 flex items-center justify-center gap-3 group mb-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <Github className="w-5 h-5 text-zinc-950 group-hover:rotate-12 transition-transform duration-300" />
          <span>Continue with GitHub</span>
        </a>

        {/* Secondary helper info */}
        <div className="flex items-center gap-2 justify-center px-4 py-2.5 rounded-lg border border-white/5 bg-white/[0.02] text-zinc-500 text-xs w-full mb-6">
          <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
          <span>OAuth Mode: Connect securely via GitHub</span>
        </div>

        <div className="w-full flex items-center justify-between text-xs text-zinc-500 border-t border-white/5 pt-6">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Secure Encryption</span>
          </span>
          <span className="text-zinc-500">
            GitProfileStats v1.0
          </span>
        </div>
      </div>
    </div>
  );
}
