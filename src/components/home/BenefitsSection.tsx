'use client';

import React from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { EventBenefit } from '@/types';

interface BenefitsSectionProps {
  benefits: EventBenefit[];
}

export default function BenefitsSection({ benefits }: BenefitsSectionProps) {
  const list = benefits || [];
  const primaryCredential = list.find((b) => b.iconName === 'Award') || list[0];
  const secondaryTakeaways = list.filter((b) => b.id !== primaryCredential?.id);

  return (
    <section id="benefits" className="py-24 md:py-32 bg-[#07060b] border-b border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 block mb-3">
            Incentives & Credentials
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Value That Outweighs The Fee.
          </h2>
          <p className="mt-4 text-zinc-400 text-sm sm:text-base leading-relaxed">
            Every registered student receives verifiable credentials, tangible physical frameworks, and exclusive access to the E-Cell IIT Bombay founder ecosystem.
          </p>
        </div>

        {/* Asymmetric Split Layout: Primary Credential + Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Primary Spotlight: IIT Bombay Credential (5 cols) */}
          <div className="lg:col-span-5 border border-white/[0.12] bg-[#0c0b13] rounded-2xl p-7 sm:p-9 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-[10px] font-mono uppercase font-bold text-violet-400 tracking-wider">
                  Primary Credential
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 font-mono">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Official & Verifiable
                </span>
              </div>

              <h3 className="text-2xl font-bold text-white tracking-tight leading-snug">
                {primaryCredential?.title || 'E-Cell IIT Bombay Certification'}
              </h3>

              <p className="mt-4 text-sm text-zinc-300 leading-relaxed">
                {primaryCredential?.description ||
                  'Official certificate issued directly by E-Cell, IIT Bombay upon completing the 6-hour offline masterclass. An authenticated credential to strengthen your engineering and management portfolio.'}
              </p>

              {primaryCredential?.condition && (
                <div className="mt-6 pt-4 border-t border-white/[0.08] text-xs text-zinc-400 font-mono">
                  Note: {primaryCredential.condition}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between text-xs text-zinc-500 font-mono">
              <span>ISSUING AUTHORITY</span>
              <span className="text-zinc-300 font-bold">E-CELL, IIT BOMBAY</span>
            </div>
          </div>

          {/* Secondary Takeaways: Structured List (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between divide-y divide-white/[0.08] border-t lg:border-t-0 lg:border-l border-white/[0.08] lg:pl-10">
            {secondaryTakeaways.map((item) => (
              <div key={item.id} className="py-6 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="text-lg font-bold text-white tracking-tight">
                    {item.title}
                  </h4>
                  {item.verified && (
                    <span className="text-[11px] font-mono text-emerald-400 shrink-0">
                      Verified ✓
                    </span>
                  )}
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed">
                  {item.description}
                </p>

                {item.condition && (
                  <p className="mt-2 text-xs text-zinc-500 font-mono">
                    Criteria: {item.condition}
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
