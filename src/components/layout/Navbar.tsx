'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, ArrowUpRight, Shield, User, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, openAuthModal, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#05030a]/80 backdrop-blur-xl border-b border-purple-950/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo / Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-500 flex items-center justify-center shadow-md shadow-purple-900/50 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-widest text-white uppercase group-hover:text-purple-300 transition-colors">
              ILLUMINATE
            </span>
            <span className="text-[10px] text-purple-400/90 font-medium tracking-tight">
              KMCT Kasaragod • E-Cell IIT Bombay
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7">
          <a
            href="/#about"
            className="text-xs uppercase font-medium tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            About
          </a>
          <a
            href="/#workshop"
            className="text-xs uppercase font-medium tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            Workshop
          </a>
          <a
            href="/#benefits"
            className="text-xs uppercase font-medium tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            Benefits
          </a>
          <a
            href="/#faq"
            className="text-xs uppercase font-medium tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            FAQ
          </a>
          <a
            href="https://nxtbyteksd.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase font-semibold tracking-wider text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/30 hover:border-emerald-400/50 shadow-sm shadow-emerald-950/40"
            title="Nxt Byte — KMCTCEEM College E-Cell"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>College E-Cell (Nxt Byte)</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
          <a
            href="https://www.ecell.in/illuminate/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase font-medium tracking-wider text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>IIT Bombay E-Cell</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-2 pr-3 py-1">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-purple-500/50 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-purple-700 text-white text-[10px] font-bold flex items-center justify-center">
                  {(user.displayName || user.phoneNumber || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                {user.displayName || user.phoneNumber || 'User'}
              </span>
              <button
                onClick={() => signOut()}
                className="p-1 text-slate-400 hover:text-red-400 rounded-full transition-colors ml-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-purple-400" />
              <span>Sign In</span>
            </Link>
          )}

          <Link
            href={user ? "/register" : "/login?redirect=/register"}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-purple-950/60 hover:shadow-purple-700/40"
          >
            Register (₹699)
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070410]/95 backdrop-blur-2xl border-b border-purple-950/60 px-6 py-6 space-y-4">
          {/* User Sign In / Profile status on mobile */}
          {user ? (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-purple-500/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-700 text-white text-xs font-bold flex items-center justify-center">
                    {(user.displayName || user.phoneNumber || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[150px]">
                    {user.displayName || user.phoneNumber || 'User'}
                  </p>
                  <p className="text-[10px] text-purple-300">Signed in</p>
                </div>
              </div>
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-red-950/50 text-red-300 text-xs font-medium cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal();
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-purple-400" />
              <span>Sign In with OTP / Google</span>
            </button>
          )}

          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-200 hover:text-purple-400"
          >
            About Workshop
          </a>
          <a
            href="/#workshop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-200 hover:text-purple-400"
          >
            Workshop Structure
          </a>
          <a
            href="/#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-200 hover:text-purple-400"
          >
            Incentives & Benefits
          </a>
          <a
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-200 hover:text-purple-400"
          >
            FAQ
          </a>
          <a
            href="https://nxtbyteksd.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-semibold text-emerald-400 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30"
          >
            <span>College E-Cell (Nxt Byte)</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
          <div className="pt-2">
            <Link
              href={user ? "/register" : "/login?redirect=/register"}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-3 rounded-xl text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-950"
            >
              Register (₹699)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
