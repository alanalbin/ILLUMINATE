'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Terminal,
  Cpu,
  ShieldCheck,
  Award,
  Sparkles,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

export default function DisplayWorkstation3D() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'curriculum' | 'credentials'>('terminal');

  // Trigger loading progression when component mounts or comes into view
  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 4;
      if (current >= 100) {
        current = 100;
        setIsLoaded(true);
        clearInterval(interval);
      }
      setLoadProgress(current);
    }, 90);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.03] border border-white/[0.08] text-xs font-mono uppercase tracking-wider text-zinc-300 mb-3">
            <Cpu className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span>Venture Studio Workstation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Interactive Masterclass Platform
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base leading-relaxed">
            Experience the 3D hands-on ideation and founder terminal used during the 6-hour offline masterclass.
          </p>
        </div>

        {/* 3D Scroll Popup Container */}
        <div className="md:perspective-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <TouchInteractiveTilt maxTilt={6} glareOpacity={0.2} className="w-full">
              
              {/* Outer PC / Studio Display Rectangle Frame */}
              <div className="relative rounded-2xl sm:rounded-3xl bg-[#0e091d] border-2 border-white/[0.14] p-3 sm:p-5 shadow-[0_25px_70px_rgba(0,0,0,0.85)] shadow-purple-950/40 backdrop-blur-2xl">
                
                {/* Top Display Bezel with Camera Notch & Indicator */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08] mb-3 text-xs text-zinc-400 select-none">
                  {/* Window Control Buttons */}
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-sm" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-sm" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-sm" />
                    <span className="hidden sm:inline-block ml-3 font-mono text-[11px] text-zinc-500">
                      display-port://illuminate.local:3000
                    </span>
                  </div>

                  {/* Center Web Camera Notch */}
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 inline-block" />
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping inline-block" />
                  </div>

                  {/* System Status */}
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-zinc-500 hidden md:inline-block">Status:</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {isLoaded ? 'ONLINE' : `BOOTING ${loadProgress}%`}
                    </span>
                  </div>
                </div>

                {/* PC Screen Inner Canvas */}
                <div className="rounded-xl sm:rounded-2xl bg-[#07050f] border border-white/[0.08] overflow-hidden min-h-[420px] flex flex-col relative">
                  
                  {/* Top Animated Progress Loading Bar */}
                  <div className="h-1 bg-white/[0.04] w-full overflow-hidden relative">
                    <motion.div
                      className="h-full bg-gradient-to-r from-violet-500 via-indigo-400 to-emerald-400"
                      initial={{ width: '0%' }}
                      animate={{ width: `${loadProgress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.1 }}
                    />
                  </div>

                  {/* Display Sub-Navigation Tabs */}
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-3 sm:px-4 py-2 sm:py-2.5 bg-black/40 text-xs gap-2 overflow-x-auto scrollbar-none">
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        onClick={() => setActiveTab('terminal')}
                        className={`px-3 py-1.5 rounded-md font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                          activeTab === 'terminal'
                            ? 'bg-white/10 text-white font-semibold'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5 text-violet-400" />
                        <span>System Terminal</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('curriculum')}
                        className={`px-3 py-1.5 rounded-md font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                          activeTab === 'curriculum'
                            ? 'bg-white/10 text-white font-semibold'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Modules Engine</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('credentials')}
                        className={`px-3 py-1.5 rounded-md font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                          activeTab === 'credentials'
                            ? 'bg-white/10 text-white font-semibold'
                            : 'text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        <span>IIT Bombay Cert</span>
                      </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-500">
                      <span>KMCT Kasaragod • E-Cell IIT Bombay</span>
                    </div>
                  </div>

                  {/* TAB 1: TERMINAL BOOT SEQUENCE */}
                  {activeTab === 'terminal' && (
                    <div className="p-5 sm:p-7 flex-1 font-mono text-xs text-zinc-300 space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-violet-400 pb-2 border-b border-white/[0.06]">
                          <img src="/logo-icon.png" alt="ILLUMINATE" className="w-4 h-4 object-contain" />
                          <span className="font-bold">ILLUMINATE WORKSTATION OS [Version 2.4.0]</span>
                        </div>

                        <p className="text-zinc-500">
                          Copyright (c) E-Cell, IIT Bombay & KMCT College of Engineering. All rights reserved.
                        </p>

                        <div className="pt-2 space-y-1.5">
                          <p className="text-emerald-400 flex items-center gap-2">
                            <span className="text-zinc-500">09:00:01</span>
                            <span>[OK] Core architecture mounted: KMCTCEEM Campus, Kasaragod</span>
                          </p>

                          <p className="text-emerald-400 flex items-center gap-2">
                            <span className="text-zinc-500">09:00:03</span>
                            <span>[OK] Loaded Lean Canvas & Ideation Frameworks (6-Hour Masterclass)</span>
                          </p>

                          <p className="text-emerald-400 flex items-center gap-2">
                            <span className="text-zinc-500">09:00:05</span>
                            <span>[OK] E-Cell IIT Bombay Official Certificate Pipeline initialized</span>
                          </p>

                          <p className="text-emerald-400 flex items-center gap-2">
                            <span className="text-zinc-500">09:00:07</span>
                            <span>[OK] Startup Kit inventory confirmed: Physical Workbooks & Badges allocated</span>
                          </p>

                          <p className="text-purple-300 flex items-center gap-2">
                            <span className="text-zinc-500">09:00:09</span>
                            <span>[LIVE] Cohort Registration Desk active: KMCT E-Cell Coordination Desk (Admissions Open)</span>
                          </p>
                        </div>
                      </div>

                      {/* Interactive Prompt / Status Strip */}
                      <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span className="animate-pulse">●</span>
                          <span>{isLoaded ? 'System compilation finished. 70/70 Seats ready.' : `Loading assets... ${loadProgress}%`}</span>
                        </div>

                        <div className="text-zinc-400 font-mono">
                          Official Tariff: <strong className="text-white">₹699/-</strong> per participant
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CURRICULUM MODULES PREVIEW */}
                  {activeTab === 'curriculum' && (
                    <div className="p-5 sm:p-7 flex-1 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                          <span className="font-mono text-[10px] text-violet-400 uppercase tracking-wider block mb-1">
                            Phase 01
                          </span>
                          <h4 className="text-sm font-semibold text-white">Ideation & Problem Fit</h4>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                            Discover high-value campus and commercial startup opportunities.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                          <span className="font-mono text-[10px] text-indigo-400 uppercase tracking-wider block mb-1">
                            Phase 02
                          </span>
                          <h4 className="text-sm font-semibold text-white">Lean Modeling & Unit Economics</h4>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                            Revenue engines, cost structures, and competitive moats.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                          <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">
                            Phase 03
                          </span>
                          <h4 className="text-sm font-semibold text-white">Investor Pitch Sprint</h4>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                            Build and present pitch decks evaluated by seasoned mentors.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CREDENTIAL VERIFICATION PREVIEW */}
                  {activeTab === 'credentials' && (
                    <div className="p-5 sm:p-7 flex-1 flex flex-col justify-center items-center text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-emerald-400 shadow-inner">
                        <Award className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-white">Official Certificate from E-Cell IIT Bombay</h4>
                      <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                        Every offline attendee who finishes the 6-hour masterclass earns a digitally verifiable credential endorsed under the National Entrepreneurship Challenge.
                      </p>
                    </div>
                  )}

                </div>

                {/* Metallic Desktop Stand Mockup Base */}
                <div className="hidden sm:block w-36 h-4 mx-auto bg-gradient-to-b from-white/10 to-transparent rounded-b-xl border-x border-b border-white/10 mt-1 shadow-md" />
                <div className="hidden sm:block w-48 h-1.5 mx-auto bg-white/20 rounded-full shadow-lg" />

              </div>

            </TouchInteractiveTilt>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
