'use client';

import React from 'react';

export default function WorkshopStructureSection() {
  const syllabus = [
    {
      step: '01',
      timeframe: 'Hour 1 – 2',
      phase: 'Validation Phase',
      title: 'Problem Discovery & Market Validation',
      description:
        'Discovering non-obvious problems. How to validate consumer pain points, interview potential users with unbiased questions, and avoid building solutions nobody wants.',
      deliverables: ['Customer discovery framework', 'Problem scoring matrix', 'Market sizing methodology'],
    },
    {
      step: '02',
      timeframe: 'Hour 3 – 4',
      phase: 'Architecture Phase',
      title: 'Lean Business Models & Unit Economics',
      description:
        'Constructing a 1-page Lean Canvas. Understanding Customer Acquisition Cost (CAC), Lifetime Value (LTV), monetization loops, and high-margin go-to-market strategies.',
      deliverables: ['1-Page Lean Canvas', 'Monetization modeling', 'Distribution channels breakdown'],
    },
    {
      step: '03',
      timeframe: 'Hour 5',
      phase: 'Lab Sprint',
      title: 'Rapid Prototyping & Startup Kit Lab',
      description:
        'Utilizing physical Illuminate Startup Kit materials to construct an initial MVP concept, clear value propositions, and a rapid distribution hypothesis.',
      deliverables: ['Physical kit ideation cards', 'Low-fidelity MVP design', 'Value hypothesis checklist'],
    },
    {
      step: '04',
      timeframe: 'Hour 6',
      phase: 'Pitch & Ecosystem',
      title: 'Mentor Pitch, Critique & IIT Bombay Gateway',
      description:
        'Pitching venture ideas to mentors. Structured Q&A, actionable critique, and explicit entryways to E-Summit, NEC competitions, and venture incubators.',
      deliverables: ['3-Minute founder pitch structure', 'Mentor feedback notes', 'Direct NEC & E-Summit entryways'],
    },
  ];

  return (
    <section id="workshop" className="py-24 md:py-32 bg-[#07060b] border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-white/[0.08]">
          <div className="max-w-2xl">
            <span className="text-xs uppercase font-mono tracking-widest text-violet-400 block mb-3">
              Curriculum & Syllabus
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Six Hours. Four Critical Milestones.
            </h2>
          </div>
          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
            Every hour builds sequentially on the previous, transitioning from abstract ideation into a validated, pitched prototype.
          </p>
        </div>

        {/* Structured Agenda Table / Editorial Schedule */}
        <div className="divide-y divide-white/[0.08]">
          {syllabus.map((item) => (
            <div
              key={item.step}
              className="py-10 first:pt-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start hover:bg-white/[0.01] transition-colors"
            >
              {/* Step & Timeframe (3 cols) */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-violet-400">
                    {item.step}
                  </span>
                  <span className="text-xs font-mono text-zinc-400 bg-white/[0.04] px-2.5 py-1 rounded border border-white/[0.06]">
                    {item.timeframe}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block mt-2">
                  {item.phase}
                </span>
              </div>

              {/* Title & Narrative (6 cols) */}
              <div className="lg:col-span-6">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Tangible Deliverables (3 cols) */}
              <div className="lg:col-span-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-2">
                  Key Outputs
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-300">
                  {item.deliverables.map((d, dIdx) => (
                    <li key={dIdx} className="flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-violet-400" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
