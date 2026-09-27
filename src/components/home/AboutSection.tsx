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

      </div>
    </section>
  );
}
