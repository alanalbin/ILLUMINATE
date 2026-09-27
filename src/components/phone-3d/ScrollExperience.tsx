'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight, Sparkles, ChevronDown, Clock, MapPin, IndianRupee, Phone, CheckCircle2 } from 'lucide-react';
import StaticPhoneFallback from './StaticPhoneFallback';

// Dynamically load Three.js scene for zero initial bundle blocking
const DynamicPhoneScene = dynamic(() => import('./PhoneScene'), {
  ssr: false,
  loading: () => <StaticPhoneFallback />,
});

// 5 Storyboard Phases for the dedicated fixed-height narrative panel
const STORY_PHASES = [
  {
    step: '01 / PRECISION TITANIUM BAND',
    title: 'Aerodynamic Space Titanium Chassis',
    desc: 'Sleek 0.175cm profile with micro-beveled titanium chamfers and antenna bands.',
  },
  {
    step: '02 / OLED MASTERCLASS SCREEN',
    title: 'High-Resolution Dynamic Interface',
    desc: 'Live workshop curriculum, mentor schedules, and hands-on startup sprints.',
  },
  {
    step: '03 / 3D EXPLODED ANATOMY',
    title: 'Deconstructing Venture Architecture',
    desc: 'Ceramic shield, OLED display, and rear chassis separating along calibrated axes.',
  },
  {
    step: '04 / SAPPHIRE OPTICS & CREDENTIAL',
    title: 'Official IIT Bombay Certification',
    desc: 'Prestigious E-Cell IIT Bombay certificate & physical Illuminate Startup Kit included.',
  },
  {
    step: '05 / REASSEMBLED & READY',
    title: 'Secure Your Cohort Seat (₹700)',
    desc: 'Join 70+ ambitious peers at KMCT. Contact Alan Albin (+91 8848563266) for details.',
  },
];

export default function ScrollExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollProgressRef = useRef<number>(0);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mql.matches);
    const motionListener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mql.addEventListener('change', motionListener);

    // Optimized passive scroll listener for the 3D phone ref
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;

      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      scrollProgressRef.current = progress;

      // Only update React state when the phase threshold actually changes (prevents layout thrashing)
      let phase = 0;
      if (progress < 0.22) phase = 0;
      else if (progress < 0.45) phase = 1;
      else if (progress < 0.72) phase = 2;
      else if (progress < 0.88) phase = 3;
      else phase = 4;

      setActivePhaseIndex((prev) => (prev !== phase ? phase : prev));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      mql.removeEventListener('change', motionListener);
    };
  }, []);

  const currentPhase = STORY_PHASES[activePhaseIndex];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[380vh] bg-[#05030a]"
      id="experience"
    >
      {/* Sticky Fullscreen Experience Viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center z-10">
        
        {/* Subtle, restrained ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_65%_45%,rgba(107,33,168,0.11),rgba(5,3,10,0))] pointer-events-none" />

        {/* Spacious Two-Column Layout */}
        <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 h-full flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-12 relative z-20">
          
          {/* ========================================================
              LEFT COLUMN: 100% Stationary & Stable Typography (~45%)
             ======================================================== */}
          <div className="w-full md:w-[48%] lg:w-[44%] shrink-0 flex flex-col justify-center pt-16 md:pt-0 z-30">
            
            {/* Event Association Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-xs font-semibold text-purple-300 w-fit mb-4 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>E-Cell, IIT Bombay Initiative • KMCT Kasaragod</span>
            </div>

            {/* Permanent Stationary Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.08]">
              ILLUMINATE <br />
              <span className="text-gradient-purple">KASARAGOD.</span>
            </h1>

            {/* Permanent Stationary Description */}
            <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-md font-normal leading-relaxed">
              An intensive 6-hour offline entrepreneurship masterclass at KMCT College. Experience startup building through hands-on case studies and mentor-led ideation sprints.
            </p>

            {/* Key Logistics Micro-Tags & Contact info */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-purple-500/20 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>6 Hours Offline</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-purple-500/20 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-purple-400" />
                <span>₹700 Workshop Pass</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-purple-500/20 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>KMCT Campus</span>
              </span>
            </div>

            {/* Registration Contact Banner featuring Alan Albin */}
            <div className="mt-3.5 flex items-center gap-2 text-xs text-slate-300">
              <span className="text-slate-400">Registration Details Contact:</span>
              <a
                href="tel:+918848563266"
                className="inline-flex items-center gap-1.5 font-bold text-purple-300 hover:text-purple-200 transition-colors bg-purple-950/40 border border-purple-800/40 px-2.5 py-0.5 rounded-md"
              >
                <Phone className="w-3 h-3 text-purple-400" />
                <span>Alan Albin: +91 8848563266</span>
              </a>
            </div>

            {/* Permanent Action Buttons */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="px-6 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-950 flex items-center gap-2 group"
              >
                <span>Register Now (₹700)</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#about"
                className="px-5 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-purple-500/20 text-sm font-medium transition-all"
              >
                Explore Workshop
              </a>
            </div>

            {/* ========================================================
                DEDICATED NARRATIVE PANEL (Fixed Height, Zero Layout Shift)
               ======================================================== */}
            <div className="mt-6 p-4 rounded-2xl bg-purple-950/30 border border-purple-800/30 backdrop-blur-md h-[100px] flex flex-col justify-center transition-all duration-300">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-wider text-purple-400 uppercase">
                <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                <span>{currentPhase.step}</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1 truncate">
                {currentPhase.title}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                {currentPhase.desc}
              </p>
            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: Dedicated 3D Phone Animation Container (~55%)
             ======================================================== */}
          <div className="w-full md:w-[52%] lg:w-[56%] h-[380px] sm:h-[480px] md:h-[620px] flex items-center justify-center relative overflow-hidden">
            {reducedMotion ? (
              <div className="w-full h-full flex items-center justify-center">
                <StaticPhoneFallback />
              </div>
            ) : (
              <DynamicPhoneScene progressRef={scrollProgressRef} isMobile={isMobile} />
            )}
          </div>

        </div>

        {/* Bottom Minimal Scroll Indicator */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
            <span>Scroll to deconstruct the experience</span>
            <ChevronDown className="w-3 h-3 text-purple-400 animate-bounce" />
          </div>
        </div>

      </div>
    </div>
  );
}
