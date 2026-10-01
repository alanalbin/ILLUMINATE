'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function AboutSection() {
  const pillars = [
    {
      index: '01',
      title: 'High-Density 6-Hour Sprint',
      description:
        'No passive academic lectures. An intensive day of problem discovery, validation sprints, and interactive feedback modeling actual startup venture development.',
    },
    {
      index: '02',
      title: 'Curated by E-Cell, IIT Bombay',
      description:
        'Built directly from the methodologies developed by Asia’s premier student entrepreneurship body, tailored specifically for engineering and management candidates.',
    },
    {
      index: '03',
      title: 'Campus Founder Cohort',
      description:
        'A target minimum cohort of 70 motivated peers, creating an active campus network of future builders, designers, and startup founders in Kasaragod.',
    },
  ];

  return (
    <section id="about" className="py-24 md:py-32 bg-[#07060b] border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Editorial Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Mission Manifesto (5 cols) */}
          <div className="lg:col-span-5">
            <span className="text-xs uppercase font-mono tracking-widest text-violet-400 block mb-3">
              The Mission
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Igniting founder culture on campus.
            </h2>
            <p className="mt-5 text-zinc-400 text-sm sm:text-base leading-relaxed">
              ILLUMINATE is an offline entrepreneurship workshop organized as part of <strong>E-Cell, IIT Bombay’s</strong> national movement. Designed to make practical startup education accessible, it delivers 6 hours of high-impact, interactive learning directly to students at KMCT College of Engineering, Kasaragod.
            </p>

            <div className="mt-8 pt-6 border-t border-white/[0.08] text-xs text-zinc-500 font-mono">
              INITIATIVE · E-CELL IIT BOMBAY (NEC TRACK)
            </div>
          </div>

          {/* Right Column: Open Typographic Tenets (7 cols) */}
          <div className="lg:col-span-7 divide-y divide-white/[0.08]">
            {pillars.map((pillar) => (
              <div key={pillar.index} className="py-7 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
                <span className="font-mono text-sm font-bold text-violet-400/80 shrink-0 mt-0.5">
                  {pillar.index}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Nxt Byte E-Cell Institutional Block */}
        <div className="mt-16 pt-10 border-t border-white/[0.08] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider">
                Host College E-Cell · Nxt Byte KMCTCEEM
              </span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              The Campus Launchpad for Student Builders
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed">
              Nxt Byte is the student-led entrepreneurship cell at KMCT College of Engineering, leading the National Entrepreneurship Challenge (NEC) initiative in collaboration with IIT Bombay.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://nxtbyteksd.netlify.app/#cta"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Join Nxt Byte</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <a
              href="https://www.instagram.com/ecellkmctcemksd/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-white/[0.1] hover:bg-white/[0.04] text-zinc-300 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Instagram</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
