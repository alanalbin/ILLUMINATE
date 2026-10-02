'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, Building2, Award, Rocket, Globe } from 'lucide-react';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

interface Partner {
  name: string;
  category: string;
  badge: string;
  badgeColor: string;
  logo: string;
  logoHeight: string;
  description: string;
  website?: string;
  linkText?: string;
}

const PARTNERS: Partner[] = [
  {
    name: 'KMCT College of Engineering',
    category: 'Host Campus & Venue',
    badge: 'Our College',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
    logo: '/logos/kmct-college.png',
    logoHeight: 'h-10 sm:h-12',
    description: 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod — host venue for the offline workshop.',
    website: 'https://nxtbyteksd.netlify.app/',
    linkText: 'KMCT Campus',
  },
  {
    name: 'The E-Cell, IIT Bombay',
    category: 'Flagship Organizers',
    badge: 'IIT Bombay',
    badgeColor: 'bg-purple-950/80 text-purple-300 border-purple-500/40',
    logo: '/logos/ecell-iitb.png',
    logoHeight: 'h-14 sm:h-16',
    description: "Asia's largest student-run entrepreneurship organization, fostering world-class startup ecosystems and masterclasses across India.",
    website: 'https://www.ecell.in/',
    linkText: 'ecell.in',
  },
  {
    name: 'Nxt Byte E-Cell',
    category: 'College E-Cell',
    badge: 'Organized by',
    badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
    logo: '/logos/nxtbyte-ecell.png',
    logoHeight: 'h-14 sm:h-16',
    description: 'The official Entrepreneurship & Innovation Cell of KMCT Kasaragod, empowering campus builders to launch venture-scale solutions.',
    website: 'https://nxtbyteksd.netlify.app/',
    linkText: 'nxtbyteksd.netlify.app',
  },
  {
    name: 'NEC 2026',
    category: 'National Initiative',
    badge: 'National Track',
    badgeColor: 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40',
    logo: '/logos/nec-iitb.png',
    logoHeight: 'h-14 sm:h-16',
    description: 'National Entrepreneurship Challenge by E-Cell IIT Bombay — "We rise by lifting others", establishing E-Cells in colleges nationwide.',
    website: 'https://www.ecell.in/nec/',
    linkText: 'NEC IIT Bombay',
  },
];

export default function PartnersShowcase() {
  return (
    <section className="relative py-20 bg-[#06030e]/30 backdrop-blur-[2px] border-y border-purple-950/40 overflow-hidden z-10">
      
      {/* Subtle backdrop ambient glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-blue-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-800/40 text-xs font-bold text-purple-300 uppercase tracking-widest mb-3.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Institutional Affiliations & Organizers</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Backed by Premier Institutions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            ILLUMINATE is an offline initiative brought to you through the collaboration between <strong>KMCT College of Engineering</strong> and <strong>E-Cell, IIT Bombay</strong>, driven on campus by <strong>Nxt Byte</strong> under the <strong>National Entrepreneurship Challenge (NEC)</strong>.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PARTNERS.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 30, scale: 0.93 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ type: 'spring', stiffness: 220, damping: 22, delay: index * 0.08 }}
              className="h-full"
            >
              <TouchInteractiveTilt maxTilt={8} glareOpacity={0.15} className="h-full">
                <div className="glass-card rounded-2xl p-6 border border-white/[0.08] hover:border-purple-500/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between h-full group shadow-xl shadow-black/30">
                  
                  <div>
                    {/* Badge & Category Header */}
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md border font-bold ${partner.badgeColor}`}>
                        {partner.badge}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {partner.category}
                      </span>
                    </div>

                    {/* Logo Box with Frosted Glow */}
                    <div className="w-full h-24 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-center p-4 mb-5 group-hover:border-purple-500/30 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className={`${partner.logoHeight} max-w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300`}
                        loading="lazy"
                      />
                    </div>

                    {/* Partner Name & Description */}
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      {partner.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                      {partner.description}
                    </p>
                  </div>

                  {/* Website Link if applicable */}
                  {partner.website && (
                    <div className="mt-5 pt-4 border-t border-white/[0.06]">
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 group-hover:underline transition-colors"
                      >
                        <span>{partner.linkText || 'Visit Portal'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                </div>
              </TouchInteractiveTilt>
            </motion.div>
          ))}
        </div>

        {/* Unified Tagline / Banner with Illuminate Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 rounded-2xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-indigo-950/40 border border-purple-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black/60 border border-purple-500/40 flex items-center justify-center p-2 shrink-0">
              <img
                src="/logos/illuminate-torch.png"
                alt="ILLUMINATE Torch"
                className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Empowering the Next Generation of Changemakers
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Official Entrepreneurship Masterclass • KMCT College of Engineering, Kasaragod
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-zinc-400 font-mono hidden md:inline">#IlluminateKasaragod</span>
            <a
              href="https://www.ecell.in/illuminate/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/50 flex items-center gap-1.5"
            >
              <span>Explore IITB Illuminate</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
