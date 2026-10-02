'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Compass, Zap, Presentation, CheckCircle, ArrowRight } from 'lucide-react';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

export default function WorkshopStructureSection() {
  const modules = [
    {
      step: '01',
      title: 'Ideation & Problem-Market Validation',
      duration: 'Hour 1 - 2',
      tag: 'Foundation & Validation',
      description:
        'Discovering non-obvious problems. How to validate consumer pain points, interview potential users, and avoid building things nobody wants.',
      keyTakeaways: ['Customer discovery framework', 'Problem scoring matrix', 'Lean market sizing'],
      icon: Lightbulb,
    },
    {
      step: '02',
      title: 'Lean Business Model & Unit Economics',
      duration: 'Hour 3 - 4',
      tag: 'Architecture & Scalability',
      description:
        'Mapping out Lean Canvas architecture. Understanding CAC (Customer Acquisition Cost), LTV (Lifetime Value), monetization models, and go-to-market loops.',
      keyTakeaways: ['1-Page Lean Canvas', 'Monetization strategy', 'Pricing psychology'],
      icon: Compass,
    },
    {
      step: '03',
      title: 'Rapid Prototyping & Startup Kit Lab',
      duration: 'Hour 5',
      tag: 'Hands-on Sprint',
      description:
        'Using your physical Illuminate Startup Kit materials to construct an initial MVP concept, value proposition, and distribution hypothesis.',
      keyTakeaways: ['Physical kit ideation cards', 'Low-fidelity MVP design', 'Value hypothesis testing'],
      icon: Zap,
    },
    {
      step: '04',
      title: 'The Pitch, Feedback & IIT Bombay Ecosystem',
      duration: 'Hour 6',
      tag: 'Mentorship & Access',
      description:
        'Presenting venture ideas to mentors. Q&A session with experienced entrepreneurs and pathways to E-Summit, NEC competitions, and incubator access.',
      keyTakeaways: ['3-Minute founder pitch format', 'Mentor critique session', 'Direct NEC & E-Summit entry'],
      icon: Presentation,
    },
  ];

  return (
    <section id="workshop" className="py-28 bg-[#05030a]/30 backdrop-blur-[2px] relative overflow-hidden z-10 border-t border-purple-950/40">
      
      {/* Glow aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400 bg-purple-950/70 border border-purple-800/40 px-4 py-1.5 rounded-full shadow-sm">
            Curriculum Blueprint
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Six Hours That Shift Your Perspective.
          </h2>
          <p className="mt-3.5 text-slate-300 text-base sm:text-lg">
            Engineered by E-Cell IIT Bombay to guide participants step-by-step through the core phases of real-world venture building.
          </p>
        </motion.div>

        {/* Modules Grid with Interactive 3D Touch Tilt */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-7">
          {modules.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.step}
                initial={{ opacity: 0, y: 35, scale: 0.93 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: idx * 0.08 }}
              >
                <TouchInteractiveTilt maxTilt={8} glareOpacity={0.22}>
                  <div className="glass-card rounded-3xl p-7 sm:p-8 border border-purple-900/40 hover:border-purple-500/50 flex flex-col justify-between group transition-all duration-300 shadow-xl shadow-black/40 hover:shadow-purple-950/50 h-full">
                    <div>
                      {/* Step & Duration Header */}
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-black font-mono text-purple-500/40 group-hover:text-purple-300 transition-colors">
                            {m.step}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400/90 bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-800/40">
                            {m.tag}
                          </span>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-900/40 border border-purple-700/40 text-purple-200">
                          {m.duration}
                        </span>
                      </div>

                      {/* Title & Icon */}
                      <div className="flex items-start gap-3.5 mb-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-900/60 to-indigo-900/60 border border-purple-700/50 flex items-center justify-center shrink-0 text-purple-300 shadow-inner group-hover:scale-105 transition-transform">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors pt-1">
                          {m.title}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-slate-300 leading-relaxed mt-2">
                        {m.description}
                      </p>
                    </div>

                    {/* Key Takeaways Checklist */}
                    <div className="mt-6 pt-5 border-t border-purple-950/60">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-purple-400/80 mb-2.5">
                        Key Milestones
                      </p>
                      <ul className="space-y-1.5">
                        {m.keyTakeaways.map((takeaway, tIdx) => (
                          <li key={tIdx} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                </TouchInteractiveTilt>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
