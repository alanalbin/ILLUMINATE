'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
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
    <div className="min-h-screen bg-[#07060b] py-24 sm:py-32 relative flex items-center justify-center px-6">
      
      <div className="w-full max-w-md relative z-10">
        
        {/* Navigation Back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Overview</span>
          </Link>

          <span className="text-[10px] font-mono uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded">
            Portal Access
          </span>
        </div>

        {/* Main Card Container */}
        <div className="surface-card rounded-xl p-8 sm:p-9 text-zinc-100">
          
          {/* Header */}
          <div className="mb-8">
            <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 block mb-2">
              Authentication
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {user ? 'Session Active' : 'Sign In to Register'}
            </h1>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              {user
                ? 'Your Google credentials are verified. Continue to finalize your pass.'
                : 'Authenticate with your Google account to secure your official workshop pass.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-800/40 text-red-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{error}</p>
                <button
                  onClick={() => setShowDemoOptions(true)}
                  className="text-red-300 hover:text-white underline text-[11px] mt-1.5 block"
                >
                  Blocked popup? Use 1-click organizer login
                </button>
              </div>
            </div>
          )}

          {/* STATE 1: ALREADY LOGGED IN */}
          {user ? (
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center gap-3.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-12 h-12 rounded-lg border border-white/10 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-lg">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.displayName || 'Participant'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    {user.email || 'Google Account'}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={redirectPath}
                className="w-full py-3.5 px-4 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <span>Proceed to Registration Form (₹699)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Sign out */}
              <div className="pt-2 flex items-center justify-between text-xs text-zinc-500 border-t border-white/[0.06]">
                <span>Wrong account?</span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-zinc-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* STATE 2: NOT SIGNED IN */
            <div className="space-y-6">
              
              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-lg bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                )}
                <span>{loading ? 'Authorizing...' : 'Continue with Google'}</span>
              </button>

              {/* Verification Details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-medium text-xs mb-1">
                    <Zap className="w-3.5 h-3.5 text-violet-400" />
                    <span>Instant Pass</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Direct access without OTP lag.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-1.5 text-zinc-300 font-medium text-xs mb-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>IIT Bombay Cert</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Tied to verified identity.
                  </p>
                </div>
              </div>

              {/* Quick Organizer Access */}
              <div className="pt-2 border-t border-white/[0.06]">
                {!showDemoOptions ? (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowDemoOptions(true)}
                      className="text-xs font-mono text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Coordinator Direct Access →
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDemoSignIn} className="space-y-3 p-4 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Organizer Direct Bypass
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDemoOptions(false)}
                        className="text-[11px] text-zinc-500 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Full Name"
                      value={demoName}
                      onChange={(e) => setDemoName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-400"
                      required
                    />

                    <input
                      type="email"
                      placeholder="Email Address"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-400"
                      required
                    />

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Authenticate & Continue
                    </button>
                  </form>
                )}
              </div>

            </div>
          )}

          {/* Security Note */}
          <div className="mt-8 pt-5 border-t border-white/[0.06] flex items-center justify-center gap-2 text-[11px] text-zinc-500">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            <span>Encrypted OAuth authorization via Google Identity</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07060b] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
