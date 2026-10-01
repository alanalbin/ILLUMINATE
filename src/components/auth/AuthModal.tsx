'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  LogOut,
  ArrowRight,
  Zap,
} from 'lucide-react';

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

export default function AuthModal() {
  const router = useRouter();
  const {
    user,
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    signOut,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.success) {
        closeAuthModal();
        router.push('/register');
      } else {
        setError(res.error || 'Failed to sign in with Google');
      }
    } catch (err: any) {
      setError(err?.message || 'Google Sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a0618] border border-purple-800/40 rounded-3xl shadow-2xl shadow-purple-950/70 overflow-hidden text-slate-100 p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img src="/logo-icon.png" alt="ILLUMINATE" className="h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
          </div>

          <h2 className="text-2xl font-black tracking-tight text-white">
            {user ? 'Welcome Back!' : 'Sign In with Google'}
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            {user
              ? 'You are signed in and ready to proceed.'
              : 'Sign in to access ILLUMINATE workshop passes & registration.'}
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Already Logged In */}
        {user ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-700/40 flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-12 h-12 rounded-full border border-purple-500/50 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-purple-800/50 text-purple-200 flex items-center justify-center font-bold text-lg">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user.displayName || 'Participant'}
                </p>
                <p className="text-xs text-purple-300 truncate">
                  {user.email || 'Google Account'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                closeAuthModal();
                router.push('/register');
              }}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-purple-950/80 cursor-pointer"
            >
              <span>Continue to Registration (₹699)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => signOut()}
                className="text-purple-400 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Not Logged In */
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm flex items-center justify-center gap-3 shadow-lg transition-all cursor-pointer disabled:opacity-70 group"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-105 transition-transform" />
              )}
              <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            <div className="pt-4 border-t border-purple-950/60 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Fast & secure login powered by Google</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
