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

  // Manual UPI form state
  const [activeTab, setActiveTab] = useState<'gateway' | 'manual'>('gateway');
  const [utrNumber, setUtrNumber] = useState('');
  const [payerUpiId, setPayerUpiId] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Gateway processing state
  const [isProcessingGateway, setIsProcessingGateway] = useState(false);

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

  const handleCopyUpi = () => {
    if (!eventConfig) return;
    navigator.clipboard.writeText(eventConfig.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // 1. Handle Gateway / Sandbox Payment
  const handleGatewayPayment = async () => {
    if (!registration || !eventConfig) return;
    setIsProcessingGateway(true);
    setServerError(null);

    try {
      // Step 1: Create Order on server
      const orderRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: registration.id }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || 'Failed to initialize payment order');
      }

      // If Razorpay script is available & live keys configured
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
          theme: {
            color: '#9333ea',
          },
          handler: async function (response: any) {
            // Step 2: Verify on server
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
              setServerError(verifyData.message || 'Signature verification failed.');
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
        // Test Sandbox / Development Simulation:
        // Automatically simulates payment verification through server route
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
          setServerError(verifyData.message || 'Test payment verification failed.');
          setIsProcessingGateway(false);
        }
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setServerError(err.message || 'An error occurred during payment processing.');
      setIsProcessingGateway(false);
    }
  };

  // 2. Handle Manual UPI UTR Submission
  const handleManualUpiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;
    setUtrError(null);

    const cleanUtr = utrNumber.trim();
    if (cleanUtr.length < 6) {
      setUtrError('Please enter a valid 12-digit UPI reference (UTR) number.');
      return;
    }

    setIsSubmittingUtr(true);

    try {
      const res = await fetch('/api/payment/manual-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: registration.id,
          utrNumber: cleanUtr,
          payerUpiId: payerUpiId.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setUtrError(data.message || 'Failed to submit transaction reference.');
        setIsSubmittingUtr(false);
        return;
      }

      router.push(`/success?registrationId=${registration.id}`);
    } catch (err: any) {
      console.error('Manual UPI error:', err);
      setUtrError('Network error while recording UTR. Please try again.');
      setIsSubmittingUtr(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05030a] flex flex-col items-center justify-center p-6 text-slate-300">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
        <p className="text-sm font-medium">Securing payment gateway session...</p>
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

  const fee = eventConfig?.registrationFee || 700;

  return (
    <div className="min-h-screen bg-[#05030a] py-28 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs font-semibold text-purple-300 uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Step 2: Confirm Workshop Pass</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Complete Workshop Payment
          </h1>
          <p className="mt-2 text-slate-300 text-sm">
            Pass registered for <strong>{registration.fullName}</strong> ({registration.registrationNumber})
          </p>
        </div>

        {/* Pricing & Status Overview Card */}
        <div className="glass-card rounded-2xl p-6 border border-purple-900/40 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <span className="text-xs uppercase font-semibold text-purple-400 tracking-wider">Pass Holder</span>
            <h3 className="text-lg font-bold text-white mt-0.5">{registration.fullName}</h3>
            <p className="text-xs text-slate-400">{registration.course} • {registration.institution}</p>
          </div>

          <div className="flex items-center gap-6 text-right sm:text-right w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0 border-purple-950/60">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider">Fee Payable</span>
              <p className="text-3xl font-black text-gradient-vibrant">₹{fee}</p>
            </div>
            <div className="px-3 py-1 rounded-full bg-amber-950/60 border border-amber-800/50 text-amber-300 text-xs font-semibold">
              {registration.paymentStatus === 'manual_review' ? 'Awaiting Verification' : 'Payment Pending'}
            </div>
          </div>
        </div>

        {/* Payment Tabs: Gateway vs Direct UPI */}
        <div className="flex border-b border-purple-950/60 mb-8">
          <button
            onClick={() => setActiveTab('gateway')}
            className={`pb-4 px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'gateway'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Instant Checkout / UPI Gateway</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-4 px-6 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'manual'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Direct UPI Transfer / QR Code</span>
          </button>
        </div>

        {/* TAB 1: Instant Gateway / Test Sandbox Checkout */}
        {activeTab === 'gateway' && (
          <div className="glass-card rounded-2xl p-8 border border-purple-900/40 shadow-2xl space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Razorpay Checkout</h3>
              <p className="text-xs text-slate-400">
                Supports UPI apps (Google Pay, PhonePe, Paytm, BHIM), Debit/Credit Cards, and NetBanking.
              </p>
            </div>

            {/* Test Sandbox Notice */}
            <div className="p-4 rounded-xl bg-purple-950/50 border border-purple-800/40 flex items-start gap-3 text-xs text-purple-200">
              <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-300">Sandbox Environment Mode:</p>
                <p className="text-slate-300 mt-0.5 leading-relaxed">
                  Live merchant gateway is kept disabled until the fee and merchant account are verified by the KMCT / E-Cell coordinator. Clicking the button below simulates an end-to-end verified server order, signature check, and generates your confirmed digital pass.
                </p>
              </div>
            </div>

            <button
              onClick={handleGatewayPayment}
              disabled={isProcessingGateway}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-950 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessingGateway ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Verified Payment...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{fee} Securely</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-bit encrypted • Idempotent server verification</span>
            </div>
          </div>
        )}

        {/* TAB 2: Direct UPI QR & Reference Submission */}
        {activeTab === 'manual' && (
          <div className="glass-card rounded-2xl p-8 border border-purple-900/40 shadow-2xl space-y-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Direct UPI Transfer</h3>
              <p className="text-xs text-slate-400">
                Transfer ₹{fee} directly to the official E-Cell UPI ID and submit your 12-digit transaction reference (UTR) for coordinator verification.
              </p>
            </div>

            {/* UPI ID Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="p-5 rounded-xl bg-[#0e071c] border border-purple-900/50 space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Official Coordinator UPI ID
                </span>
                <div className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-purple-800/40">
                  <span className="text-sm font-mono font-bold text-purple-300">
                    {eventConfig?.upiId || 'rachit@ecell.in'}
                  </span>
                  <button
                    onClick={handleCopyUpi}
                    className="p-1.5 rounded hover:bg-purple-900/40 text-slate-400 hover:text-white transition-colors"
                    title="Copy UPI ID"
                  >
                    {copiedUpi ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Beneficiary: <strong>{eventConfig?.upiMerchantName || 'E-Cell IIT Bombay (Rachit Kumar)'}</strong>
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#0e071c] border border-purple-900/50 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-28 h-28 bg-white p-2 rounded-xl flex items-center justify-center">
                  {/* Clean SVG QR Code Representation */}
                  <svg className="w-full h-full text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h4v4h-4v-4zm-4-4h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-6 4h2v4h-2v-4zm4 2h2v2h-2v-2z" />
                  </svg>
                </div>
                <span className="text-[11px] text-purple-300 font-medium">Scan with any UPI App</span>
              </div>
            </div>

            {/* UTR Submission Form */}
            <form onSubmit={handleManualUpiSubmit} className="space-y-4 pt-4 border-t border-purple-950/60">
              <h4 className="text-sm font-bold text-white">Submit Transaction Reference</h4>

              {utrError && (
                <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/40 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{utrError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  12-Digit UTR / Transaction Reference Number <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 429019283741"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0e071c] border border-purple-900/50 focus:border-purple-400 focus:outline-none text-white text-sm"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Found in your GPay / PhonePe / Paytm transaction receipt under &quot;UPI Ref No.&quot;
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Your UPI ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="yourname@okaxis"
                  value={payerUpiId}
                  onChange={(e) => setPayerUpiId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#0e071c] border border-purple-900/50 focus:border-purple-400 focus:outline-none text-white text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingUtr}
                className="w-full py-3.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingUtr ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting UTR...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Reference for Review</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
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
        <div className="min-h-screen bg-[#05030a] flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
