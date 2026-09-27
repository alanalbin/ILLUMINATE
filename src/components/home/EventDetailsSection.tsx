import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, IndianRupee, Users, Mail, Phone, Info } from 'lucide-react';
import { EventConfig } from '@/types';

interface EventDetailsSectionProps {
  event: EventConfig;
}

export default function EventDetailsSection({ event }: EventDetailsSectionProps) {
  return (
    <section className="py-24 bg-[#05030a] border-t border-purple-950/30 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-purple-400 bg-purple-950/60 border border-purple-800/40 px-3.5 py-1 rounded-full">
            Key Logistics
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Workshop Information
          </h2>
          <p className="mt-3 text-slate-300 text-sm">
            Confirmed parameters and institutional coordination details.
          </p>
        </div>

        {/* 2-Column Specs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Schedule & Venue */}
          <div className="glass-card rounded-2xl p-7 border border-purple-900/30 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span>Date & Schedule</span>
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Event Date</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-base font-bold text-white">
                    {event.date || 'To be announced'}
                  </span>
                  {!event.date && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-medium">
                      TBA
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Finalized in coordination with faculty & E-Cell</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Workshop Duration</p>
                <p className="text-base font-bold text-white mt-1">6 Hours (Offline Workshop)</p>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Venue & Location</p>
                <p className="text-sm font-semibold text-slate-200 mt-1">{event.venue}</p>
                <p className="text-xs text-purple-300/80 mt-0.5">
                  Seminar Hall / Auditorium: {event.roomNumber || 'To be announced'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Pricing & Cohort Size */}
          <div className="glass-card rounded-2xl p-7 border border-purple-900/30 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-purple-400" />
              <span>Investment & Cohort</span>
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Registration Fee</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold text-white">₹{event.registrationFee}</span>
                  <span className="text-xs text-slate-400">per participant</span>
                </div>
                <div className="mt-2 p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/30 text-[11px] text-purple-200">
                  <span className="font-semibold text-purple-300">Official Rate:</span> Registration fee is ₹699/- in accordance with the official E-Cell IIT Bombay NEC discount guidelines.
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Target Cohort</p>
                <p className="text-base font-bold text-white mt-1">
                  {event.minimumTarget || 70} Participants Minimum
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {event.capacity ? `Configured capacity: ${event.capacity} seats` : 'Open cohort (target is not a capacity cap)'}
                </p>
              </div>
            </div>
          </div>

          {/* Card 3: Contacts & Verification */}
          <div className="glass-card rounded-2xl p-7 border border-purple-900/30 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>Event Contact</span>
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Contact Person</p>
                <p className="text-base font-bold text-white mt-1">{event.localCoordinator?.name || 'Alan Albin'}</p>
                <p className="text-xs text-slate-400">Registration Details & Local Coordinator</p>
              </div>

              <div className="pt-2 border-t border-purple-950/60">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mobile</p>
                <div className="mt-1">
                  <a
                    href={`tel:${event.localCoordinator?.phone || '8848563266'}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-purple-400" />
                    <span>{event.localCoordinator?.phone || '8848563266'}</span>
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-950/60 text-xs text-slate-400">
                <p>E-Cell, IIT Bombay Initiative</p>
                <p className="text-[11px] text-purple-400/80 mt-0.5">National Entrepreneurship Challenge (NEC)</p>
              </div>

              <div className="pt-2">
                <Link
                  href="/register"
                  className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-center text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-purple-950 transition-all"
                >
                  Reserve Your Seat
                </Link>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
