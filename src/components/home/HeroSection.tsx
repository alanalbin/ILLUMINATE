'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
  IndianRupee,
  Phone,
  Award,
  Package,
  Compass,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { EventConfig } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface HeroSectionProps {
  event: EventConfig;
}

export default function HeroSection({ event }: HeroSectionProps) {
  const { user } = useAuth();
  const fee = event.registrationFee || 699;
  const coordinatorName = event.localCoordinator?.name || 'Alan Albin';
  const coordinatorPhone = event.localCoordinator?.phone || '8848563266';

  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden z-10">
      
      {/* Soft atmospheric gradient behind content */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-purple-900/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* ========================================================
              LEFT COLUMN: Primary Typography & Action Controls (7 cols)
             ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Event Association Badge */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/30 text-xs font-semibold text-purple-300 shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>E-Cell, IIT Bombay Initiative</span>
              </div>
              <a
                href="https://nxtbyteksd.netlify.app/#cta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-xs font-bold text-emerald-300 hover:text-emerald-200 hover:border-emerald-400 transition-all shadow-sm backdrop-blur-md group"
                title="Visit KMCT College E-Cell (Nxt Byte)"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Organized by Nxt Byte (KMCT E-Cell)</span>
                <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">↗</span>
              </a>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
              ILLUMINATE <br />
              <span className="text-gradient-purple">KASARAGOD.</span>
            </h1>

            {/* Concise Mission Narrative */}
            <p className="mt-5 text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              An intensive 6-hour offline entrepreneurship masterclass at KMCT College. Experience startup building through hands-on case studies and mentor-led ideation sprints.
            </p>

            {/* Key Logistics Micro-Tags */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5 text-xs text-slate-200">
              <span className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-purple-500/20 flex items-center gap-1.5 backdrop-blur-md">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>6 Hours Offline</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-lg bg-purple-950/60 border border-purple-500/30 font-bold text-white flex items-center gap-1.5 backdrop-blur-md">
                <IndianRupee className="w-3.5 h-3.5 text-purple-400" />
                <span>₹{fee}/- Workshop Pass</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-purple-500/20 flex items-center gap-1.5 backdrop-blur-md">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>KMCT Campus, Kasaragod</span>
              </span>
            </div>

            {/* Official Contact Details Presentation (Explicitly Formatted) */}
            <div className="mt-6 p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 backdrop-blur-md max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Contact Person</p>
                  <p className="text-sm font-bold text-white mt-0.5">{coordinatorName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Mobile</p>
                  <a
                    href={`tel:${coordinatorPhone}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-300 hover:text-purple-200 transition-colors mt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                    <span>{coordinatorPhone}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={user ? "/register" : "/login?redirect=/register"}
                className="px-7 py-4 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm sm:text-base transition-all shadow-xl shadow-purple-950/70 flex items-center gap-2 group hover:scale-[1.02]"
              >
                <span>Register Now (₹{fee})</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#about"
                className="px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-purple-500/20 text-sm font-medium transition-all backdrop-blur-md"
              >
                Explore Workshop
              </a>
            </div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: Glass Feature Showcase & Cohort Status (5 cols)
             ======================================================== */}
          <div className="lg:col-span-5 w-full">
            <div className="glass-card rounded-3xl p-7 sm:p-8 border border-purple-500/30 shadow-2xl relative backdrop-blur-xl">
              
              {/* Card Header & Live Cohort Badge */}
              <div className="flex items-center justify-between pb-5 border-b border-purple-950/60 mb-6">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
                    Workshop Highlights
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    What You Experience
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Verified Program</span>
                </div>
              </div>

              {/* 4 Core Pillars */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-purple-950/30 border border-purple-900/30 hover:border-purple-700/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-purple-900/50 border border-purple-700/40 flex items-center justify-center shrink-0 text-purple-300">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">E-Cell IIT Bombay Certification</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Official credential issued by E-Cell IIT Bombay upon full 6-hour attendance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-purple-950/30 border border-purple-900/30 hover:border-purple-700/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-purple-900/50 border border-purple-700/40 flex items-center justify-center shrink-0 text-purple-300">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Physical Illuminate Startup Kit</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Comprehensive workbooks, ideation frameworks, and practical startup resources.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-purple-950/30 border border-purple-900/30 hover:border-purple-700/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-purple-900/50 border border-purple-700/40 flex items-center justify-center shrink-0 text-purple-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">6-Hour Hands-on Venture Lab</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Problem validation, lean business modeling, prototyping & mentor feedback.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-purple-950/30 border border-purple-900/30 hover:border-purple-700/50 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-purple-900/50 border border-purple-700/40 flex items-center justify-center shrink-0 text-purple-300">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">E-Summit & NEC Privileges</h4>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      Discounted access to Asia&apos;s largest entrepreneurship festival at IIT Bombay.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom Cohort Target Banner */}
              <div className="mt-6 pt-5 border-t border-purple-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-300">Target Cohort:</span>
                  <span className="text-xs font-bold text-white">Min. {event.minimumTarget || 70} Students</span>
                </div>
                <span className="text-xs font-bold text-purple-300">Fee: ₹{fee}/-</span>
              </div>

            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
