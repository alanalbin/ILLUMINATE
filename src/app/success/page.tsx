'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Printer,
  Award,
  Package,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { Registration, EventConfig } from '@/types';

function SuccessContent() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('registrationId');

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const passRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!registrationId) {
      setError('No registration ID provided.');
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const [regRes, eventRes] = await Promise.all([
          fetch(`/api/registrations/${registrationId}`),
          fetch('/api/event'),
        ]);

        if (!regRes.ok) throw new Error('Registration could not be found.');

        const regData = await regRes.json();
        const eventData = await eventRes.json();

        setRegistration(regData.registration);
        setEventConfig(eventData.event);

        if (regData.registration.paymentStatus === 'verified') {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#a78bfa', '#818cf8', '#34d399', '#ffffff'],
          });
        }
      } catch (err: any) {
        setError(err.message || 'Error loading registration pass.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [registrationId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07060b] flex flex-col items-center justify-center p-6 text-zinc-400">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-3" />
        <p className="font-mono text-xs uppercase tracking-wider">Generating Credential Pass...</p>
      </div>
    );
  }

  if (error || !registration || !eventConfig) {
    return (
      <div className="min-h-screen bg-[#07060b] flex items-center justify-center p-6 text-center">
        <div className="surface-card max-w-md w-full p-8 rounded-xl border border-red-800/40">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Registration Not Found</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{error || 'Invalid registration reference.'}</p>
          <Link
            href="/register"
            className="inline-block w-full py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs uppercase tracking-wider transition-colors"
          >
            Go to Registration
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = registration.paymentStatus === 'verified';
  const isManualReview = registration.paymentStatus === 'manual_review';

  return (
    <div className="min-h-screen bg-[#07060b] py-28 relative">
      <div className="max-w-2xl mx-auto px-6 relative z-10">
        
        {/* Status Notification */}
        {isVerified ? (
          <div className="mb-8 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3.5 text-emerald-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-white">Payment Confirmed — Seat Secured</p>
              <p className="text-zinc-400 mt-0.5">
                Official pass active for <strong className="text-white">{registration.email}</strong>.
              </p>
            </div>
          </div>
        ) : isManualReview ? (
          <div className="mb-8 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center gap-3.5 text-amber-200">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-white">Verification In Progress</p>
              <p className="text-zinc-400 mt-0.5">
                UTR ref (<strong className="text-white font-mono">{registration.manualUtr}</strong>) logged with local campus coordinator.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center gap-3.5 text-zinc-300">
            <Clock className="w-5 h-5 text-zinc-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-white">Awaiting Payment</p>
              <p className="text-zinc-400 mt-0.5">
                Complete your payment verification to activate this credential pass.
              </p>
            </div>
          </div>
        )}

        {/* Printable Physical Conference Delegate Pass */}
        <div
          ref={passRef}
          className="rounded-xl border border-white/[0.12] bg-[#0c0a13] p-7 sm:p-9 shadow-2xl relative overflow-hidden print:border-black print:bg-white print:text-black"
        >
          {/* Lanyard punch slit indicator */}
          <div className="mx-auto w-12 h-1.5 rounded-full bg-white/[0.08] mb-6 print:hidden" />

          {/* Pass Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-white/[0.08] print:border-gray-300">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[10px] uppercase tracking-wider text-violet-400 print:text-purple-700">
                  E-Cell, IIT Bombay Initiative
                </span>
                <span className="text-zinc-600 print:hidden">•</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 print:text-gray-500">
                  NEC 2026
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight print:text-black">
                ILLUMINATE PASS
              </h1>
              <p className="text-xs text-zinc-400 mt-1 print:text-gray-600">
                KMCT College of Engineering, Kasaragod
              </p>
            </div>

            <div className="text-left sm:text-right flex items-center sm:items-start justify-between sm:justify-end gap-4">
              <div className="w-16 h-16 bg-white p-1 rounded-lg hidden sm:flex items-center justify-center shrink-0">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `ILLUMINATE:${registration.registrationNumber}:${registration.fullName}`
                  )}`}
                  alt="Pass QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                  Serial Number
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wider block print:text-black mt-0.5">
                  {registration.registrationNumber}
                </span>
                <div className="mt-1.5">
                  <span
                    className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isVerified
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {isVerified ? 'VERIFIED ✓' : 'REVIEW PENDING'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Participant Information */}
          <div className="py-6 space-y-4 border-b border-white/[0.08] print:border-gray-300">
            <div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                Delegate Name
              </span>
              <p className="text-xl font-bold text-white tracking-tight print:text-black">
                {registration.fullName}
              </p>
              <p className="text-xs text-zinc-400 mt-0.5 print:text-gray-600">
                {registration.course} ({registration.yearOfStudy}) • {registration.institution}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                  Email & Phone
                </span>
                <p className="text-xs text-zinc-300 font-mono mt-0.5 print:text-gray-700 truncate">
                  {registration.email}
                </p>
                <p className="text-xs text-zinc-400 font-mono print:text-gray-600">
                  +91 {registration.phone}
                </p>
              </div>

              <div>
                <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                  Fee Tariff
                </span>
                <p className="text-sm font-mono font-bold text-white mt-0.5 print:text-black">
                  ₹{registration.amountPaid || eventConfig.registrationFee} INR
                </p>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Official Rate Applied
                </span>
              </div>
            </div>
          </div>

          {/* Logistics Strip */}
          <div className="py-5 grid grid-cols-3 gap-3 text-xs border-b border-white/[0.08] print:border-gray-300">
            <div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">Duration</span>
              <p className="text-xs font-semibold text-white mt-0.5 print:text-black">6 Hours Offline</p>
            </div>
            <div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">Date</span>
              <p className="text-xs font-semibold text-white mt-0.5 print:text-black">
                {eventConfig.date || 'TBA'}
              </p>
            </div>
            <div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">Venue</span>
              <p className="text-xs font-semibold text-white mt-0.5 truncate print:text-black">
                {eventConfig.venue}
              </p>
            </div>
          </div>

          {/* Deliverables Footer */}
          <div className="pt-5 flex items-center justify-between text-xs text-zinc-400 print:text-gray-600">
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[11px]">E-Cell IIT Bombay Certificate</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[11px]">Physical Startup Kit</span>
            </div>
          </div>

        </div>

        {/* Action Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Credential (PDF)</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 text-xs font-medium text-center transition-colors"
          >
            Return to Homepage
          </Link>
        </div>

        {/* Participant Protocol */}
        <div className="mt-12 surface-card rounded-xl p-6 space-y-3">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
            Important Information for Participants
          </h3>
          <ul className="space-y-2 text-xs text-zinc-400 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="font-mono text-zinc-600">•</span>
              <span>Keep your Pass ID (<strong className="text-white font-mono">{registration.registrationNumber}</strong>) saved on your phone for campus entry.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-zinc-600">•</span>
              <span>The campus coordinators will announce the confirmed hall and schedule via college notifications.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-mono text-zinc-600">•</span>
              <span>Present this pass at the registration desk on the event morning to collect your official Illuminate startup kit.</span>
            </li>
          </ul>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
            <span>Desk Coordinator: Alan Albin</span>
            <a href="tel:8848563266" className="text-zinc-300 hover:text-white font-mono">
              8848563266
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07060b] flex items-center justify-center text-zinc-500">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
