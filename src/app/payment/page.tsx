'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  CreditCard,
  Search,
  User,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Award,
  Package,
} from 'lucide-react';
import { Registration, EventConfig } from '@/types';
import { useAuth } from '@/context/AuthContext';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('registrationId');
  const { user } = useAuth();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick Registration State (used when entering /payment directly without registering first)
  const [quickFullName, setQuickFullName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickInstitution, setQuickInstitution] = useState('KMCT College of Engineering');
  const [quickCourse, setQuickCourse] = useState('Computer Science & Engineering');

  // Lookup existing registration state
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearchingLookup, setIsSearchingLookup] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [showLookupBox, setShowLookupBox] = useState(false);

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Pre-fill quick registration from authenticated user if available
  useEffect(() => {
    if (user) {
      if (user.displayName && !quickFullName) setQuickFullName(user.displayName);
      if (user.email && !quickEmail) setQuickEmail(user.email);
      if (user.phoneNumber && !quickPhone) setQuickPhone(user.phoneNumber.replace(/\D/g, '').slice(-10));
    }
  }, [user]);

  // Main data resolution effect
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        // Fetch event configuration
        const eventRes = await fetch('/api/event');
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          if (isMounted) setEventConfig(eventData.event);
        }

        // 1. Determine candidate identifier from URL, Storage, or Auth
        let targetId = registrationId?.trim();
        if (!targetId || targetId === 'undefined' || targetId === 'null') {
          targetId = undefined;
          if (typeof window !== 'undefined') {
            const stored =
              sessionStorage.getItem('illuminate_registration_id') ||
              localStorage.getItem('illuminate_last_registration_id');
            if (stored && stored !== 'undefined' && stored !== 'null') {
              targetId = stored.trim();
            }
          }
        }

        if (!targetId && user?.email) {
          targetId = user.email;
        }

        if (!targetId) {
          targetId = 'latest';
        }

        const regRes = await fetch(`/api/registrations/${encodeURIComponent(targetId)}`);
        if (regRes.ok) {
          const regData = await regRes.json();
          if (regData.registration && isMounted) {
            setRegistration(regData.registration);
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('illuminate_registration_id', regData.registration.id);
              localStorage.setItem('illuminate_last_registration_id', regData.registration.id);
            }
            if (regData.registration.paymentStatus === 'verified') {
              router.push(`/success?registrationId=${regData.registration.id}`);
              return;
            }
          }
        } else if (typeof window !== 'undefined' && isMounted) {
          const cachedStr = localStorage.getItem('illuminate_registration_cache');
          if (cachedStr) {
            try {
              const cached = JSON.parse(cachedStr);
              if (cached && (cached.id === targetId || !targetId || targetId === 'latest')) {
                setRegistration(cached);
              }
            } catch {}
          }
        }
      } catch (err: any) {
        console.warn('Payment resolution note:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [registrationId, user, router]);

  // Handle manual lookup of existing pass by Ticket ID or Email
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsSearchingLookup(true);
    setLookupError(null);

    try {
      const res = await fetch(`/api/registrations/${encodeURIComponent(lookupQuery.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.registration) {
        setLookupError('No pass found for that Ticket ID or Email. Please register below.');
        setIsSearchingLookup(false);
        return;
      }

      setRegistration(data.registration);
      setShowLookupBox(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('illuminate_registration_id', data.registration.id);
        localStorage.setItem('illuminate_last_registration_id', data.registration.id);
      }

      if (data.registration.paymentStatus === 'verified') {
        router.push(`/success?registrationId=${data.registration.id}`);
      }
    } catch {
      setLookupError('Network error while searching. Please try again.');
    } finally {
      setIsSearchingLookup(false);
    }
  };

  const fee = eventConfig?.registrationFee || 699;
  const feePaise = Math.round(fee * 100);

  // Razorpay Checkout Trigger
  const handleRazorpayPayment = async () => {
    setPaymentError(null);
    setIsProcessing(true);

    try {
      let activeReg = registration;

      // If user came directly to /payment without registration, create registration on the fly
      if (!activeReg) {
        if (!quickFullName.trim()) {
          setPaymentError('Please enter your full name above.');
          setIsProcessing(false);
          return;
        }
        if (!quickEmail.trim() || !quickEmail.includes('@')) {
          setPaymentError('Please enter a valid email address above.');
          setIsProcessing(false);
          return;
        }
        const cleanedPhone = quickPhone.replace(/\D/g, '');
        if (cleanedPhone.length < 10) {
          setPaymentError('Please enter a valid 10-digit mobile number above.');
          setIsProcessing(false);
          return;
        }

        const regRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: quickFullName.trim(),
            email: quickEmail.trim().toLowerCase(),
            phone: cleanedPhone.slice(-10),
            institution: quickInstitution.trim() || 'KMCT College of Engineering',
            course: quickCourse.trim() || 'Engineering & Technology',
            yearOfStudy: '3rd Year',
            privacyConsent: true,
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok || !regData.success) {
          setPaymentError(regData.message || 'Failed to initialize registration.');
          setIsProcessing(false);
          return;
        }

        const getRes = await fetch(`/api/registrations/${regData.registrationId}`);
        const getData = await getRes.json();
        activeReg = getData.registration;
        setRegistration(activeReg);
        if (typeof window !== 'undefined' && activeReg) {
          sessionStorage.setItem('illuminate_registration_id', activeReg.id);
          localStorage.setItem('illuminate_last_registration_id', activeReg.id);
        }
      }

      if (!activeReg) {
        setPaymentError('Unable to identify registration. Please refresh and try again.');
        setIsProcessing(false);
        return;
      }

      // 1. Call Backend Order Creation Endpoint: POST /api/create-order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: activeReg.id,
          amount: feePaise,
          currency: 'INR',
          receipt: activeReg.registrationNumber,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.order_id) {
        setPaymentError(orderData.message || 'Failed to initialize Razorpay order. Please try again.');
        setIsProcessing(false);
        return;
      }

      // 2. Ensure Razorpay client checkout script is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
        });
      }

      const keyId =
        orderData.key_id ||
        orderData.keyId ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        'rzp_test_TjLZ2jdgj33ttd';

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'ILLUMINATE KMCT',
        description: '6-Hour Workshop Pass & IIT Bombay Certificate',
        image: '/logo-icon.png',
        order_id: orderData.order_id,
        prefill: {
          name: activeReg.fullName,
          email: activeReg.email,
          contact: activeReg.phone,
        },
        notes: {
          registrationId: activeReg.id,
          registrationNumber: activeReg.registrationNumber,
        },
        theme: {
          color: '#7c3aed',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setIsProcessing(true);
          try {
            // 4. Send all three parameters to Backend Signature Verification: POST /api/verify-payment
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                registrationId: activeReg?.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              if (typeof window !== 'undefined' && activeReg) {
                const confirmed = {
                  ...activeReg,
                  paymentStatus: 'verified',
                  status: 'confirmed',
                  amountPaid: fee,
                  paymentId: response.razorpay_payment_id,
                };
                localStorage.setItem('illuminate_registration_cache', JSON.stringify(confirmed));
              }
              // Redirect to ticket page where the pass is unlocked
              router.push(`/success?registrationId=${activeReg?.id}`);
            } else {
              setPaymentError(verifyData.message || 'Payment signature verification failed. Please contact support.');
              setIsProcessing(false);
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            setPaymentError('Network error while verifying payment. Please refresh or contact support.');
            setIsProcessing(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        setPaymentError(
          response?.error?.description || 'Payment was unsuccessful or cancelled by user.'
        );
      });

      rzp.open();
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setPaymentError(err.message || 'Error launching Razorpay checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05030a] flex flex-col items-center justify-center p-6 text-slate-300">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
        <p className="text-sm font-medium">Securing Razorpay payment session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05030a] py-28 relative">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        {/* Navigation / Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/register');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-purple-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer group shadow-sm backdrop-blur-md active:scale-95"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-purple-300 transition-colors flex items-center gap-1.5"
          >
            <span>Event Home</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs font-bold text-purple-300 uppercase tracking-widest mb-3 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-purple-400" />
            <span>Razorpay Standard Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Complete Registration Payment
          </h1>
          <p className="mt-2 text-slate-300 text-sm">
            Securely pay ₹{fee} with Razorpay to activate your confirmed registration pass and official E-Cell IIT Bombay certificate.
          </p>
        </div>

        {/* Payment Error Alert */}
        {paymentError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-800/50 text-xs text-red-200 flex items-center gap-3 animate-shake shadow-lg">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="flex-1">{paymentError}</span>
          </div>
        )}

        {/* Candidate Details Card */}
        {registration ? (
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-purple-800/40 mb-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold text-purple-400 tracking-wider">
                    Candidate Pass
                  </span>
                  <span className="text-[11px] font-mono font-bold text-purple-300 bg-purple-950/80 border border-purple-800/50 px-2.5 py-0.5 rounded-full">
                    {registration.registrationNumber}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">{registration.fullName}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {registration.email} • +91 {registration.phone}
                </p>
                <p className="text-xs text-purple-300/80 mt-0.5">
                  {registration.course} • {registration.institution}
                </p>
              </div>

              <div className="text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-purple-950/60">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Pass Fee</span>
                <p className="text-3xl font-black text-gradient-vibrant">₹{fee}</p>
                <span className="text-[10px] text-amber-400 font-medium">Payment Required</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-purple-800/40 mb-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Participant Details</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Provide your details to register and proceed to Razorpay payment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLookupBox(!showLookupBox)}
                className="text-xs text-purple-300 hover:text-white flex items-center gap-1.5 underline decoration-purple-500/50 cursor-pointer self-start sm:self-auto"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{showLookupBox ? 'Hide lookup' : 'Already registered? Search your pass'}</span>
              </button>
            </div>

            {/* Quick Lookup Bar */}
            {showLookupBox && (
              <form onSubmit={handleLookup} className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">
                  Search by Ticket ID (ILM-KMCT-...) or Email:
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. ILM-KMCT-... or your@email.com"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-800/50 text-white text-xs font-mono focus:border-purple-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingLookup}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSearchingLookup ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Find Pass</span>
                  </button>
                </div>
                {lookupError && (
                  <p className="text-[11px] text-red-300">{lookupError}</p>
                )}
              </form>
            )}

            {/* Quick Participant Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={quickFullName}
                  onChange={(e) => setQuickFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-900/50 text-white text-xs focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address <span className="text-purple-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-900/50 text-white text-xs focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Mobile Number <span className="text-purple-400">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-900/50 text-white text-xs font-mono focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  College / Institution
                </label>
                <input
                  type="text"
                  placeholder="KMCT College of Engineering"
                  value={quickInstitution}
                  onChange={(e) => setQuickInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-purple-900/50 text-white text-xs focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Razorpay Checkout Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-9 border border-purple-700/50 shadow-2xl space-y-6 backdrop-blur-xl relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-5">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300 font-bold block">
                Payment Method
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mt-0.5">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <span>Razorpay Standard Web Checkout</span>
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>PCI-DSS Secured</span>
            </div>
          </div>

          {/* Supported Rails Showcase */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] space-y-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 block font-semibold">
              Supported Payment Modes in Razorpay Modal:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-zinc-300">
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>All UPI Apps</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Debit / Credit Cards</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Net Banking (50+)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                <span>Wallets & Cred</span>
              </div>
            </div>
          </div>

          {/* Included Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Official E-Cell IIT Bombay Certificate</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Physical Startup Kit at Venue</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleRazorpayPayment}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-base uppercase tracking-wider shadow-2xl shadow-purple-950/80 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2.5 group hover:scale-[1.01] active:scale-[0.99] hover:shadow-[0_0_30px_rgba(147,51,234,0.4)]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing Razorpay Checkout...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{fee} with Razorpay</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          {/* Trust Guarantees */}
          <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between text-xs text-zinc-400 gap-3">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-Bit SSL Encrypted • Direct Bank Rails</span>
            </div>
            <span className="text-[11px] text-zinc-500">
              Ticket pass is issued immediately upon payment completion
            </span>
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
        <div className="min-h-screen bg-[#05030a] flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
