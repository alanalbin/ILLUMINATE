import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#05030a] py-28 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-purple-400 hover:text-purple-300 uppercase tracking-wider mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to ILLUMINATE</span>
        </Link>

        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-purple-900/40 shadow-2xl space-y-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-purple-400 bg-purple-950/60 border border-purple-800/40 px-3.5 py-1 rounded-full">
              Participation Guidelines
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-4">
              Terms & Conditions
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Effective Date: 2026-09-26 • KMCT College of Engineering, Kasaragod
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">1. Event Participation</h2>
              <p>
                ILLUMINATE is an offline entrepreneurship workshop held on campus at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod. By registering, you agree to attend the full 6-hour duration to qualify for certificate issuance.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">2. Certificates and Kits</h2>
              <p>
                Participation certificates are issued by <strong>E-Cell, IIT Bombay</strong> to registered students who attend the workshop offline and complete the exercises. The physical Illuminate Startup Kit will be distributed in person at the venue check-in desk.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">3. Pricing and Fees</h2>
              <p>
                The workshop registration fee is ₹699/- per participant in accordance with the official E-Cell IIT Bombay NEC discount guidelines (valid until 30 September 2026).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">4. Rescheduling & Cancellations</h2>
              <p>
                If the workshop date is updated due to institutional calendar or mentor scheduling, your registration pass remains fully valid for the rescheduled session. Cancellations or transfers are subject to KMCT faculty coordinator approval.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">5. Code of Conduct</h2>
              <p>
                Attendees are expected to observe standard campus professional conduct, engage constructively with mentors and peer teams, and follow campus safety protocols.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
