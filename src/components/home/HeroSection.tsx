'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { EventConfig } from '@/types';
import { useAuth } from '@/context/AuthContext';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';
import EventCountdown from '@/components/home/EventCountdown';

interface HeroSectionProps {
  event: EventConfig;
}

export default function HeroSection({ event }: HeroSectionProps) {
  const { user } = useAuth();
  const fee = event.registrationFee || 699;
  const coordinatorName = event.localCoordinator?.name || 'Alan Albin';
  const coordinatorPhone = event.localCoordinator?.phone || '8848563266';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 24,
        stiffness: 120,
      },
    },
  };

  return (
    <section className="relative w-full pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden z-10">
      
      {/* Background radial atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-purple-900/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center"
        >
          
          {/* ========================================================
              LEFT COLUMN: Primary Content & Interactive Controls (7 cols)
             ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Event Association Badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2.5 mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/30 text-xs font-semibold text-purple-300 shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>E-Cell, IIT Bombay Initiative</span>
              </div>

              <a
                href="https://nxtbyteksd.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-xs font-bold text-emerald-300 hover:text-emerald-200 hover:border-emerald-400 transition-all shadow-sm backdrop-blur-md group"
                title="Visit KMCT College E-Cell (Nxt Byte)"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Organized by Nxt Byte (KMCT E-Cell)</span>
                <span className="text-[10px] group-hover:translate-x-0.5 transition-transform">↗</span>
              </a>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.04]"
            >
              ILLUMINATE <br />
              <span className="text-gradient-purple">KASARAGOD.</span>
            </motion.h1>

            {/* Concise Mission Narrative */}
            <motion.p
              variants={itemVariants}
              className="mt-5 text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed"
            >
              An intensive 6-hour offline entrepreneurship masterclass at KMCT College. Experience real-world startup creation, lean validation, and mentor-led ideation sprints.
            </motion.p>

            {/* Key Logistics Micro-Tags */}
            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap items-center gap-2.5 text-xs text-slate-200">
              <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-purple-500/20 flex items-center gap-1.5 backdrop-blur-md hover:border-purple-400/50 transition-colors">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>6 Hours Offline</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/40 font-bold text-white flex items-center gap-1.5 backdrop-blur-md shadow-sm">
                <IndianRupee className="w-3.5 h-3.5 text-purple-400" />
                <span>₹{fee}/- All-Inclusive Pass</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-purple-500/20 flex items-center gap-1.5 backdrop-blur-md hover:border-purple-400/50 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>KMCT Campus, Kasaragod</span>
              </span>
            </motion.div>

            {/* Live Registration Countdown */}
            <motion.div variants={itemVariants} className="mt-7 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-indigo-950/30 to-purple-950/40 border border-purple-800/40 backdrop-blur-xl max-w-lg shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400" />
                    Seats Filling Fast
                  </span>
                  <p className="text-xs text-slate-300 font-medium mt-0.5">Registration Closes Soon</p>
                </div>
                <EventCountdown />
              </div>
            </motion.div>

            {/* Contact Person Details */}
            <motion.div variants={itemVariants} className="mt-5 p-4 rounded-xl bg-purple-950/30 border border-purple-800/30 backdrop-blur-md max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Contact Person</p>
                  <p className="text-sm font-bold text-white mt-0.5">{coordinatorName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400">Direct Phone</p>
                  <a
                    href={`tel:${coordinatorPhone}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-300 hover:text-purple-200 transition-colors mt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                    <span>+91 {coordinatorPhone}</span>
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={user ? "/register" : "/login?redirect=/register"}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-purple-950/80 hover:shadow-purple-700/50 flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Register with Google (₹{fee})</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#workshop"
                className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-purple-500/20 text-sm font-medium transition-all backdrop-blur-md active:scale-[0.98]"
              >
                Curriculum & Schedule
              </a>
            </motion.div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: Interactive 3D Touch-Tilt Card (5 cols)
             ======================================================== */}
          <motion.div variants={itemVariants} className="lg:col-span-5 w-full">
            <TouchInteractiveTilt maxTilt={10} glareOpacity={0.28}>
              <div className="glass-card rounded-3xl p-7 sm:p-8 border border-purple-500/40 shadow-2xl shadow-purple-950/80 relative backdrop-blur-2xl overflow-hidden group">
                
                {/* Glowing Corner Ambient */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-purple-600/20 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/30 transition-all duration-500" />

                {/* Card Header & Live Badge */}
                <div className="flex items-center justify-between pb-5 border-b border-purple-950/60 mb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                      Offline Masterclass
                    </span>
                    <h3 className="text-xl font-black text-white mt-1">
                      Official Workshop Pass
                    </h3>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>IIT Bombay Certified</span>
                  </div>
                </div>

                {/* 4 Core Pillars */}
                <div className="space-y-3.5">
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-900/30 hover:border-purple-600/40 hover:bg-purple-900/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center shrink-0 text-purple-300 shadow-md">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">E-Cell IIT Bombay Certification</h4>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        Official verified certificate issued directly by E-Cell IIT Bombay.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-900/30 hover:border-purple-600/40 hover:bg-purple-900/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center shrink-0 text-purple-300 shadow-md">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Physical Illuminate Startup Kit</h4>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        Comprehensive workbooks, ideation frameworks & founder resources.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-900/30 hover:border-purple-600/40 hover:bg-purple-900/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center shrink-0 text-purple-300 shadow-md">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">6-Hour Hands-on Venture Lab</h4>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        Problem validation, lean business modeling, prototyping & pitch sprint.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-purple-950/30 border border-purple-900/30 hover:border-purple-600/40 hover:bg-purple-900/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-700/50 flex items-center justify-center shrink-0 text-purple-300 shadow-md">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">E-Summit & NEC Privileges</h4>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                        Exclusive access & discounts to Asia&apos;s largest entrepreneurship festival at IIT Bombay.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Pass Bar */}
                <div className="mt-6 pt-5 border-t border-purple-950/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-slate-300">Cohort Target:</span>
                    <span className="text-xs font-bold text-white">Min. {event.minimumTarget || 70} Attendees</span>
                  </div>
                  <span className="text-xs font-extrabold text-purple-300 bg-purple-900/50 px-2.5 py-1 rounded-lg border border-purple-600/30">
                    ₹{fee}/- Pass
                  </span>
                </div>

              </div>
            </TouchInteractiveTilt>
          </motion.div>

        </motion.div>
      </div>

    </section>
  );
}
