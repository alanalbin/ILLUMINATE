'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, ArrowUpRight, Shield } from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            href="https://www.ecell.in/illuminate/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase font-medium tracking-wider text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
          >
            <span>Official E-Cell</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/admin"
            className="text-xs uppercase font-medium tracking-wider text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            title="Coordinator Admin Dashboard"
          >
            <Shield className="w-3 h-3 text-purple-400" />
            <span>Admin</span>
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/register"
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
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-1.5 text-sm font-medium text-slate-300 hover:text-purple-400"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Admin Portal</span>
          </Link>
          <div className="pt-2">
            <Link
              href="/register"
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
