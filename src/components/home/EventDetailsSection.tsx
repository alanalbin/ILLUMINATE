'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import { EventConfig } from '@/types';

interface EventDetailsSectionProps {
  event: EventConfig;
}

export default function EventDetailsSection({ event }: EventDetailsSectionProps) {
  const coordinatorName = event.localCoordinator?.name || 'Alan Albin';
  const coordinatorPhone = event.localCoordinator?.phone || '8848563266';
  const coordinatorEmail = event.localCoordinator?.email || 'alan.albin@kmct.edu.in';

  return (
    <section id="logistics" className="py-24 md:py-32 bg-[#07060b] border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/[0.08]">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-violet-400 block mb-3">
              Event Logistics
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Workshop Specifications
            </h2>
          </div>
          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
            Institutional coordination parameters, venue logistics, and verified pricing policies.
          </p>
        </div>

        {/* 3-Column Structured Specification Rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pt-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
          
          {/* Column 1: Schedule & Venue */}
          <div className="pt-6 md:pt-0 md:pr-8 space-y-6">
            <span className="text-xs font-mono uppercase font-bold text-zinc-400 tracking-wider block">
              01 / Date & Location
            </span>

            <div>
              <span className="text-[11px] text-zinc-500 uppercase font-mono block">Scheduled Date</span>
              <p className="text-base font-bold text-white mt-1">
                {event.date || 'To be announced (TBA)'}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Coordinated directly with college calendar and faculty
              </p>
            </div>

            <div>
              <span className="text-[11px] text-zinc-500 uppercase font-mono block">Format & Hours</span>
              <p className="text-base font-bold text-white mt-1">
                6 Hours (Full-day offline masterclass)
              </p>
            </div>

            <div>
              <span className="text-[11px] text-zinc-500 uppercase font-mono block">Venue & Campus</span>
              <p className="text-sm font-semibold text-zinc-200 mt-1">
                {event.venue}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5 font-mono">
                Hall / Auditorium: {event.roomNumber || 'TBA'}
              </p>
            </div>
          </div>

          {/* Column 2: Fee & Capacity */}
          <div className="pt-6 md:pt-0 md:px-8 space-y-6">
            <span className="text-xs font-mono uppercase font-bold text-zinc-400 tracking-wider block">
              02 / Investment & Pricing
            </span>

            <div>
              <span className="text-[11px] text-zinc-500 uppercase font-mono block">All-Inclusive Pass Fee</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-white">₹{event.registrationFee}</span>
                <span className="text-xs text-zinc-400 font-mono">INR</span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Standard NEC student discounted rate. Covers workshop access, official certificate, and physical startup kit.
              </p>
            </div>

            <div>
              <span className="text-[11px] text-zinc-500 uppercase font-mono block">Cohort Objective</span>
              <p className="text-base font-bold text-white mt-1">
                Minimum {event.minimumTarget || 70} Students Target
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Open to all semesters across engineering and management departments
              </p>
            </div>
          </div>

          {/* Column 3: Contacts & Action */}
          <div className="pt-6 md:pt-0 md:pl-8 space-y-6">
            <span className="text-xs font-mono uppercase font-bold text-zinc-400 tracking-wider block">
              03 / Contacts & Passes
            </span>

            <div>
              <span className="text-[11px] text-zinc-500 uppercase font-mono block">Lead Coordinator</span>
              <p className="text-base font-bold text-white mt-1">{coordinatorName}</p>
              <p className="text-xs text-zinc-400 mt-0.5">KMCT E-Cell Leadership</p>
            </div>

            <div>
              <span className="text-[11px] text-zinc-500 uppercase font-mono block">Direct Contact</span>
              <a
                href={`tel:${coordinatorPhone}`}
                className="text-sm font-semibold text-violet-300 hover:text-white block mt-1 transition-colors"
              >
                +91 {coordinatorPhone}
              </a>
              <a
                href={`mailto:${coordinatorEmail}`}
                className="text-xs text-zinc-400 hover:text-white block mt-0.5 truncate transition-colors"
              >
                {coordinatorEmail}
              </a>
            </div>

            <div className="pt-2">
              <Link
                href="/login?redirect=/register"
                className="w-full py-3 px-4 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-xs uppercase tracking-wider text-center block transition-all shadow-sm active:scale-[0.98]"
              >
                Register Pass (₹{event.registrationFee})
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
