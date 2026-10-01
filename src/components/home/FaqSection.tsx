'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FaqItem } from '@/types';

interface FaqSectionProps {
  faq: FaqItem[];
}

export default function FaqSection({ faq }: FaqSectionProps) {
  const list = faq || [];
  const [openId, setOpenId] = useState<string | null>(list[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="py-24 bg-[#070410] border-t border-purple-950/30">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-purple-400 bg-purple-950/60 border border-purple-800/40 px-3.5 py-1 rounded-full">
            Answers & Clarity
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-slate-300 text-sm">
            Everything you need to know about the ILLUMINATE workshop at KMCT Kasaragod.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {list.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="glass-card rounded-xl border border-purple-900/30 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 hover:bg-white/[0.02] transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-bold text-white flex items-center gap-3">
                    <HelpCircle className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>{item.question}</span>
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-purple-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-purple-300' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-300 leading-relaxed border-t border-purple-950/40 bg-purple-950/10">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
