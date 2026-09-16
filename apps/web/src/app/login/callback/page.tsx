'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const error = searchParams.get('error');

    const timer = setTimeout(() => {
      if (error) {
        setStatus('error');
        setErrorMessage(decodeURIComponent(error));
      } else {
        setStatus('success');
      }
    }, 0);

    let redirectTimer: NodeJS.Timeout;
    if (!error) {
      redirectTimer = setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }

    return () => {
      clearTimeout(timer);
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [searchParams, router]);

  return (
    <div
      className="w-full max-w-md glass-card rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col items-center border border-white/10 shadow-2xl"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Decorative corner glows */}
      <div className="absolute -top-12 -right-12 w-24 h-24 rounded-full bg-violet-600/10 blur-xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-24 h-24 rounded-full bg-fuchsia-600/10 blur-xl pointer-events-none" />

      {status === 'loading' && (
        <div className="flex flex-col items-center text-center py-6">
          <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-violet-500/10 border-t-violet-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-4 border-fuchsia-500/10 border-b-fuchsia-500 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authenticating</h2>
          <p className="text-zinc-400 text-sm max-w-xs leading-relaxed">
            Connecting to your GitHub profile and establishing a secure session...
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center text-center py-6">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Login Successful</h2>
          <p className="text-zinc-400 text-sm max-w-xs mb-6 leading-relaxed">
            Welcome! Redirecting you to your dashboard...
          </p>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 animate-pulse w-full" />
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="flex flex-col items-center text-center py-6 w-full">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-lg shadow-rose-500/10">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Failed</h2>
          <p className="text-rose-400/90 text-xs font-medium bg-rose-950/20 border border-rose-500/10 rounded-xl px-4 py-3 mb-6 w-full max-w-xs break-words leading-relaxed">
            {errorMessage || 'An error occurred during authentication.'}
          </p>
          <Link
            href="/login"
            className="w-full py-3.5 rounded-xl font-bold bg-white text-zinc-950 hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <span>Back to Login</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CallbackPage() {
  return (
    <div className="relative min-h-screen bg-[#030014] text-zinc-100 flex flex-col justify-center items-center px-4 sm:px-6 selection:bg-violet-500/30 selection:text-violet-200">
      {/* Background glow spots */}
      <div className="glow-spot top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <Suspense
        fallback={
          <div className="w-full max-w-md glass-card rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center py-6 border border-white/10">
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Loading</h2>
            <p className="text-zinc-400 text-sm">Preparing authentication query...</p>
          </div>
        }
      >
        <CallbackHandler />
      </Suspense>
    </div>
  );
}
