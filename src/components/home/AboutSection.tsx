'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, BookOpen, Clock, Building2, Sparkles, ArrowUpRight } from 'lucide-react';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

export default function AboutSection() {
  const cards = [
    {
      icon: Clock,
      title: '6 Hours Offline Sprints',
      description:
        'No dry lectures. An immersive day of real case studies, interactive mentor sessions, and hands-on ideation exercises that mirror real founder journeys.',
    },
    {
      icon: BookOpen,
      title: 'Curated by E-Cell IIT Bombay',
      description:
        'Benefit from world-class entrepreneurial frameworks developed by Asia’s premier student entrepreneurship body, tailored for engineering & management students.',
    },
    {
      icon: Target,
      title: 'Minimum 70 Attendees Target',
      description:
        'A cohort-based environment requiring at least 70 motivated peers, creating an active campus network of aspiring builders, creators, and future leaders.',
    },
  ];

  return (
    <section id="about" className="py-28 bg-[#070410] border-t border-purple-950/40 relative overflow-hidden z-10">
      
      {/* Subtle backdrop glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-800/40 text-xs font-bold text-purple-300 uppercase tracking-widest mb-4 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span>The Initiative</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Igniting Startup Culture at <br />
            <span className="text-gradient-purple">KMCT College of Engineering, Kasaragod.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed">
            ILLUMINATE is an offline entrepreneurship workshop organized by college teams as part of <strong>E-Cell, IIT Bombay’s</strong> national movement. Designed to make practical startup education accessible, it delivers 6 hours of high-impact, interactive learning directly to students and future founders in Kasaragod.
          </p>
        </motion.div>

        {/* Feature Grid with 3D Touch Tilt */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((c, idx) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <TouchInteractiveTilt maxTilt={8} glareOpacity={0.2} className="h-full">
                  <div className="glass-card rounded-3xl p-8 border border-purple-900/40 hover:border-purple-500/50 transition-all duration-300 shadow-xl shadow-black/30 h-full flex flex-col justify-between">
                    <div>
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-900/60 to-indigo-900/60 border border-purple-700/40 flex items-center justify-center text-purple-300 mb-6 p-3 shadow-inner">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2.5">
                        {c.title}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {c.description}
                      </p>
                    </div>
                  </div>
                </TouchInteractiveTilt>
              </motion.div>
            );
          })}
        </div>

        {/* Nxt Byte E-Cell Spotlight Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className="mt-14"
        >
          <TouchInteractiveTilt maxTilt={6} glareOpacity={0.2}>
            <div className="rounded-3xl bg-gradient-to-r from-purple-950/70 via-[#0d0722] to-emerald-950/40 border border-emerald-500/40 p-8 sm:p-10 relative overflow-hidden backdrop-blur-2xl shadow-2xl shadow-emerald-950/20">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <img
                      src="/logos/nxtbyte-ecell.png"
                      alt="Nxt Byte Logo"
                      className="h-9 w-auto object-contain bg-black/40 p-1 rounded-lg border border-emerald-500/30"
                    />
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-xs font-bold text-emerald-300 uppercase tracking-wider shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>College E-Cell: Nxt Byte · KMCTCEEM</span>
                    </div>
                    <img
                      src="/logos/nec-iitb.png"
                      alt="NEC IIT Bombay"
                      className="h-7 w-auto object-contain bg-black/40 px-2 py-0.5 rounded-lg border border-white/10 hidden sm:inline"
                    />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Empowering Student Builders to Launch Venture-Scale Startups.
                  </h3>
                  <p className="mt-3.5 text-sm sm:text-base text-slate-300 leading-relaxed">
                    Nxt Byte is the campus launchpad at KMCT College of Engineering, turning student ideas into production products, real users, and venture-scale companies under the National Entrepreneurship Challenge (NEC) track in collaboration with IIT Bombay.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 shrink-0">
                  <a
                    href="https://nxtbyteksd.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-emerald-950/70 text-center flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Join Nxt Byte Cohort</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <a
                    href="https://nxtbyteksd.netlify.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-7 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-white text-xs font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>Explore E-Cell Portal</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.instagram.com/ecellkmctcemksd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-300 hover:text-white transition-colors text-center py-1 flex items-center justify-center gap-1.5"
                  >
                    <span>Follow @ecellkmctcemksd on Instagram</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </TouchInteractiveTilt>
        </motion.div>

      </div>
    </section>
  );
}
