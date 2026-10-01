'use client';

import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
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
    <section id="faq" className="py-24 md:py-32 bg-[#07060b] border-b border-white/[0.08] relative">
      <div className="max-w-4xl mx-auto px-6 sm:px-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-xs uppercase font-mono tracking-widest text-violet-400 block mb-3">
            Clarity & FAQs
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            Answers regarding registration eligibility, certificate validity, and event day logistics.
          </p>
        </div>

        {/* Minimal Hairline Accordion (No Boxed Cards) */}
        <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {list.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="py-6">
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full flex items-center justify-between text-left gap-6 group cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-white group-hover:text-violet-300 transition-colors">
                    {item.question}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 text-zinc-400 group-hover:text-white transition-colors">
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="mt-4 pr-12 text-sm text-zinc-400 leading-relaxed">
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
