'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  MapPin,
  Calendar,
  Award,
  Package,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowLeft,
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

        // Fire celebratory confetti only if payment is verified
        if (regData.registration.paymentStatus === 'verified') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#c084fc', '#9333ea', '#6366f1', '#10b981'],
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
      <div className="min-h-screen bg-[#05030a] flex flex-col items-center justify-center p-6 text-slate-300">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
        <p className="text-sm font-medium">Generating official workshop pass...</p>
      </div>
    );
  }

  if (error || !registration || !eventConfig) {
    return (
      <div className="min-h-screen bg-[#05030a] flex items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-red-900/50 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Registration Not Found</h2>
          <p className="text-sm text-slate-300 mb-6">{error || 'Invalid registration reference.'}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/"
              className="flex-1 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
              <span>Home</span>
            </Link>
            <Link
              href="/register"
              className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center transition-colors shadow-lg shadow-purple-900/30"
            >
              Registration
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isVerified = registration.paymentStatus === 'verified';
  const isManualReview = registration.paymentStatus === 'manual_review';

  return (
    <div className="min-h-screen bg-[#05030a] py-28 relative">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        {/* Navigation / Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-purple-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer group shadow-sm backdrop-blur-md active:scale-95"
            title="Return to Home"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <Link
            href="/register"
            className="text-xs text-slate-400 hover:text-purple-300 transition-colors flex items-center gap-1.5"
          >
            <span>Register Another</span>
          </Link>
        </div>

        {/* Status Notification Banner */}
        {isVerified ? (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-4 text-emerald-200 shadow-xl shadow-emerald-950/20">
            <div className="w-12 h-12 rounded-xl bg-emerald-900/60 border border-emerald-500/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Payment Verified & Seat Confirmed!</h2>
              <p className="text-xs text-emerald-300 mt-0.5">
                Your official ILLUMINATE workshop pass is generated below. A confirmation has been dispatched to{' '}
                <strong className="text-white">{registration.email}</strong>.
              </p>
            </div>
          </div>
        ) : isManualReview ? (
          <div className="mb-8 p-6 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-4 text-amber-200 shadow-xl shadow-amber-950/20">
            <div className="w-12 h-12 rounded-xl bg-amber-900/60 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Clock className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Awaiting Coordinator Verification</h2>
              <p className="text-xs text-amber-300 mt-0.5">
                Your UPI transaction reference (<strong>{registration.manualUtr}</strong>) has been queued for review by the campus coordinator. Your pass will be activated upon approval.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-8 p-6 rounded-2xl bg-purple-950/40 border border-purple-500/40 flex items-center gap-4 text-purple-200">
            <Clock className="w-7 h-7 text-purple-400 shrink-0" />
            <div>
              <h2 className="text-lg font-bold text-white">Payment Pending</h2>
              <p className="text-xs text-purple-300 mt-0.5">
                Please complete your registration payment to activate this pass.
              </p>
            </div>
          </div>
        )}

        {/* Printable Pass Container */}
        <div
          ref={passRef}
          className="rounded-3xl bg-gradient-to-b from-[#140b2a] via-[#0d071c] to-[#080413] border-2 border-purple-500/30 p-8 shadow-2xl relative overflow-hidden print:border-black print:bg-white print:text-black"
        >
          {/* Subtle Pass Watermark of Logo */}
          <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 pointer-events-none opacity-[0.05] w-96 h-96 overflow-hidden print:hidden" aria-hidden="true">
            <img src="/logo.png" alt="" className="w-full h-full object-contain" />
          </div>

          {/* Top Pass Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/50 pb-6 print:border-gray-300 relative z-10">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo-icon.png"
                alt="ILLUMINATE"
                className="h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400 print:text-purple-700">
                    E-Cell, IIT Bombay Initiative
                  </span>
                  <span className="text-zinc-600 print:hidden">•</span>
                  <span className="text-[11px] text-zinc-400 font-medium hidden sm:inline">
                    Host: KMCTCEEM
                  </span>
                </div>
                <h1 className="text-3xl font-black text-white tracking-wider mt-0.5 print:text-black">
                  ILLUMINATE PASS
                </h1>
                <p className="text-xs text-slate-300 mt-0.5 print:text-gray-600">
                  KMCT College of Engineering for Emerging Technologies and Management, Kasaragod
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 p-1.5 rounded-xl bg-black/40 border border-white/10 print:border-gray-300">
              <img src="/logos/ecell-iitb.png" alt="IIT Bombay" className="h-9 w-auto object-contain" />
              <div className="h-6 w-px bg-white/10 print:bg-gray-300" />
              <img src="/logos/kmct-college.png" alt="KMCT" className="h-5 w-auto max-w-[90px] object-contain" />
            </div>

            <div className="text-left sm:text-right flex items-center sm:items-start gap-4 justify-between sm:justify-end">
              <div className="w-16 h-16 bg-white p-1.5 rounded-xl hidden sm:flex items-center justify-center shrink-0 shadow-md">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                    `ILLUMINATE-PASS:${registration.registrationNumber}:${registration.fullName}`
                  )}`}
                  alt="Ticket QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block">
                  Unique Ticket ID
                </span>
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <span className="text-base sm:text-lg font-mono font-black text-purple-300 tracking-wide print:text-purple-900 bg-purple-950/70 border border-purple-800/40 px-2 py-0.5 rounded-lg shadow-sm">
                    {registration.registrationNumber}
                  </span>
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      isVerified
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-amber-950 text-amber-300 border border-amber-700'
                    }`}
                  >
                    {isVerified ? 'VERIFIED PASS ✓' : 'PENDING APPROVAL'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Participant Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Participant Name
              </span>
              <span className="text-xl font-bold text-white mt-1 block print:text-black">
                {registration.fullName}
              </span>
              <p className="text-xs text-slate-300 mt-0.5 print:text-gray-600">
                {registration.course} ({registration.yearOfStudy})
              </p>
              <p className="text-xs text-slate-400 mt-0.5 print:text-gray-500">
                {registration.institution}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Contact Details
                </span>
                <p className="text-xs text-slate-300 mt-1 print:text-gray-700">
                  {registration.email} • +91 {registration.phone}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Amount Recorded
                </span>
                <p className="text-base font-bold text-gradient-vibrant print:text-black">
                  ₹{registration.amountPaid || eventConfig.registrationFee} INR
                </p>
              </div>
            </div>
          </div>

          {/* Event Logistics Badge */}
          <div className="p-5 rounded-2xl bg-[#090514] border border-purple-900/40 grid grid-cols-1 sm:grid-cols-3 gap-4 print:bg-gray-100 print:border-gray-300">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Duration</span>
              <p className="text-xs font-bold text-white mt-0.5 print:text-black">6 Hours Offline</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Date</span>
              <p className="text-xs font-bold text-white mt-0.5 print:text-black">
                {eventConfig.date || 'To be announced (TBA)'}
              </p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Venue</span>
              <p className="text-xs font-bold text-white mt-0.5 truncate print:text-black">
                {eventConfig.venue}
              </p>
            </div>
          </div>

          {/* Guaranteed Deliverables Reminder */}
          <div className="mt-8 pt-6 border-t border-purple-950/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 print:border-gray-300 print:text-gray-600">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Official Certificate from E-Cell IIT Bombay</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" />
              <span>Illuminate Physical Startup Kit</span>
            </div>
          </div>

        </div>

        {/* Action Controls */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/50 text-purple-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print or Save Pass (PDF)</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium text-center transition-colors"
          >
            Return to Homepage
          </Link>
        </div>

        {/* Next Steps Guidance */}
        <div className="mt-12 glass-card rounded-2xl p-7 border border-purple-900/30 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Important Next Steps for Participants
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
              <span>Keep your Pass ID (<strong>{registration.registrationNumber}</strong>) handy on your phone.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
              <span>The organizing faculty coordinators will announce the confirmed hall and schedule via email & college bulletin.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-purple-950 text-purple-300 flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
              <span>Arrive on time to claim your physical Illuminate Startup Kit at the venue reception.</span>
            </li>
          </ul>

          <div className="pt-4 border-t border-white/[0.08] flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-2">
            <div>
              <span className="font-medium text-white">Contact Person:</span> Alan Albin (Local Coordinator)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-mono">Mobile:</span>
              <a href="tel:8848563266" className="text-zinc-200 hover:text-white font-mono font-medium hover:underline">
                8848563266
              </a>
            </div>
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
        <div className="min-h-screen bg-[#05030a] flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
