'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Info,
  Copy,
  Check,
  Smartphone,
  Zap,
  ArrowUpRight,
  CheckCircle,
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

  // Active payment tab: default to UPI Gateway
  const [activeTab, setActiveTab] = useState<'upi' | 'card'>('upi');
  const [utrNumber, setUtrNumber] = useState('');
  const [payerUpiId, setPayerUpiId] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Card / Razorpay processing
  const [isProcessingGateway, setIsProcessingGateway] = useState(false);

  // Selected UPI ID (Alan Albin's primary or official ecell)
  const [selectedUpiId, setSelectedUpiId] = useState('8848563266@axl');

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

  // UPI Intent URI construction
  const fee = eventConfig?.registrationFee || 699;
  const ticketId = registration?.registrationNumber || 'ILM-PASS';
  const merchantName = 'ILLUMINATE KMCT';
  const upiIntentUri = `upi://pay?pa=${selectedUpiId}&pn=${encodeURIComponent(merchantName)}&am=${fee}.00&cu=INR&tn=${encodeURIComponent('Pass ' + ticketId)}`;

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

  // Razorpay / Card fallback
  const handleGatewayPayment = async () => {
    if (!registration || !eventConfig) return;
    setIsProcessingGateway(true);
    setServerError(null);

    try {
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.id }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize payment order');
      }

      if (typeof window !== 'undefined' && (window as any).Razorpay && !orderData.isTestMode) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amountPaise,
          currency: orderData.currency,
          name: 'ILLUMINATE Workshop',
          description: `Pass for ${registration.fullName} (${registration.registrationNumber})`,
          order_id: orderData.orderId,
          prefill: {
            name: registration.fullName,
            email: registration.email,
            contact: registration.phone,
          },
          theme: { color: '#9333ea' },
          handler: async function (response: any) {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                registrationId: registration.id,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              router.push(`/success?registrationId=${registration.id}`);
            } else {
              setServerError(verifyData.message || 'Verification failed.');
              setIsProcessingGateway(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessingGateway(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } else {
        // Instant test verification
        const mockPaymentId = `pay_test_${Date.now()}`;
        const mockSig = `test_sig_${orderData.orderId}_${mockPaymentId}`;

        const verifyRes = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            registrationId: registration.id,
            orderId: orderData.orderId,
            paymentId: mockPaymentId,
            signature: mockSig,
          }),
        });

        const verifyData = await verifyRes.json();
        if (verifyData.success) {
          router.push(`/success?registrationId=${registration.id}`);
        } else {
          setServerError(verifyData.message || 'Payment verification failed.');
          setIsProcessingGateway(false);
        }
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setServerError(err.message || 'An error occurred during payment processing.');
      setIsProcessingGateway(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05030a] flex flex-col items-center justify-center p-6 text-slate-300">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
        <p className="text-sm font-medium">Securing UPI payment gateway session...</p>
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
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs font-bold text-purple-300 uppercase tracking-widest mb-3 shadow-sm">
            <img src="/logo-icon.png" alt="" className="w-3.5 h-3.5 object-contain" />
            <span>Step 2: Confirm Workshop Pass</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            UPI Payment Gateway
          </h1>
          <p className="mt-2 text-slate-300 text-sm">
            Pay ₹{fee} via Google Pay, PhonePe, Paytm, or any UPI app to unlock your official verified pass.
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
                Pass Holder
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
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Fee</span>
              <p className="text-3xl font-black text-gradient-vibrant">₹{fee}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs font-bold">
              {registration.paymentStatus === 'manual_review' ? 'Under Review' : 'Payment Pending'}
            </div>
          </div>
        </div>

        {/* Tabs: UPI Gateway (Primary) vs Cards/NetBanking */}
        <div className="flex border-b border-purple-950/60 mb-8">
          <button
            onClick={() => setActiveTab('upi')}
            className={`pb-4 px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'upi'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>UPI Gateway (Google Pay / PhonePe / Paytm / QR)</span>
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`pb-4 px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'card'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cards / NetBanking Checkout</span>
          </button>
        </div>

        {/* TAB 1: UPI GATEWAY (PRIMARY) */}
        {activeTab === 'upi' && (
          <div className="glass-card rounded-3xl p-6 sm:p-9 border border-purple-800/40 shadow-2xl space-y-8 backdrop-blur-xl">
            
            {/* Step 1: Scan QR or Click 1-Tap UPI Launchers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  <span>Pay ₹{fee} via UPI App or Scan QR</span>
                </h3>
                <span className="text-xs text-purple-300 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-full">
                  Zero Gateway Surcharge
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-7 items-center">
                
                {/* Dynamic QR Code Card (5 cols) */}
                <div className="md:col-span-5 p-5 rounded-2xl bg-[#0b0619] border border-purple-700/40 flex flex-col items-center justify-center text-center space-y-3 shadow-inner">
                  <div className="w-44 h-44 bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg relative group overflow-hidden">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiIntentUri)}`}
                      alt="UPI Payment QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Scan with any UPI App
                    </span>
                    <span className="text-[11px] text-purple-300">
                      GPay • PhonePe • Paytm • BHIM • Cred
                    </span>
                  </div>
                </div>

                {/* 1-Tap Mobile UPI Launcher Buttons (7 cols) */}
                <div className="md:col-span-7 space-y-4">
                  <p className="text-xs font-semibold text-slate-300">
                    On a phone? Tap below to open your UPI app directly with ₹{fee} pre-filled:
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <a
                      href={upiIntentUri}
                      className="p-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Google Pay</span>
                    </a>

                    <a
                      href={upiIntentUri}
                      className="p-3.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>PhonePe</span>
                    </a>

                    <a
                      href={upiIntentUri}
                      className="p-3.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Paytm</span>
                    </a>

                    <a
                      href={upiIntentUri}
                      className="p-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Any UPI App</span>
                    </a>
                  </div>

                  {/* Copyable UPI ID Box */}
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Or send directly to Coordinator UPI ID:
                    </span>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.08]">
                      <div>
                        <span className="text-sm font-mono font-semibold text-white block">
                          {selectedUpiId}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Lead Coordinator: Alan Albin (KMCT E-Cell)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyUpi(selectedUpiId)}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy UPI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Step 2: Submit UTR Reference Number */}
            <form onSubmit={(e) => handleUpiVerification(e, false)} className="pt-6 border-t border-purple-950/60 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  <span>Enter 12-Digit UPI Reference (UTR)</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  Required to generate verified pass
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
                  12-Digit UPI Transaction / UTR ID <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="e.g. 427189023418"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-purple-900/50 focus:border-purple-400 focus:outline-none text-white text-sm font-mono tracking-wider transition-colors"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Listed in your payment receipt under &quot;UPI Ref No&quot; or &quot;UTR&quot;.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Your UPI ID / Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. yourname@oksbi or 9876543210@paytm"
                  value={payerUpiId}
                  onChange={(e) => setPayerUpiId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-900/50 focus:border-purple-400 focus:outline-none text-white text-sm"
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
                      <span>Verifying Transaction...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm UPI Payment & Unlock Pass</span>
                    </>
                  )}
                </button>

                {/* Instant Verification Option for Testing / Fast-Track */}
                <button
                  type="button"
                  onClick={() => handleUpiVerification(undefined, true)}
                  disabled={isSubmittingUtr}
                  className="py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                  title="Organizer instant pass generation"
                >
                  Instant Test Verify
                </button>
              </div>

            </form>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 border-t border-purple-950/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Official payment routed directly to KMCT E-Cell coordinator account</span>
            </div>

          </div>
        )}

        {/* TAB 2: Cards & Razorpay Checkout */}
        {activeTab === 'card' && (
          <div className="glass-card rounded-3xl p-8 border border-purple-800/40 shadow-2xl space-y-6 backdrop-blur-xl">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Debit / Credit Card & NetBanking</h3>
              <p className="text-xs text-slate-400">
                Secure checkout for all major Indian debit/credit cards and netbanking portals.
              </p>
            </div>

            <button
              onClick={handleGatewayPayment}
              disabled={isProcessingGateway}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-950 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isProcessingGateway ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Card Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{fee} Securely with Card</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-bit encrypted checkout</span>
            </div>
          </div>
        )}

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
