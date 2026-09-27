'use client';

import React from 'react';
import { Award, Package, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function StaticPhoneFallback() {
  return (
    <div className="relative w-[270px] sm:w-[310px] aspect-[9/19] rounded-[48px] p-2.5 bg-gradient-to-b from-[#2a1c40] via-[#140c24] to-[#0a0614] shadow-2xl border-[3.5px] border-[#58208a]/50 ring-1 ring-purple-400/20 mx-auto">
      
      {/* Dynamic Island pill with dual micro sensor cutouts */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-20 flex items-center justify-between px-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#0a0710] ring-1 ring-purple-900/60" />
        <div className="w-2 h-2 rounded-full bg-purple-950/80" />
      </div>

      {/* Screen Frame */}
      <div className="w-full h-full rounded-[40px] bg-[#06030c] overflow-hidden flex flex-col justify-between p-5 pt-11 relative text-left">
        {/* Ambient atmospheric glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div>
          <span className="text-[10px] font-bold tracking-widest text-purple-400 uppercase bg-purple-950/70 border border-purple-800/50 px-2.5 py-0.5 rounded-full">
            E-Cell IIT Bombay
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2.5">
            ILLUMINATE
          </h2>
          <p className="text-[11px] text-purple-200/80 mt-0.5">
            KMCT Kasaragod • 6-Hour Masterclass
          </p>

          <div className="mt-5 space-y-2">
            <div className="bg-[#120a22]/80 border border-purple-800/30 rounded-xl p-2.5 flex items-start gap-2.5">
              <Award className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">IIT Bombay Certificate</p>
                <p className="text-[10px] text-slate-400">Official participation credential</p>
              </div>
            </div>

            <div className="bg-[#120a22]/80 border border-purple-800/30 rounded-xl p-2.5 flex items-start gap-2.5">
              <Package className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Startup Learning Kit</p>
                <p className="text-[10px] text-slate-400">Physical ideation frameworks</p>
              </div>
            </div>

            <div className="bg-[#120a22]/80 border border-purple-800/30 rounded-xl p-2.5 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">₹700 Workshop Pass</p>
                <p className="text-[10px] text-slate-400">70 Minimum Target Cohort</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-2">
          <Link
            href="/register"
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl text-center text-xs font-bold text-white shadow-lg shadow-purple-950 flex items-center justify-center gap-1.5 transition-all"
          >
            <span>CLAIM YOUR SEAT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <div className="w-24 h-1 bg-white/20 rounded-full mx-auto mt-3.5" />
        </div>
      </div>
    </div>
  );
}
