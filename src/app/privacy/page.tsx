import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
              Data Protection
            </span>
            <h1 className="text-3xl font-bold text-white tracking-tight mt-4">
              Privacy Policy
            </h1>
            <p className="font-mono text-xs text-zinc-500 mt-1">
              Effective Date: 2026-09-26 • ILLUMINATE Workshop Kasaragod
            </p>
          </div>

          <div className="space-y-6 text-sm text-zinc-300 leading-relaxed border-t border-white/[0.08] pt-6">
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">1. Scope and Purpose</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This privacy policy applies to personal information gathered from students, faculty, and participants registering for the <strong>ILLUMINATE Entrepreneurship Workshop</strong> conducted at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod, in association with <strong>E-Cell, IIT Bombay</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">2. Information We Collect</h2>
              <p className="text-xs text-zinc-400">When you register for the event, we collect:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-400">
                <li>Your full name (as required on official certificates)</li>
                <li>Email address and mobile phone number for pass delivery and logistics</li>
                <li>College/Institution name, academic branch, and current year of study</li>
                <li>Transaction reference numbers (e.g., UTR / payment IDs) to reconcile entry fees</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">3. How Information Is Used</h2>
              <p className="text-xs text-zinc-400">The collected information is used strictly for:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-400">
                <li>Issuing official digital and physical entry passes</li>
                <li>Facilitating attendance tracking and kit distribution at the offline workshop</li>
                <li>Submitting participant rosters to E-Cell, IIT Bombay for certificate issuance</li>
                <li>Verifying eligibility for NEC incentives and E-Summit student benefits</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">4. Payment and Financial Security</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We do not store UPI PINs, card numbers, or banking credentials on our servers. Online payments are processed through Razorpay or direct bank UPI rails using cryptographic transaction verification.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-white">5. Coordinator Contact</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                For questions regarding your data or to request corrections, contact Alan Albin (Registration Details & Local Coordinator) at <a href="tel:8848563266" className="text-zinc-200 underline hover:text-white">8848563266</a>.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
