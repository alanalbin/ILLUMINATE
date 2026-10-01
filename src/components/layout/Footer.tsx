import React from 'react';
import Link from 'next/link';
import { Phone, ExternalLink, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/[0.08] bg-[#07060b] text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/[0.06]">
          
          {/* Brand & Purpose (4 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-white">
                IL
              </div>
              <div>
                <span className="font-semibold text-sm tracking-tight text-white block">
                  ILLUMINATE KMCT
                </span>
                <span className="font-mono text-[10px] uppercase text-zinc-400">
                  E-Cell, IIT Bombay Initiative
                </span>
              </div>
            </div>
            <p className="text-zinc-400 leading-relaxed text-xs max-w-sm">
              An intensive 6-hour offline masterclass on venture building, ideation, and investor pitching held on campus at KMCT College of Engineering, Kasaragod.
            </p>
            <div className="pt-2">
              <a
                href="https://nxtbyteksd.netlify.app/#cta"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Organized with KMCT E-Cell (Nxt Byte)</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
              </a>
            </div>
          </div>

          {/* Institutional Host (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-300">
              Host Institution
            </h4>
            <p className="text-zinc-200 font-medium leading-snug">
              KMCT College of Engineering for Emerging Technologies and Management
            </p>
            <p className="text-zinc-400 text-xs">
              Kasaragod, Kerala, India
            </p>
            <div className="pt-1">
              <span className="inline-block text-[11px] font-mono text-violet-400/90 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded">
                NEC Track • 2026 Cohort
              </span>
            </div>
          </div>

          {/* Direct Coordinator Contact (2 cols) */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-300">
              Coordinator
            </h4>
            <div>
              <p className="text-white font-medium text-xs">Alan Albin</p>
              <p className="text-zinc-400 text-[11px] mt-0.5">Registration & Campus Desk</p>
            </div>
            <div className="pt-1">
              <a
                href="tel:8848563266"
                className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white font-mono text-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>8848563266</span>
              </a>
            </div>
          </div>

          {/* Verification & Resources (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-zinc-300">
              Resources & Verification
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.ecell.in/illuminate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>IIT Bombay Illuminate Portal</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://drive.google.com/file/d/1nmV9zLd1ipOVrggb14MaKJcxI0WQqPcN/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Official Organizing Brochure</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/ecellkmctcemksd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Instagram @ecellkmctcemksd</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </li>
              <li className="pt-1 flex items-center gap-3">
                <Link href="/privacy" className="text-zinc-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <span className="text-zinc-700">•</span>
                <Link href="/terms" className="text-zinc-400 hover:text-white transition-colors">
                  Terms of Participation
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Metadata & Legal Row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-[11px] text-zinc-400">
            © {currentYear} ILLUMINATE KMCT. Conducted under the initiative of E-Cell, IIT Bombay.
          </p>
          <p className="text-[11px] text-zinc-400 max-w-lg font-mono">
            Registration fee: ₹699/- (Official NEC tariff). Inclusive of full 6-hour syllabus, physical startup kit & verified certificate.
          </p>
        </div>

      </div>
    </footer>
  );
}
