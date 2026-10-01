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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
    loginAsDemoUser,
    signOut,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoOptions, setShowDemoOptions] = useState(false);

  // Custom Quick Login
  const [demoName, setDemoName] = useState('Alan Albin');
  const [demoEmail, setDemoEmail] = useState('alanalbin06112005@gmail.com');

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.success) {
        // Successful Google login: route directly to destination
        router.push(redirectPath);
      } else {
        setError(res.error || 'Failed to sign in with Google. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google Sign-in failed. Please try again or use direct login.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoName.trim() || !demoEmail.trim()) {
      setError('Please provide your name and email');
      return;
    }

    loginAsDemoUser({
      displayName: demoName.trim(),
      email: demoEmail.trim(),
      phoneNumber: '+918848563266',
    });

    router.push(redirectPath);
  };

  return (
    <div className="min-h-screen bg-[#05030a] py-20 sm:py-24 relative flex items-center justify-center px-4">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-purple-900/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[350px] h-[250px] bg-indigo-900/20 rounded-full blur-[110px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        
        {/* Navigation Back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <span className="text-[11px] font-medium text-purple-400/80 bg-purple-950/60 border border-purple-800/40 px-3 py-1 rounded-full">
            E-Cell IIT Bombay • KMCT Kasaragod
          </span>
        </div>

        {/* Card Box */}
        <div className="bg-[#0a0618] border border-purple-800/40 rounded-3xl shadow-2xl shadow-purple-950/70 overflow-hidden text-slate-100 p-6 sm:p-9 relative backdrop-blur-xl">
          
          {/* Background subtle watermark */}
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 pointer-events-none opacity-[0.05] w-64 h-64 overflow-hidden" aria-hidden="true">
            <img src="/logo-icon.png" alt="" className="w-full h-full object-contain" />
          </div>

          {/* Header Badge */}
          <div className="text-center mb-7 relative z-10">
            <div className="flex justify-center mb-4">
              <img
                src="/logo.png"
                alt="ILLUMINATE"
                className="h-16 w-auto object-contain drop-shadow-[0_0_24px_rgba(168,85,247,0.35)]"
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {user ? 'Welcome Back!' : 'Sign In to Register'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm mx-auto">
              {user
                ? 'Your Google account is verified. Click below to complete your registration.'
                : 'Sign in with your Google account to get your official pass for ILLUMINATE.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-lg">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                <button
                  onClick={() => setShowDemoOptions(true)}
                  className="text-red-300 hover:text-white underline text-[11px] mt-1 block font-medium"
                >
                  Popup blocked? Click here for 1-click instant login
                </button>
              </div>
            </div>
          )}

          {/* STATE 1: USER ALREADY SIGNED IN WITH GOOGLE */}
          {user ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-indigo-950/40 border border-purple-600/40 flex items-center gap-3.5 shadow-inner">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-14 h-14 rounded-full border-2 border-purple-400/80 object-cover shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-white truncate">
                      {user.displayName || 'Participant'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-full">
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
              <div className="flex items-center gap-3 py-1 px-3 rounded-xl bg-purple-900/20 border border-purple-800/30 text-xs text-purple-300">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>Ready! Fill out your registration details and secure your pass.</span>
              </div>

              {/* PRIMARY PROCEED BUTTON */}
              <Link
                href={redirectPath}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-purple-950/80 hover:shadow-purple-700/50 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Proceed to Registration Form (₹699)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Sign out switch */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Want to use another Google account?</span>
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
            <div className="space-y-6">
              
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

              {/* Big Google Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-black/40 hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                )}
                <span>{loading ? 'Connecting with Google...' : 'Continue with Google'}</span>
              </button>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 text-left">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs mb-1">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Instant Access</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    1-click authorization without OTP or password delays.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/30 text-left">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold text-xs mb-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>IIT Bombay Cert</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Certificate tied directly to your verified Google account.
                  </p>
                </div>
              </div>

              {/* Instant Sign-In Option for Testing / Backup */}
              <div className="pt-2 border-t border-purple-900/30">
                {!showDemoOptions ? (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowDemoOptions(true)}
                      className="text-xs text-purple-400/80 hover:text-purple-300 transition-colors underline cursor-pointer"
                    >
                      Organizer / Quick 1-Click Access
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDemoSignIn} className="space-y-3 p-4 rounded-2xl bg-purple-950/50 border border-purple-700/40 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-purple-200 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Quick Direct Login
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDemoOptions(false)}
                        className="text-[11px] text-slate-400 hover:text-white"
                      >
                        Close
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={demoName}
                        onChange={(e) => setDemoName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-purple-800/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={demoEmail}
                        onChange={(e) => setDemoEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-black/60 border border-purple-800/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                    >
                      Login Directly & Continue
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}

          {/* Footer Security Note */}
          <div className="mt-8 pt-5 border-t border-purple-950/60 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Secure 256-bit OAuth authentication by Google</span>
          </div>

        </div>

        {/* Link back to College E-Cell */}
        <div className="mt-6 text-center">
          <a
            href="https://nxtbyteksd.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-full"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>KMCT E-Cell (Nxt Byte)</span>
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
        <div className="min-h-screen bg-[#05030a] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
