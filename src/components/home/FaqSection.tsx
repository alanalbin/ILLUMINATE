'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
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
    <section id="faq" className="pt-16 pb-10 bg-[#06030e] border-t border-purple-950/40 relative z-10 overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-purple-400 bg-purple-950/70 border border-purple-800/40 px-4 py-1.5 rounded-full shadow-sm">
            Answers & Clarity
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Frequently Asked Questions
          </h2>
          <p className="mt-3.5 text-slate-300 text-base max-w-xl mx-auto">
            Everything you need to know about the ILLUMINATE workshop passes, certificates, and eligibility at KMCT Kasaragod.
          </p>
        </motion.div>

        {/* Accordions with Smooth Spring Physics */}
        <div className="space-y-4">
          {list.map((item, idx) => {
            const isOpen = openId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="glass-card rounded-2xl border border-purple-900/40 hover:border-purple-600/40 overflow-hidden transition-all duration-300 shadow-md shadow-black/20"
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full px-6 sm:px-7 py-5 flex items-center justify-between text-left gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-white flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-950/80 border border-purple-800/40 flex items-center justify-center shrink-0 text-purple-400">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span>{item.question}</span>
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-purple-950/40 border border-purple-800/30 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 bg-purple-900/50 text-purple-300' : 'text-purple-400'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 sm:px-7 pb-6 pt-2 text-sm text-slate-300 leading-relaxed border-t border-purple-950/60 bg-purple-950/20">
                        <p>{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
