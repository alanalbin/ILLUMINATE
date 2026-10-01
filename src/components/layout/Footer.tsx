import React from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030107] border-t border-purple-950/40 text-slate-400 text-xs m-0 p-0">
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
        
        {/* Partner Logos Strip */}
        <div className="mb-6 pb-4 border-b border-purple-950/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 text-center sm:text-left">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold">
                Institutional Affiliations & Official Partners
              </p>
              <h4 className="text-base font-bold text-white mt-0.5">
                KMCT College of Engineering • E-Cell IIT Bombay
              </h4>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              National Entrepreneurship Challenge (NEC)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
            {/* KMCT College */}
            <a
              href="https://nxtbyteksd.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-blue-500/40 hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center h-20 group"
              title="KMCT College of Engineering, Kasaragod"
            >
              <img src="/logos/kmct-college.png" alt="KMCT College" className="h-6 w-auto max-w-[130px] object-contain group-hover:scale-105 transition-transform" />
              <span className="text-[9px] text-zinc-400 mt-1.5 font-medium">Host Institution</span>
            </a>

            {/* E-Cell IIT Bombay */}
            <a
              href="https://www.ecell.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/40 hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center h-20 group"
              title="The Entrepreneurship Cell, IIT Bombay"
            >
              <img src="/logos/ecell-iitb.png" alt="E-Cell IIT Bombay" className="h-9 w-auto object-contain group-hover:scale-105 transition-transform" />
              <span className="text-[9px] text-zinc-400 mt-1 font-medium">E-Cell IIT Bombay</span>
            </a>

            {/* Nxt Byte E-Cell */}
            <a
              href="https://nxtbyteksd.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-emerald-500/40 hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center h-20 group"
              title="Nxt Byte College E-Cell, KMCT"
            >
              <img src="/logos/nxtbyte-ecell.png" alt="Nxt Byte E-Cell" className="h-9 w-auto object-contain group-hover:scale-105 transition-transform" />
              <span className="text-[9px] text-zinc-400 mt-1 font-medium">Nxt Byte (College E-Cell)</span>
            </a>

            {/* NEC 2026 */}
            <a
              href="https://www.ecell.in/nec/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/40 hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center h-20 group"
              title="National Entrepreneurship Challenge (NEC 2026)"
            >
              <img src="/logos/nec-iitb.png" alt="NEC 2026" className="h-9 w-auto object-contain group-hover:scale-105 transition-transform" />
              <span className="text-[9px] text-zinc-400 mt-1 font-medium">NEC Challenge 2026</span>
            </a>

            {/* Illuminate Torch */}
            <a
              href="https://www.ecell.in/illuminate/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/40 hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center h-20 group col-span-2 sm:col-span-4 lg:col-span-1"
              title="ILLUMINATE Workshop"
            >
              <img src="/logos/illuminate-torch.png" alt="ILLUMINATE" className="h-8 w-auto max-w-[130px] object-contain group-hover:scale-105 transition-transform" />
              <span className="text-[9px] text-zinc-400 mt-1 font-medium">Masterclass Track</span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo-icon.png"
                alt="ILLUMINATE Logo"
                className="h-8 w-auto object-contain drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]"
              />
              <span className="font-extrabold text-sm tracking-widest text-white uppercase">
                ILLUMINATE
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              A 6-hour hands-on entrepreneurship workshop conducted at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod, in association with E-Cell, IIT Bombay.
            </p>
          </div>

          {/* Col 2: Institutional Affiliation */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Host Institution
            </h4>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] mb-2">
              <img src="/logos/kmct-college.png" alt="KMCT" className="h-5 w-auto object-contain" />
            </div>
            <p className="text-slate-300 font-medium">
              KMCT College of Engineering for Emerging Technologies and Management
            </p>
            <p className="text-slate-400">
              Kasaragod, Kerala, India
            </p>
            <p className="text-[11px] text-purple-400 pt-1">
              National Entrepreneurship Challenge (NEC)
            </p>
          </div>

          {/* Col 3: Official Event Contact */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Event Contact
            </h4>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Contact Person</p>
              <p className="text-white font-medium text-xs mt-0.5">Alan Albin</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Registration Details & Local Coordinator</p>
            </div>

            <div className="pt-2 border-t border-white/[0.08]">
              <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Mobile</p>
              <a
                href="tel:8848563266"
                className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white font-mono text-xs transition-colors mt-0.5"
              >
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                <span>8848563266</span>
              </a>
            </div>

            <div className="pt-1">
              <p className="text-[11px] text-zinc-400">E-Cell, IIT Bombay Initiative</p>
              <p className="text-[10px] text-zinc-500">KMCT College of Engineering, Kasaragod</p>
            </div>
          </div>

          {/* Col 4: Links & Official Docs */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Resources & Verification
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://nxtbyteksd.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
                >
                  <span>KMCT E-Cell (Nxt Byte)</span>
                  <ExternalLink className="w-3 h-3 text-emerald-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/ecellkmctcemksd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 transition-colors"
                >
                  <span>Instagram @ecellkmctcemksd</span>
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.ecell.in/illuminate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-purple-400 transition-colors"
                >
                  <span>IIT Bombay Illuminate Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://drive.google.com/file/d/1nmV9zLd1ipOVrggb14MaKJcxI0WQqPcN/view"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-purple-400 transition-colors"
                >
                  <span>Organizing Brochure</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Terms of Participation
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar & Disclaimers */}
        <div className="mt-4 pt-3 border-t border-purple-950/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-[11px] text-slate-400">
            © {currentYear} ILLUMINATE KMCT. Conducted under the initiative of E-Cell, IIT Bombay. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-400 max-w-md">
            Workshop date and exact venue hall subject to institutional scheduling. Registration fee is ₹699/- per participant in accordance with official E-Cell IIT Bombay NEC guidelines.
          </p>
        </div>

      </div>
    </footer>
  );
}
