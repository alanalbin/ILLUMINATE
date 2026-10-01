'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowUpRight, LogOut, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#07060b]/90 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo / Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-sm">
            IL
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-white group-hover:text-violet-300 transition-colors">
              ILLUMINATE 2026
            </span>
            <span className="text-[11px] text-zinc-400 font-normal leading-none mt-0.5">
              KMCT Kasaragod × E-Cell IIT Bombay
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="/#about"
            className="text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            About
          </a>
          <a
            href="/#workshop"
            className="text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Curriculum
          </a>
          <a
            href="/#benefits"
            className="text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Takeaways
          </a>
          <a
            href="/#logistics"
            className="text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Logistics
          </a>
          <a
            href="/#faq"
            className="text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            FAQ
          </a>

          <div className="h-4 w-[1px] bg-white/[0.08]" />

          <a
            href="https://nxtbyteksd.netlify.app/#cta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            title="KMCT College E-Cell (Nxt Byte)"
          >
            <span>Nxt Byte E-Cell</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-violet-900/60 text-violet-300 text-[10px] font-bold flex items-center justify-center">
                  {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-zinc-200 max-w-[120px] truncate">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </span>
              <button
                onClick={() => signOut()}
                className="p-1 text-zinc-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            href={user ? "/register" : "/login?redirect=/register"}
            className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-semibold tracking-tight transition-all shadow-sm active:scale-[0.98]"
          >
            Register — ₹699
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-zinc-300 hover:text-white transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0910] border-b border-white/[0.08] px-6 py-5 space-y-3">
          <nav className="flex flex-col space-y-2.5 pb-3 border-b border-white/[0.08]">
            <a
              href="/#about"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-300 hover:text-white"
            >
              About
            </a>
            <a
              href="/#workshop"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-300 hover:text-white"
            >
              Curriculum
            </a>
            <a
              href="/#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-300 hover:text-white"
            >
              Takeaways
            </a>
            <a
              href="/#logistics"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-300 hover:text-white"
            >
              Logistics
            </a>
            <a
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-300 hover:text-white"
            >
              FAQ
            </a>
            <a
              href="https://nxtbyteksd.netlify.app/#cta"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-emerald-400 flex items-center gap-1 pt-1"
            >
              <span>Nxt Byte (College E-Cell)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </nav>

          <div className="pt-2 flex flex-col gap-2.5">
            {user ? (
              <div className="flex items-center justify-between py-2 text-xs text-zinc-300">
                <span>Signed in as <strong>{user.displayName || user.email}</strong></span>
                <button
                  onClick={() => signOut()}
                  className="text-rose-400 hover:text-rose-300 text-xs font-semibold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 text-center text-xs font-semibold text-zinc-200 border border-white/[0.1] rounded-lg"
              >
                Sign In
              </Link>
            )}

            <Link
              href={user ? "/register" : "/login?redirect=/register"}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3 rounded-lg bg-white text-zinc-950 font-bold text-xs text-center shadow-sm"
            >
              Register for Workshop (₹699)
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
