import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
              Data Protection & Privacy
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-4">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Effective Date: 2026-09-26 • ILLUMINATE Workshop Kasaragod
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">1. Scope and Purpose</h2>
              <p>
                This privacy policy applies to personal information gathered from students, faculty, and participants registering for the <strong>ILLUMINATE Entrepreneurship Workshop</strong> conducted at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod, in association with <strong>E-Cell, IIT Bombay</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">2. Information We Collect</h2>
              <p>When you register for the event, we collect:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Your full name (as required on official certificates)</li>
                <li>Email address and mobile phone number for event communication and pass delivery</li>
                <li>College/Institution name, academic branch, and current year of study</li>
                <li>Transaction reference numbers (e.g., UTR / Razorpay payment IDs) to verify entry fee payments</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">3. How Information Is Used</h2>
              <p>The collected information is used strictly for:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-400">
                <li>Issuing official digital and physical entry passes</li>
                <li>Facilitating attendance tracking and kit distribution at the offline workshop</li>
                <li>Submitting participant rosters to E-Cell, IIT Bombay for certificate issuance</li>
                <li>Verifying eligibility for NEC incentives and E-Summit student benefits</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">4. Payment and Financial Security</h2>
              <p>
                We do not store UPI PINs, card numbers, or banking credentials on our servers. Online payments are processed through Razorpay or direct bank UPI rails using cryptographic signature verification.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">5. Coordinator Contact</h2>
              <p>
                For questions regarding your data or to request corrections, contact Alan Albin (Registration Details & Local Coordinator) at <a href="tel:8848563266" className="text-purple-400 hover:underline">8848563266</a> or <a href="mailto:alan.albin@kmct.edu.in" className="text-purple-400 hover:underline">alan.albin@kmct.edu.in</a>.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
