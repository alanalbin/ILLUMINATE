'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, ArrowUpRight, Zap } from 'lucide-react';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

interface CtaBannerProps {
  fee: number;
}

export default function CtaBanner({ fee }: CtaBannerProps) {
  return (
    <section className="py-24 bg-[#05030a] relative overflow-hidden border-t border-purple-950/40 z-10">
      
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 sm:px-10 relative z-20">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <TouchInteractiveTilt maxTilt={5} glareOpacity={0.25}>
            <div className="rounded-3xl bg-gradient-to-b from-purple-950/70 via-[#0d0720] to-indigo-950/50 border border-purple-600/40 p-9 sm:p-14 text-center shadow-2xl shadow-purple-950/80 backdrop-blur-2xl relative overflow-hidden">
              
              {/* Card Watermark */}
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 pointer-events-none opacity-[0.06] w-80 h-80 overflow-hidden" aria-hidden="true">
                <img src="/logo.png" alt="" className="w-full h-full object-contain" />
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/50 border border-purple-500/40 text-xs font-bold text-purple-300 mb-6 shadow-sm relative z-10">
                <img src="/logo-icon.png" alt="" className="w-4 h-4 object-contain" />
                <span>Offline Masterclass • Kasaragod</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
                Ready to Experience the Startup Journey?
              </h2>

              <p className="mt-4 text-slate-300 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
                Secure your seat for the 6-hour offline ILLUMINATE workshop at KMCT College. Receive your official E-Cell IIT Bombay certificate and startup kit.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/login?redirect=/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-base shadow-xl shadow-purple-950/80 hover:shadow-purple-700/50 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Register with Google (₹{fee})</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="https://www.ecell.in/illuminate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-purple-500/30 text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>Visit Official E-Cell Site</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Instant Google verification • Digital confirmation pass included</span>
              </div>

            </div>
          </TouchInteractiveTilt>
        </motion.div>

      </div>
    </section>
  );
}
