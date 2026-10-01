import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#07060b] py-28 relative">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Overview</span>
        </Link>

        <div className="surface-card rounded-xl p-8 sm:p-12 space-y-8">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded">
              Institutional Terms
            </span>
            <h1 className="text-3xl font-bold text-white tracking-tight mt-4">
              Terms of Participation
            </h1>
            <p className="font-mono text-xs text-zinc-500 mt-1">
              Effective Date: 2026-09-26 • KMCT College of Engineering, Kasaragod
            </p>
          </div>

          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed border-t border-white/[0.08] pt-6">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">1. Event Participation</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                ILLUMINATE is an offline entrepreneurship workshop held on campus at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod. By registering, you agree to attend the full 6-hour duration to qualify for official certificate issuance.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">2. Certificates and Kits</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Participation certificates are issued by <strong>E-Cell, IIT Bombay</strong> to registered students who attend the workshop offline and complete the exercises. The physical Illuminate Startup Kit will be distributed in person at the venue check-in desk.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">3. Pricing and Fees</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                The workshop registration fee is ₹699/- per participant in accordance with the official E-Cell IIT Bombay NEC discount guidelines (valid until 30 September 2026).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">4. Rescheduling & Cancellations</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                If the workshop date is updated due to institutional calendar or mentor scheduling, your registration pass remains fully valid for the rescheduled session. Cancellations or transfers are subject to KMCT faculty coordinator approval.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">5. Code of Conduct</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Attendees are expected to observe standard campus professional conduct, engage constructively with mentors and peer teams, and follow campus safety protocols.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
