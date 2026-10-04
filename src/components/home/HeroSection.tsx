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
  initialSeats?: {
    total: number;
    paid: number;
    remaining: number;
    percentFilled: number;
  };
}

export default function HeroSection({ event, initialSeats }: HeroSectionProps) {
  const { user } = useAuth();
  const fee = event.registrationFee || 699;
  const coordinatorName = event.localCoordinator?.name || 'Alan Albin';
  const coordinatorPhone = event.localCoordinator?.phone || '8848563266';

  const defaultTotal = event.capacity || event.minimumTarget || 70;
  const defaultPaid = initialSeats?.paid ?? 6;
  const defaultRemaining = initialSeats?.remaining ?? Math.max(0, defaultTotal - defaultPaid);
  const defaultPercent = initialSeats?.percentFilled ?? Math.min(100, Math.round((defaultPaid / defaultTotal) * 100));

  const [seatsData, setSeatsData] = React.useState<{
    total: number;
    paid: number;
    remaining: number;
    percentFilled: number;
  }>({
    total: initialSeats?.total ?? defaultTotal,
    paid: defaultPaid,
    remaining: defaultRemaining,
    percentFilled: defaultPercent,
  });

  const [isLiveActive, setIsLiveActive] = React.useState(true);

  // Synchronize with server initialSeats prop updates
  React.useEffect(() => {
    if (initialSeats) {
      setSeatsData({
        total: initialSeats.total ?? defaultTotal,
        paid: initialSeats.paid ?? 6,
        remaining: initialSeats.remaining ?? Math.max(0, (initialSeats.total ?? defaultTotal) - (initialSeats.paid ?? 6)),
        percentFilled:
          initialSeats.percentFilled ??
          Math.min(100, Math.round(((initialSeats.paid ?? 6) / (initialSeats.total ?? defaultTotal)) * 100)),
      });
    }
  }, [initialSeats?.total, initialSeats?.paid, initialSeats?.remaining, initialSeats?.percentFilled, defaultTotal]);

  React.useEffect(() => {
    let isMounted = true;

    const fetchLiveSeats = async () => {
      try {
        const res = await fetch(`/api/event?t=${Date.now()}`, {
          cache: 'no-store',
          headers: { Pragma: 'no-cache', 'Cache-Control': 'no-cache' },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.seats) {
            setSeatsData(data.seats);
            setIsLiveActive(true);
          }
        }
      } catch (err) {
        // Retain current state on transient network blip
      }
    };

    fetchLiveSeats();

    // Active live polling interval every 10 seconds
    const interval = setInterval(fetchLiveSeats, 10000);

    // Refresh immediately when returning to tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchLiveSeats();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

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
              <a
                href="https://www.ecell.in/illuminate/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-purple-500/40 text-xs font-medium text-zinc-300 hover:text-white transition-all group"
              >
                <img src="/logos/ecell-iitb.png" alt="E-Cell IIT Bombay" className="w-3.5 h-3.5 object-contain" />
                <span>E-Cell, IIT Bombay Initiative</span>
                <span className="text-[10px] text-zinc-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all">↗</span>
              </a>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-zinc-300">
                <img src="/logos/kmct-college.png" alt="KMCT" className="h-3 w-auto object-contain max-w-[90px]" />
                <span className="text-zinc-400">•</span>
                <span>Host Campus (KMCTCEEM)</span>
              </div>

              <a
                href="https://nxtbyteksd.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-emerald-500/40 text-xs font-medium text-zinc-300 hover:text-white transition-all group"
                title="Visit KMCT College E-Cell (Nxt Byte)"
              >
                <img src="/logos/nxtbyte-ecell.png" alt="Nxt Byte" className="w-3.5 h-3.5 object-contain" />
                <span>Organized by Nxt Byte E-Cell</span>
                <span className="text-[10px] text-zinc-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all">↗</span>
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
            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap items-center gap-2 text-xs text-zinc-300">
              <span className="px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>6 Hours Offline</span>
              </span>
              <span className="px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/20 font-semibold text-white flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-zinc-300" />
                <span>₹{fee}/- All-Inclusive Pass</span>
              </span>
              <span className="px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>KMCT Campus, Kasaragod</span>
              </span>
            </motion.div>

            {/* Live Registration Countdown & 70 Seats Live Tracker */}
            <motion.div variants={itemVariants} className="mt-7 p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.1] backdrop-blur-md max-w-lg shadow-xl shadow-purple-950/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <Zap className="w-3 h-3 text-amber-400" />
                    Registration Closes: 20 Oct 2026
                  </span>
                  <p className="text-xs text-zinc-300 font-semibold mt-0.5">Offline Event Date Announced Soon</p>
                </div>
                <EventCountdown targetDate={event.registrationClosingDate || '2026-10-20T23:59:59+05:30'} />
              </div>

              {/* 70 Seats Live Countdown Progress */}
              <div className="pt-3 border-t border-white/[0.08]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                    <Users className="w-3.5 h-3.5 text-purple-400" />
                    <span>Workshop Capacity:</span>
                    <span className="font-bold text-white">{seatsData.total} Seats</span>
                  </span>
                  <span className="font-mono text-xs font-black text-amber-400 bg-amber-950/70 px-2.5 py-0.5 rounded-full border border-amber-500/40 shadow-sm shadow-amber-950/60 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                    <span>🔥 {seatsData.remaining} Seats Left</span>
                  </span>
                </div>

                {/* Animated Capacity Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-zinc-900/90 border border-white/[0.1] overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-400 to-amber-400 transition-all duration-1000 shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                    style={{ width: `${Math.max(6, Math.min(100, seatsData.percentFilled))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono mt-1.5">
                  <span className="text-zinc-200 font-semibold">{seatsData.paid} confirmed participants</span>
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live seat inventory
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Contact Person Details (Alan Albin) */}
            <motion.div variants={itemVariants} className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Contact Person</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{coordinatorName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Direct Phone</p>
                  <a
                    href={`tel:${coordinatorPhone}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300 hover:text-white transition-colors mt-0.5"
                  >
                    <Phone className="w-3 h-3 text-zinc-400" />
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

                {/* Background Watermark of Logo */}
                <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 pointer-events-none opacity-[0.06] w-64 h-64 overflow-hidden" aria-hidden="true">
                  <img src="/logo-icon.png" alt="" className="w-full h-full object-contain" />
                </div>

                {/* Card Header & Live Badge */}
                <div className="flex items-center justify-between pb-5 border-b border-purple-950/60 mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <img
                      src="/logo-icon.png"
                      alt="ILLUMINATE"
                      className="h-9 w-auto object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                    />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 block">
                        Offline Masterclass
                      </span>
                      <h3 className="text-xl font-black text-white mt-0.5">
                        Official Workshop Pass
                      </h3>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>IIT Bombay Certified</span>
                  </div>
                </div>

                {/* 4 Core Pillars */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-zinc-200">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">E-Cell IIT Bombay Certification</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Official verified certificate issued directly by E-Cell IIT Bombay.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-zinc-200">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Physical Illuminate Startup Kit</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Comprehensive workbooks, ideation frameworks & founder resources.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-zinc-200">
                      <img src="/logo-icon.png" alt="" className="w-4 h-4 object-contain" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">6-Hour Hands-on Venture Lab</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Problem validation, lean business modeling, prototyping & pitch sprint.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-white/20 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-zinc-200">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">E-Summit & NEC Privileges</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
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
