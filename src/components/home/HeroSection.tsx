'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Phone, Check, ShieldCheck } from 'lucide-react';
import { EventConfig } from '@/types';
import { useAuth } from '@/context/AuthContext';
import EventCountdown from '@/components/home/EventCountdown';

interface HeroSectionProps {
  event: EventConfig;
}

export default function HeroSection({ event }: HeroSectionProps) {
  const { user } = useAuth();
  const fee = event.registrationFee || 699;
  const coordinatorName = event.localCoordinator?.name || 'Alan Albin';
  const coordinatorPhone = event.localCoordinator?.phone || '8848563266';

  return (
    <section className="relative w-full pt-32 pb-20 md:pt-36 md:pb-28 overflow-hidden z-10 border-b border-white/[0.08]">
      
      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Top Institutional Eyebrow */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-400 mb-6 font-mono">
          <span className="text-zinc-200 font-medium">KMCT College of Engineering, Kasaragod</span>
          <span className="text-zinc-600">/</span>
          <span className="text-violet-400 font-medium">E-Cell IIT Bombay Initiative</span>
          <span className="text-zinc-600">/</span>
          <a
            href="https://nxtbyteksd.netlify.app/#cta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 transition-colors"
          >
            <span>Organized by Nxt Byte</span>
            <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-start">
          
          {/* ========================================================
              LEFT COLUMN: Editorial Typography & Registration Flow (7 cols)
             ======================================================== */}
          <div className="lg:col-span-7 flex flex-col">
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
              ILLUMINATE <br />
              <span className="text-zinc-400 font-light tracking-tight text-3xl sm:text-5xl lg:text-6xl block mt-1">
                Kasaragod Edition.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-zinc-300 max-w-xl font-normal leading-relaxed">
              An intensive 6-hour offline entrepreneurship masterclass at KMCT College. Experience startup building through hands-on case studies, venture prototyping, and mentor-led ideation sprints.
            </p>

            {/* Structured Specifications Table Row */}
            <div className="mt-8 border border-white/[0.08] bg-[#0d0c14] rounded-xl p-4 sm:p-5 max-w-xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.08]">
                <div className="pt-2 sm:pt-0 sm:pr-3">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Duration</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">6 Hours Offline</span>
                </div>
                <div className="pt-2 sm:pt-0 sm:px-3">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Pass Fee</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">₹{fee} <span className="text-[11px] text-zinc-400 font-normal">all-incl.</span></span>
                </div>
                <div className="pt-2 sm:pt-0 sm:px-3">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Cohort Size</span>
                  <span className="text-sm font-semibold text-white mt-0.5 block">{event.minimumTarget || 70}+ Target</span>
                </div>
                <div className="pt-2 sm:pt-0 sm:pl-3">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">Coordinator</span>
                  <a href={`tel:${coordinatorPhone}`} className="text-xs font-semibold text-violet-300 hover:text-white mt-0.5 block truncate">
                    {coordinatorName}
                  </a>
                </div>
              </div>
            </div>

            {/* CTAs and Live Countdown */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-5 max-w-xl">
              <Link
                href={user ? "/register" : "/login?redirect=/register"}
                className="px-6 py-3.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span>Register with Google (₹{fee})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#workshop"
                className="px-5 py-3.5 rounded-lg border border-white/[0.12] hover:bg-white/[0.04] text-zinc-200 font-medium text-sm transition-all text-center active:scale-[0.98]"
              >
                View Syllabus
              </a>
            </div>

            {/* Registration Countdown Indicator */}
            <div className="mt-6 flex items-center gap-3 text-xs text-zinc-400 max-w-xl">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span>Seats closing soon:</span>
              <EventCountdown />
            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: Authentic Conference Pass Credential (5 cols)
             ======================================================== */}
          <div className="lg:col-span-5 w-full">
            <div className="border border-white/[0.12] bg-[#0c0b13] rounded-2xl p-6 sm:p-7 relative shadow-xl">
              
              {/* Lanyard Clip Hole Representation */}
              <div className="w-10 h-1.5 rounded-full bg-zinc-800 mx-auto mb-6" />

              {/* Pass Header */}
              <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-violet-400 block">
                    Official Workshop Credential
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">
                    ILLUMINATE 2026
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    KMCT College of Engineering, Kasaragod
                  </p>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Pass Value</span>
                  <span className="text-base font-bold text-white font-mono">₹{fee} INR</span>
                </div>
              </div>

              {/* Verified Program Inclusions (Clean Checklist) */}
              <div className="py-5 space-y-3.5 border-b border-white/[0.08]">
                <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider block">
                  Delegate Entitlements
                </span>

                <div className="space-y-2.5 text-xs text-zinc-300">
                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Official E-Cell IIT Bombay Certificate of Completion</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Physical Illuminate Startup Toolkit & Framework Guides</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>6-Hour Hands-on Venture Lab & Mentor Pitch Sprint</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>National Entrepreneurship Challenge (NEC) Access Pathway</span>
                  </div>
                </div>
              </div>

              {/* Delegate Status & Unique ID Preview */}
              <div className="pt-4 flex items-center justify-between text-xs text-zinc-400 font-mono">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Ticket Format</span>
                  <span className="text-zinc-300 font-bold">ILM-KMCT-2026-XXXX</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block uppercase">Verification</span>
                  <span className="text-emerald-400 font-semibold inline-flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Instant Google ID
                  </span>
                </div>
              </div>

              {/* Barcode graphic strip at bottom */}
              <div className="mt-5 pt-4 border-t border-dashed border-white/[0.1] flex items-center justify-between">
                <div className="font-mono text-[10px] text-zinc-500 tracking-widest">
                  ||||| |||| || |||||| ||||| ||| ||||||| ||||
                </div>
                <span className="text-[10px] font-mono text-zinc-500">AUTH·NEC·KMCT</span>
              </div>

            </div>
          </div>

        </div>

      </div>

    </section>
  );
}
