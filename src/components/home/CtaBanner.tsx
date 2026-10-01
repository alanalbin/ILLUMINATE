import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

interface CtaBannerProps {
  fee: number;
}

export default function CtaBanner({ fee }: CtaBannerProps) {
  return (
    <section className="py-20 bg-[#05030a] relative overflow-hidden border-t border-purple-950/40">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/40 border border-purple-600/30 text-xs font-semibold text-purple-300 mb-6">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Offline Masterclass • Kasaragod</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Ready to experience the startup journey?
        </h2>

        <p className="mt-4 text-slate-300 max-w-xl mx-auto text-base">
          Secure your seat for the 6-hour offline ILLUMINATE workshop at KMCT College. Receive your official E-Cell IIT Bombay certificate and startup kit.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login?redirect=/register"
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-purple-950/60 transition-all flex items-center justify-center gap-2"
          >
            <span>Register Now (₹{fee})</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="https://www.ecell.in/illuminate/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-purple-500/20 text-sm font-semibold transition-all"
          >
            Visit Official E-Cell Site
          </a>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Secure registration • Instant digital confirmation pass</span>
        </div>

      </div>
    </section>
  );
}
