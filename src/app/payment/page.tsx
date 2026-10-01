'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  Smartphone,
  Zap,
  CheckCircle,
  ArrowRight,
  FileSpreadsheet,
} from 'lucide-react';
import { Registration, EventConfig } from '@/types';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('registrationId');

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setServerError] = useState<string | null>(null);

  // UPI and UTR state
  const [utrNumber, setUtrNumber] = useState('');
  const [payerUpiId, setPayerUpiId] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Official UPI payment target for Alan Albin
  const coordinatorUpiId = 'alanalbin06112005@okicici';
  const coordinatorName = 'Alan Albin';

  useEffect(() => {
    if (!registrationId) {
      setServerError('No registration reference found. Please complete the registration form first.');
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        const [regRes, eventRes] = await Promise.all([
          fetch(`/api/registrations/${registrationId}`),
          fetch('/api/event'),
        ]);

        if (!regRes.ok) {
          throw new Error('Registration record could not be found.');
        }

        const regData = await regRes.json();
        const eventData = await eventRes.json();

        setRegistration(regData.registration);
        setEventConfig(eventData.event);

        if (regData.registration.paymentStatus === 'verified') {
          router.push(`/success?registrationId=${registrationId}`);
        }
      } catch (err: any) {
        console.error('Error fetching registration:', err);
        setServerError(err.message || 'Unable to load registration details.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [registrationId, router]);

  const handleCopyUpi = (upi: string) => {
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const fee = eventConfig?.registrationFee || 699;
  const ticketId = registration?.registrationNumber || 'ILM-PASS';
  const upiIntentUri = `upi://pay?pa=${coordinatorUpiId}&pn=${encodeURIComponent(coordinatorName)}&am=${fee}.00&cu=INR&tn=${encodeURIComponent('Pass ' + ticketId)}`;

  // Handle UPI UTR / Reference submission
  const handleUpiVerification = async (e?: React.FormEvent, isInstantPass = false) => {
    if (e) e.preventDefault();
    if (!registration) return;
    setUtrError(null);

    const refCode = isInstantPass ? `UPI-${Date.now().toString(36).toUpperCase()}` : utrNumber.trim();

    if (!isInstantPass && refCode.length < 6) {
      setUtrError('Please enter your 12-digit UPI transaction reference (UTR) number from your payment receipt.');
      return;
    }

    setIsSubmittingUtr(true);

    try {
      const res = await fetch('/api/payment/manual-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registration.id,
          utrNumber: refCode,
          payerUpiId: payerUpiId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUtrError(data.message || 'Failed to submit transaction reference.');
        setIsSubmittingUtr(false);
        return;
      }

      // Success: redirect to verified pass
      router.push(`/success?registrationId=${registration.id}`);
    } catch (err: any) {
      console.error('UPI submission error:', err);
      setUtrError('Network error while verifying transaction. Please try again.');
      setIsSubmittingUtr(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05030a] flex flex-col items-center justify-center p-6 text-slate-300">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
        <p className="text-sm font-medium">Loading your registration & payment pass...</p>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-[#05030a] flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-red-900/50">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Registration Not Found</h2>
          <p className="text-sm text-slate-300 mb-6">{error || 'Please register first to continue.'}</p>
          <Link
            href="/register"
            className="inline-block w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all"
          >
            Go to Registration Form
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05030a] py-28 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs font-bold text-purple-300 uppercase tracking-widest mb-3 shadow-sm">
            <QrCode className="w-3.5 h-3.5 text-purple-400" />
            <span>Scan QR & Unlock Pass</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            UPI QR Payment
          </h1>
          <p className="mt-2 text-slate-300 text-sm">
            Scan the official QR code below or tap your preferred UPI app to pay ₹{fee}, then enter your transaction UTR number to instantly receive your verified ticket.
          </p>
        </div>

        {/* Pricing & Unique Ticket ID Overview Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-7 border border-purple-800/40 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 pointer-events-none opacity-[0.05] w-56 h-56 overflow-hidden" aria-hidden="true">
            <img src="/logo-icon.png" alt="" className="w-full h-full object-contain" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-purple-400 tracking-wider">
                Candidate Pass
              </span>
              <span className="text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                Ticket ID: {registration.registrationNumber}
              </span>
            </div>
            <h3 className="text-xl font-black text-white mt-1">{registration.fullName}</h3>
            <p className="text-xs text-slate-300 mt-0.5">{registration.course} • {registration.institution}</p>
          </div>

          <div className="flex items-center gap-6 text-right sm:text-right w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-purple-950/60">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Amount</span>
              <p className="text-3xl font-black text-gradient-vibrant">₹{fee}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs font-bold">
              Payment Pending
            </div>
          </div>
        </div>

        {/* MAIN PAYMENT WORKFLOW: EXCLUSIVELY QR & UTR */}
        <div className="glass-card rounded-3xl p-6 sm:p-9 border border-purple-800/40 shadow-2xl space-y-8 backdrop-blur-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: THE OFFICIAL PAYMENT QR IMAGE */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
              <div className="w-full p-4 rounded-3xl bg-[#0b0619]/90 border border-purple-700/40 shadow-2xl flex flex-col items-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 mb-2.5 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" />
                  Official Google Pay QR
                </span>

                {/* Actual User Uploaded QR Image */}
                <div className="w-full max-w-[260px] sm:max-w-[280px] bg-white rounded-2xl p-2 shadow-xl border border-white/20 transition-transform duration-300 hover:scale-[1.02]">
                  <img
                    src="/payment-qr.jpg"
                    alt="Alan Albin UPI Payment QR Code"
                    className="w-full h-auto object-contain rounded-xl block"
                  />
                </div>

                <div className="mt-3.5 text-center">
                  <p className="text-xs font-semibold text-white">
                    Scan with any UPI App
                  </p>
                  <p className="text-[11px] text-purple-300/80 mt-0.5">
                    Google Pay • PhonePe • Paytm • BHIM • Cred
                  </p>
                </div>
              </div>

              {/* Coordinator UPI ID with 1-Click Copy */}
              <div className="w-full p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Or transfer directly to UPI ID:
                </span>
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate">
                    <span className="text-xs sm:text-sm font-mono font-semibold text-white block select-all truncate">
                      {coordinatorUpiId}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Lead Coordinator: {coordinatorName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyUpi(coordinatorUpiId)}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 1-TAP LAUNCHERS & UTR SUBMISSION FORM */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Mobile 1-Tap Launchers */}
              <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                    <span>On Mobile? Tap to Pay ₹{fee}:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">Pre-filled Amount</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={upiIntentUri}
                    className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Google Pay</span>
                  </a>

                  <a
                    href={upiIntentUri}
                    className="p-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>PhonePe</span>
                  </a>

                  <a
                    href={upiIntentUri}
                    className="p-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Paytm</span>
                  </a>

                  <a
                    href={upiIntentUri}
                    className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Any UPI App</span>
                  </a>
                </div>
              </div>

              {/* UTR Input Form */}
              <form onSubmit={(e) => handleUpiVerification(e, false)} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">✓</span>
                    <span>Enter Transfer UTR / UPI Reference</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Step 2 of 2
                  </span>
                </div>

                {utrError && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/40 text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{utrError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    12-Digit UPI Transaction / UTR Number <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={25}
                    placeholder="e.g. 427189023418"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-purple-900/50 focus:border-emerald-400 focus:outline-none text-white text-base font-mono tracking-wider transition-colors placeholder:text-zinc-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    Check your UPI payment receipt under <strong className="text-slate-200">&quot;UPI Ref No.&quot;</strong>, <strong className="text-slate-200">&quot;UTR&quot;</strong>, or <strong className="text-slate-200">&quot;Google Transaction ID&quot;</strong>.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your UPI ID / Mobile Number (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. yourname@oksbi or 9876543210"
                    value={payerUpiId}
                    onChange={(e) => setPayerUpiId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-900/50 focus:border-purple-400 focus:outline-none text-white text-sm placeholder:text-zinc-600"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingUtr}
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingUtr ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying & Syncing to GSheet...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Submit UTR & Claim Pass</span>
                      </>
                    )}
                  </button>

                  {/* Organizer Instant Test Verify Button */}
                  <button
                    type="button"
                    onClick={() => handleUpiVerification(undefined, true)}
                    disabled={isSubmittingUtr}
                    className="py-4 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center shrink-0"
                    title="Organizer instant pass generation"
                  >
                    Instant Test Verify
                  </button>
                </div>

                {/* Google Sheet Sync Notice */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/30 text-[11px] text-emerald-300">
                  <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    Your payment details and UTR will be immediately synced and visible in the official Google Sheet database.
                  </span>
                </div>

              </form>

            </div>

          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-4 border-t border-purple-950/40 text-center">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Direct Coordinator Account Transfer • No Payment Gateway Surcharge • Instant Ticket Confirmation</span>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#05030a] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
