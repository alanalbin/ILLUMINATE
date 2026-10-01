import React from 'react';
import { Award, Package, Sparkles, Compass, Trophy, CheckCircle2, AlertCircle } from 'lucide-react';
import { EventBenefit } from '@/types';

interface BenefitsSectionProps {
  benefits: EventBenefit[];
}

export default function BenefitsSection({ benefits }: BenefitsSectionProps) {
  const iconMap: Record<string, React.ReactNode> = {
    Award: <Award className="w-6 h-6 text-purple-400" />,
    Package: <Package className="w-6 h-6 text-purple-400" />,
    Sparkles: <Sparkles className="w-6 h-6 text-purple-400" />,
    Compass: <Compass className="w-6 h-6 text-purple-400" />,
    Trophy: <Trophy className="w-6 h-6 text-purple-400" />,
  };

  const list = benefits || [];

  return (
    <section id="benefits" className="py-24 bg-[#080413] border-t border-purple-950/30 relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3.5 py-1 rounded-full">
            Incentives & Takeaways
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Value That Outweighs The Fee.
          </h2>
          <p className="mt-3 text-slate-300 text-base leading-relaxed">
            Every registered student receives tangible learning assets, official credentials, and exclusive opportunities through the E-Cell IIT Bombay network.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((b) => (
            <div
              key={b.id}
              className="glass-card glass-card-hover rounded-2xl p-7 border border-purple-900/30 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-700/40 flex items-center justify-center mb-5">
                  {iconMap[b.iconName || 'Award'] || <Award className="w-6 h-6 text-purple-400" />}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white">
                    {b.title}
                  </h3>
                  {b.verified && (
                    <span title="Verified Benefit">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {b.description}
                </p>
              </div>

              {b.condition && (
                <div className="pt-4 border-t border-purple-950/50 flex items-start gap-2 text-xs text-purple-300/80">
                  <AlertCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <span>{b.condition}</span>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
