import React from 'react';
import { Lightbulb, Compass, Zap, Presentation } from 'lucide-react';

export default function WorkshopStructureSection() {
  const modules = [
    {
      step: '01',
      title: 'Ideation & Problem-Market Validation',
      duration: 'Hour 1 - 2',
      description:
        'Discovering non-obvious problems. How to validate consumer pain points, interview potential users, and avoid building things nobody wants.',
      icon: Lightbulb,
    },
    {
      step: '02',
      title: 'Lean Business Model & Unit Economics',
      duration: 'Hour 3 - 4',
      description:
        'Mapping out Lean Canvas architecture. Understanding CAC (Customer Acquisition Cost), LTV (Lifetime Value), monetization models, and go-to-market loops.',
      icon: Compass,
    },
    {
      step: '03',
      title: 'Rapid Prototyping & Startup Kit Lab',
      duration: 'Hour 5',
      description:
        'Using your physical Illuminate Startup Kit materials to construct an initial MVP concept, value proposition, and distribution hypothesis.',
      icon: Zap,
    },
    {
      step: '04',
      title: 'The Pitch, Feedback & IIT Bombay Ecosystem',
      duration: 'Hour 6',
      description:
        'Presenting venture ideas to mentors. Q&A session with experienced entrepreneurs and pathways to E-Summit, NEC competitions, and incubator access.',
      icon: Presentation,
    },
  ];

  return (
    <section id="workshop" className="py-24 bg-[#05030a] relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-purple-400 bg-purple-950/60 border border-purple-800/40 px-3.5 py-1 rounded-full">
            Workshop Curriculum
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Six Hours That Shift Your Perspective.
          </h2>
          <p className="mt-3 text-slate-300 text-base">
            Engineered to guide participants step-by-step through the core phases of early-stage venture building.
          </p>
        </div>

        {/* Modules List */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.step}
                className="glass-card rounded-2xl p-7 border border-purple-900/30 flex flex-col justify-between group hover:border-purple-500/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-purple-500/40 group-hover:text-purple-400 transition-colors">
                      {m.step}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-950/70 border border-purple-800/40 text-purple-300">
                      {m.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-900/30 border border-purple-700/30 flex items-center justify-center text-purple-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors">
                      {m.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
