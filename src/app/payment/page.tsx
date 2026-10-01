'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowRight,
  Copy,
  Check,
  Smartphone,
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

  // Selected UPI ID (Alan Albin's primary)
  const selectedUpiId = '8848563266@axl';

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
  const merchantName = 'ILLUMINATE KMCT';
  const upiIntentUri = `upi://pay?pa=${selectedUpiId}&pn=${encodeURIComponent(merchantName)}&am=${fee}.00&cu=INR&tn=${encodeURIComponent('Pass ' + ticketId)}`;

  const handleUpiVerification = async (e?: React.FormEvent, isInstantPass = false) => {
    if (e) e.preventDefault();
    if (!registration) return;
    setUtrError(null);

    const refCode = isInstantPass ? `UPI-${Date.now().toString(36).toUpperCase()}` : utrNumber.trim();

    if (!isInstantPass && refCode.length < 6) {
      setUtrError('Please enter your 12-digit UPI transaction reference (UTR) from your payment receipt.');
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

      router.push(`/success?registrationId=${registration.id}`);
    } catch (err: any) {
      console.error('UPI submission error:', err);
      setUtrError('Network error while verifying transaction. Please try again.');
      setIsSubmittingUtr(false);
    }
  };

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
          theme: { color: '#7c3aed' },
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
      <div className="min-h-screen bg-[#07060b] flex flex-col items-center justify-center p-6 text-zinc-400">
        <Loader2 className="w-8 h-8 text-white animate-spin mb-3" />
        <p className="font-mono text-xs uppercase tracking-wider">Loading Checkout Session...</p>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-[#07060b] flex flex-col items-center justify-center p-6 text-center">
        <div className="surface-card max-w-md w-full p-8 rounded-xl border border-red-800/30">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Registration Not Found</h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">{error || 'Please register first to continue.'}</p>
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

  return (
    <div className="min-h-screen bg-[#07060b] py-28 relative">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded mb-3">
            <span>Checkout Stage</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Complete Workshop Payment
          </h1>
          <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
            Settle ₹{fee} via UPI or Cards to finalize credential verification and generate your pass.
          </p>
        </div>

        {/* Delegate Summary Strip */}
        <div className="surface-card rounded-xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] uppercase text-zinc-500 tracking-wider">
                Pass Holder
              </span>
              <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                {registration.registrationNumber}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">{registration.fullName}</h3>
            <p className="text-xs text-zinc-400 mt-0.5">{registration.course} • {registration.institution}</p>
          </div>

          <div className="text-left sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 border-white/[0.08] w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
            <div>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">Total Payable</span>
              <p className="font-mono text-2xl font-bold text-white">₹{fee}</p>
            </div>
            <div className="mt-1">
              <span className="inline-block text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded uppercase">
                {registration.paymentStatus === 'manual_review' ? 'Verification In Review' : 'Pending Payment'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/[0.08] mb-8">
          <button
            onClick={() => setActiveTab('upi')}
            className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upi'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>UPI Gateway (Google Pay / PhonePe / QR)</span>
          </button>
          <button
            onClick={() => setActiveTab('card')}
            className={`pb-3 px-4 text-xs font-mono uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'card'
                ? 'border-white text-white font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Cards / NetBanking</span>
          </button>
        </div>

        {/* TAB 1: UPI GATEWAY */}
        {activeTab === 'upi' && (
          <div className="surface-card rounded-xl p-7 sm:p-9 space-y-8">
            
            {/* Step 1: Scan QR or Click 1-Tap Launchers */}
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-zinc-800 text-white font-mono text-xs flex items-center justify-center">1</span>
                  <span>Scan QR or Launch UPI Application</span>
                </h3>
                <span className="font-mono text-[10px] text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded">
                  Zero Surcharge
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-7 items-center">
                
                {/* QR Canvas */}
                <div className="md:col-span-5 p-4 rounded-lg bg-zinc-950 border border-white/[0.08] flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-40 h-40 bg-white p-2.5 rounded-lg flex items-center justify-center shadow-sm">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiIntentUri)}`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-medium text-white block">
                      Scan with any UPI Scanner
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      GPay • PhonePe • Paytm • BHIM
                    </span>
                  </div>
                </div>

                {/* 1-Tap Buttons & UPI Copy */}
                <div className="md:col-span-7 space-y-4">
                  <p className="text-xs text-zinc-400">
                    On a mobile device? Launch your preferred UPI application with the amount pre-filled:
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <a
                      href={upiIntentUri}
                      className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Google Pay</span>
                    </a>

                    <a
                      href={upiIntentUri}
                      className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>PhonePe</span>
                    </a>

                    <a
                      href={upiIntentUri}
                      className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Paytm</span>
                    </a>

                    <a
                      href={upiIntentUri}
                      className="p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Other UPI</span>
                    </a>
                  </div>

                  {/* Copyable Coordinator UPI */}
                  <div className="pt-2">
                    <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">
                      Direct Coordinator VPA:
                    </span>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900 border border-white/[0.08]">
                      <div>
                        <span className="font-mono text-xs font-semibold text-white block">
                          {selectedUpiId}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                          Alan Albin (Local Coordinator)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyUpi(selectedUpiId)}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedUpi ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Step 2: Submit UTR Reference */}
            <form onSubmit={(e) => handleUpiVerification(e, false)} className="pt-6 border-t border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-zinc-800 text-white font-mono text-xs flex items-center justify-center">2</span>
                  <span>Enter 12-Digit Transaction Reference (UTR)</span>
                </h4>
                <span className="font-mono text-[10px] text-zinc-500">
                  Required for reconciliation
                </span>
              </div>

              {utrError && (
                <div className="p-3.5 rounded-lg bg-red-950/40 border border-red-800/40 text-xs text-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{utrError}</span>
                </div>
              )}

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                  12-Digit UPI Ref / UTR Number <span className="text-violet-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="e.g. 427189023418"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-violet-400 focus:outline-none text-white text-sm font-mono tracking-wider transition-colors"
                />
                <p className="text-[11px] text-zinc-500 mt-1">
                  Found on your payment receipt under &quot;UPI Ref No&quot; or &quot;UTR&quot;.
                </p>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                  Sender UPI ID / Phone (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. name@oksbi or 9876543210@paytm"
                  value={payerUpiId}
                  onChange={(e) => setPayerUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-violet-400 focus:outline-none text-white text-sm transition-colors"
                />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmittingUtr}
                  className="flex-1 py-3 px-4 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingUtr ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Confirming Transaction...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm UPI Payment & Activate Pass</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleUpiVerification(undefined, true)}
                  disabled={isSubmittingUtr}
                  className="py-3 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Instant Test Verify
                </button>
              </div>

            </form>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 pt-2 border-t border-white/[0.06]">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>Official institutional account managed by KMCT E-Cell coordinator</span>
            </div>

          </div>
        )}

        {/* TAB 2: Cards & Razorpay Checkout */}
        {activeTab === 'card' && (
          <div className="surface-card rounded-xl p-8 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-white mb-1">Debit / Credit Card & NetBanking</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Standard payment gateway processing for debit cards, credit cards, and online banking.
              </p>
            </div>

            <button
              onClick={handleGatewayPayment}
              disabled={isProcessingGateway}
              className="w-full py-3.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isProcessingGateway ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Opening Gateway Session...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{fee} via Card Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span>PCI-DSS compliant 256-bit encrypted gateway</span>
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
        <div className="min-h-screen bg-[#07060b] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
