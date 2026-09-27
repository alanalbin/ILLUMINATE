import React from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030107] border-t border-purple-950/40 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 py-14">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-purple-700 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
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

          {/* Col 3: Official E-Cell Contact */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Official Program Lead
            </h4>
            <p className="text-slate-300 font-medium">Rachit Kumar</p>
            <p className="text-slate-400 text-[11px]">E-Cell, IIT Bombay</p>
            <div className="pt-1 space-y-1">
              <a
                href="mailto:rachit@ecell.in"
                className="flex items-center gap-1.5 text-slate-300 hover:text-purple-400 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>rachit@ecell.in</span>
              </a>
              <a
                href="tel:+919719362033"
                className="flex items-center gap-1.5 text-slate-300 hover:text-purple-400 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span>+91 9719362033</span>
              </a>
            </div>

            <div className="pt-2 border-t border-purple-950/50">
              <p className="text-[10px] uppercase font-bold text-purple-400">Registration Inquiries</p>
              <p className="text-slate-300 font-semibold text-xs mt-0.5">Alan Albin</p>
              <a
                href="tel:+918848563266"
                className="flex items-center gap-1.5 text-slate-300 hover:text-purple-400 transition-colors mt-0.5"
              >
                <Phone className="w-3 h-3 text-purple-400" />
                <span>+91 8848563266</span>
              </a>
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
                  href="https://www.ecell.in/illuminate/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-300 hover:text-purple-400 transition-colors"
                >
                  <span>Official Illuminate Portal</span>
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
              <li>
                <Link href="/admin" className="text-slate-400 hover:text-purple-300 transition-colors">
                  Admin Coordinator Access
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar & Disclaimers */}
        <div className="mt-12 pt-8 border-t border-purple-950/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] text-slate-400">
            © {currentYear} ILLUMINATE KMCT. Conducted under the initiative of E-Cell, IIT Bombay. All rights reserved.
          </p>
          <p className="text-[11px] text-slate-400 max-w-md">
            Workshop date and exact venue hall subject to final institutional confirmation. Registration fee is set at ₹700 (subject to official review against ₹699 NEC discount guidelines).
          </p>
        </div>

      </div>
    </footer>
  );
}
