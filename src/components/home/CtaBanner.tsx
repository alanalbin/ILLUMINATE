'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

interface CtaBannerProps {
  fee: number;
}

export default function CtaBanner({ fee }: CtaBannerProps) {
  return (
    <section className="py-24 md:py-32 bg-[#07060b] relative">
      <div className="max-w-4xl mx-auto px-6 sm:px-10 text-center">
        
        <span className="text-xs uppercase font-mono tracking-widest text-violet-400 block mb-3">
          Final Call for Registrations
        </span>

        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Ready to experience the startup journey?
        </h2>

        <p className="mt-5 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Reserve your seat for the 6-hour offline masterclass at KMCT College of Engineering, Kasaragod. Receive your official E-Cell IIT Bombay credential and startup kit.
        </p>

        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login?redirect=/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>Register with Google (₹{fee})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://www.ecell.in/illuminate/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-lg border border-white/[0.12] hover:bg-white/[0.04] text-zinc-300 text-sm font-medium transition-all flex items-center justify-center gap-2"
          >
            <span>Official E-Cell IIT Bombay Site</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <p className="mt-6 text-xs text-zinc-500 font-mono">
          SECURE ENCRYPTED REGISTRATION · OFFICIAL NEC PASS · LIMITED COHORT SEATS
        </p>

      </div>
    </section>
  );
}
