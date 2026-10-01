'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  UserCheck,
  LogOut,
  Award,
  Zap,
  Ticket,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.99 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/register';

  const {
    user,
    signInWithGoogle,
    signOut,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.success) {
        router.push(redirectPath);
      } else {
        setError(res.error || 'Failed to sign in with Google. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#05030a] py-12 sm:py-16 relative flex items-center justify-center px-4 overflow-hidden">
      {/* Background Cinematic Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-900/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-12 left-1/3 w-[450px] h-[280px] bg-indigo-900/18 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-[350px] h-[220px] bg-cyan-900/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        
        {/* Navigation Back & Status Badge */}
        <div className="mb-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>

          <span className="text-[11px] font-mono text-purple-300/90 bg-purple-950/60 border border-purple-800/40 px-3 py-1 rounded-full shadow-sm">
            E-Cell IIT Bombay • KMCT
          </span>
        </div>

        {/* 3D Interactive Tilt Card Box */}
        <TouchInteractiveTilt maxTilt={6} glareOpacity={0.3}>
          <div className="bg-gradient-to-b from-[#0d0720]/95 via-[#090518]/95 to-[#060310]/95 border border-purple-500/35 rounded-3xl shadow-2xl shadow-purple-950/80 overflow-hidden text-slate-100 p-7 sm:p-10 relative backdrop-blur-2xl">
            
            {/* Ambient Watermark */}
            <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 pointer-events-none opacity-[0.05] w-72 h-72 overflow-hidden" aria-hidden="true">
              <img src="/logo-icon.png" alt="" className="w-full h-full object-contain" />
            </div>

            {/* Header Badge & Brand */}
            <div className="text-center mb-8 relative z-10">
              <div className="flex justify-center mb-4">
                <div className="relative p-2.5 rounded-2xl bg-white/[0.03] border border-purple-500/30 shadow-lg shadow-purple-950/50">
                  <img
                    src="/logo.png"
                    alt="ILLUMINATE"
                    className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_0_20px_rgba(168,85,247,0.45)]"
                  />
                  <div className="absolute -top-1.5 -right-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-[9px] font-extrabold uppercase tracking-widest text-white shadow-md">
                    OFFICIAL
                  </div>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {user ? 'Verified Participant' : 'Sign In with Google'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-sm mx-auto leading-relaxed">
                {user
                  ? 'Your account is authenticated. Continue to secure your ILLUMINATE workshop pass.'
                  : 'Instant 1-click Google authentication. Receive your official E-Cell IIT Bombay certificate in your name.'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-lg">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                </div>
              </div>
            )}

            {/* STATE 1: USER ALREADY SIGNED IN WITH GOOGLE */}
            {user ? (
              <div className="space-y-6 relative z-10">
                {/* Holographic Passport Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/70 via-[#130b2c] to-indigo-950/50 border border-purple-500/40 flex items-center gap-4 shadow-xl">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-14 h-14 rounded-full border-2 border-purple-400 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-bold text-white truncate">
                        {user.displayName || 'Participant'}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-purple-300 truncate mt-0.5">
                      {user.email || 'Google Account'}
                    </p>
                  </div>
                </div>

                {/* Step indicator */}
                <div className="flex items-center gap-3 py-2 px-3.5 rounded-xl bg-purple-900/30 border border-purple-700/30 text-xs text-purple-200">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                    ✓
                  </span>
                  <span>Authentication verified! Proceed to fill your pass registration.</span>
                </div>

                {/* PRIMARY PROCEED BUTTON */}
                <Link
                  href={redirectPath}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-purple-950/80 hover:shadow-purple-700/50 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Proceed to Registration Form (₹699)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {/* Sign out switch */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>Want to switch Google accounts?</span>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="text-purple-400 hover:text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              /* STATE 2: NOT SIGNED IN -> PROMINENT GOOGLE LOGIN */
              <div className="space-y-6 relative z-10">
                
                {/* Step Flow Banner */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-950/40 border border-purple-800/30 text-xs">
                  <div className="flex items-center gap-2.5 text-purple-200 font-semibold">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                      1
                    </span>
                    <span>Step 1: Sign in with Google</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                    <span>Step 2: Registration</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </div>
                </div>

                {/* Big Vibrant Google Sign-in Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-black/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  {/* Subtle animated shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                  )}
                  <span>{loading ? 'Connecting with Google...' : 'Continue with Google'}</span>
                </button>

                {/* Key Benefits Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/30 text-left">
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs mb-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Instant Access</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      1-click authorization without OTP or password delays.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/30 text-left">
                    <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs mb-1">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>IIT Bombay Cert</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      Certificate tied directly to your verified Google account.
                    </p>
                  </div>
                </div>

              </div>
            )}

            {/* Footer Security Note */}
            <div className="mt-7 pt-4 border-t border-purple-950/60 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Secure 256-bit OAuth authentication by Google</span>
            </div>

          </div>
        </TouchInteractiveTilt>

        {/* Link back to College E-Cell */}
        <div className="mt-6 text-center">
          <a
            href="https://nxtbyteksd.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-white transition-colors bg-white/[0.03] border border-white/[0.08] hover:border-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>KMCT E-Cell (Nxt Byte)</span>
            <span className="text-[10px] text-zinc-400">↗</span>
          </a>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#05030a] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
