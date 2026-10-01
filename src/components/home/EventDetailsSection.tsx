'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, IndianRupee, Users, Mail, Phone, Info, ShieldCheck, ArrowRight } from 'lucide-react';
import { EventConfig } from '@/types';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

interface EventDetailsSectionProps {
  event: EventConfig;
}

export default function EventDetailsSection({ event }: EventDetailsSectionProps) {
  return (
    <section className="py-28 bg-[#05030a] border-t border-purple-950/40 relative z-10 overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 w-[650px] h-[350px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400 bg-purple-950/70 border border-purple-800/40 px-4 py-1.5 rounded-full shadow-sm">
            Key Logistics
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Workshop Information
          </h2>
          <p className="mt-3.5 text-slate-300 text-base">
            Confirmed parameters, venue logistics, and institutional contact details.
          </p>
        </motion.div>

        {/* 3-Column Logistics Grid with 3D Touch Tilt */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          
          {/* Card 1: Schedule & Venue */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <TouchInteractiveTilt maxTilt={7} glareOpacity={0.2} className="h-full">
              <div className="glass-card rounded-3xl p-7 sm:p-8 border border-purple-900/40 hover:border-purple-500/50 space-y-6 shadow-xl shadow-black/40 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-purple-300">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span>Date & Schedule</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Event Date</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-base font-bold text-white">
                          {event.date || 'To be announced (TBA)'}
                        </span>
                        {!event.date && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-800 text-purple-300 font-semibold">
                            TBA
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Finalized in coordination with faculty & E-Cell</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Workshop Duration</p>
                      <p className="text-base font-bold text-white mt-1">6 Hours (Offline Masterclass)</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Venue & Location</p>
                      <p className="text-sm font-semibold text-slate-200 mt-1">{event.venue}</p>
                      <p className="text-xs text-purple-300/90 mt-0.5">
                        Seminar Hall / Auditorium: {event.roomNumber || 'To be announced'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-purple-950/60 text-xs text-slate-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Kasaragod, Kerala</span>
                </div>
              </div>
            </TouchInteractiveTilt>
          </motion.div>

          {/* Card 2: Pricing & Cohort Size */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <TouchInteractiveTilt maxTilt={7} glareOpacity={0.2} className="h-full">
              <div className="glass-card rounded-3xl p-7 sm:p-8 border border-purple-900/40 hover:border-purple-500/50 space-y-6 shadow-xl shadow-black/40 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-purple-300">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <span>Investment & Cohort</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Registration Fee</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-white">₹{event.registrationFee}</span>
                        <span className="text-xs text-slate-400">per participant</span>
                      </div>
                      <div className="mt-2.5 p-3 rounded-xl bg-purple-950/50 border border-purple-800/40 text-[11px] text-purple-200">
                        <span className="font-bold text-purple-300">Official Rate:</span> ₹699/- strictly follows official E-Cell IIT Bombay NEC discount guidelines.
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Target Cohort</p>
                      <p className="text-base font-bold text-white mt-1">
                        {event.minimumTarget || 70} Participants Minimum
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Open cohort (minimum target, not a hard capacity ceiling)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-purple-950/60 text-xs text-slate-400 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>College-wide participation open</span>
                </div>
              </div>
            </TouchInteractiveTilt>
          </motion.div>

          {/* Card 3: Contacts & Verification */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <TouchInteractiveTilt maxTilt={7} glareOpacity={0.2} className="h-full">
              <div className="glass-card rounded-3xl p-7 sm:p-8 border border-purple-900/40 hover:border-purple-500/50 space-y-6 shadow-xl shadow-black/40 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center text-purple-300">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span>Coordinator & Inquiries</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Contact Person</p>
                      <p className="text-base font-bold text-white mt-1">{event.localCoordinator?.name || 'Alan Albin'}</p>
                      <p className="text-xs text-purple-300/80 mt-0.5">Lead Coordinator, KMCT E-Cell</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Direct Mobile</p>
                      <a
                        href={`tel:${event.localCoordinator?.phone || '8848563266'}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-purple-300 hover:text-white transition-colors mt-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-purple-400" />
                        <span>+91 {event.localCoordinator?.phone || '8848563266'}</span>
                      </a>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">Email</p>
                      <a
                        href={`mailto:${event.localCoordinator?.email || 'alan.albin@kmct.edu.in'}`}
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors mt-1 break-all"
                      >
                        <Mail className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{event.localCoordinator?.email || 'alan.albin@kmct.edu.in'}</span>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-purple-950/60">
                  <Link
                    href="/login?redirect=/register"
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-center text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-purple-950/80 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>Secure Your Seat (₹699)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </TouchInteractiveTilt>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
