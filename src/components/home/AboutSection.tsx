import React from 'react';
import { Target, Users, BookOpen, Clock, Building2 } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-[#070410] border-t border-purple-950/30 relative overflow-hidden">
      
      {/* Subtle backdrop glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs font-semibold text-purple-300 uppercase tracking-widest mb-4">
            <Building2 className="w-3.5 h-3.5" />
            <span>The Initiative</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Igniting Startup Culture at <br />
            <span className="text-gradient-purple">KMCT College of Engineering, Kasaragod.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed">
            ILLUMINATE is an offline entrepreneurship workshop organized by college teams as part of <strong>E-Cell, IIT Bombay’s</strong> national movement. Designed to make practical startup education accessible, it delivers 6 hours of high-impact, interactive learning directly to students and future founders in Kasaragod.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="glass-card glass-card-hover rounded-2xl p-8 border border-purple-900/30">
            <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-300 mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">6 Hours Offline Sprints</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              No endless lectures. An immersive day of real case studies, interactive mentor sessions, and hands-on ideation exercises that mirror real founder journeys.
            </p>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-8 border border-purple-900/30">
            <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-300 mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Curated by E-Cell IIT Bombay</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Benefit from world-class entrepreneurial frameworks developed by Asia’s premier student entrepreneurship body, tailored for engineering & management students.
            </p>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-8 border border-purple-900/30">
            <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-300 mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Minimum 70 Attendees Target</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              A cohort-based environment requiring at least 70 motivated peers, creating an active campus network of aspiring builders, creators, and leaders.
            </p>
          </div>
        </div>

        {/* Nxt Byte E-Cell Spotlight Card */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-purple-950/60 via-[#0d0722] to-emerald-950/40 border border-emerald-500/30 p-8 sm:p-10 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Host E-Cell: Nxt Byte · KMCTCEEM</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Empowering Student Builders to Launch Venture-Scale Startups.
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
                Nxt Byte is the campus launchpad at KMCT College of Engineering, turning student ideas into production products, real users, and venture-scale companies under the National Entrepreneurship Challenge (NEC) track in collaboration with IIT Bombay.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <a
                href="https://nxtbyteksd.netlify.app/#cta"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-emerald-950/60 text-center flex items-center justify-center gap-2"
              >
                <span>Join Nxt Byte Cohort</span>
                <span className="text-sm">↗</span>
              </a>
              <a
                href="https://nxtbyteksd.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-white text-xs font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2"
              >
                <span>Explore E-Cell Portal</span>
                <span className="text-sm">↗</span>
              </a>
              <a
                href="https://www.instagram.com/ecellkmctcemksd/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-center text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors pt-1"
              >
                Follow on Instagram @ecellkmctcemksd ↗
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
