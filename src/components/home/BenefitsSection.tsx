'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Package, Sparkles, Compass, Trophy, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import { EventBenefit } from '@/types';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

interface BenefitsSectionProps {
  benefits: EventBenefit[];
}

export default function BenefitsSection({ benefits }: BenefitsSectionProps) {
  const iconMap: Record<string, React.ReactNode> = {
    Award: <Award className="w-6 h-6 text-purple-300" />,
    Package: <Package className="w-6 h-6 text-purple-300" />,
    Sparkles: <Sparkles className="w-6 h-6 text-purple-300" />,
    Compass: <Compass className="w-6 h-6 text-purple-300" />,
    Trophy: <Trophy className="w-6 h-6 text-purple-300" />,
  };

  const list = benefits || [];

  return (
    <section id="benefits" className="py-28 bg-[#070312] border-t border-purple-950/40 relative overflow-hidden z-10">
      
      {/* Background radial glow */}
      <div className="absolute top-1/3 right-10 w-[550px] h-[350px] bg-purple-900/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-4 py-1.5 rounded-full shadow-sm">
            Incentives & Credentials
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Value That Far Outweighs The Fee.
          </h2>
          <p className="mt-3.5 text-slate-300 text-base sm:text-lg leading-relaxed">
            Every registered student receives tangible learning assets, verified credentials, and lifetime entryways into the premier IIT Bombay entrepreneurship network.
          </p>
        </motion.div>

        {/* Benefits Bento Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((b, idx) => {
            const isHeroCard = idx === 0;
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={isHeroCard ? 'md:col-span-2 lg:col-span-2' : ''}
              >
                <TouchInteractiveTilt maxTilt={7} glareOpacity={0.25} className="h-full">
                  <div
                    className={`glass-card rounded-3xl p-7 sm:p-8 border border-purple-900/40 hover:border-purple-500/50 flex flex-col justify-between transition-all duration-300 shadow-xl shadow-black/40 hover:shadow-purple-950/50 h-full ${
                      isHeroCard ? 'bg-gradient-to-br from-purple-950/60 via-[#0f0922] to-indigo-950/40' : ''
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-purple-900/70 to-indigo-900/70 border border-purple-600/40 flex items-center justify-center p-3 shadow-inner">
                          {iconMap[b.iconName || 'Award'] || <Award className="w-6 h-6 text-purple-300" />}
                        </div>

                        {b.verified && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Official</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-white group-hover:text-purple-200 transition-colors mb-2.5">
                        {b.title}
                      </h3>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {b.description}
                      </p>
                    </div>

                    {b.condition && (
                      <div className="mt-6 pt-4 border-t border-purple-950/60 flex items-start gap-2 text-xs text-purple-300/80">
                        <AlertCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                        <span>{b.condition}</span>
                      </div>
                    )}
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
