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
  FileSpreadsheet,
  Search,
  User,
  Mail,
  Phone,
  School,
  Sparkles,
  ArrowRight,
  ArrowLeft,
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
  const [serverNotice, setServerNotice] = useState<string | null>(null);

  // Quick Registration State (used when entering /payment without prior registration)
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

  // UPI and UTR state
  const [utrNumber, setUtrNumber] = useState('');
  const [payerUpiId, setPayerUpiId] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [utrError, setUtrError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Official UPI payment target for Alan Albin
  const coordinatorUpiId = 'alanalbin06112005@okicici';
  const coordinatorName = 'Alan Albin';

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

        // Fallback: check logged in Google user email
        if (!targetId && user?.email) {
          targetId = user.email;
        }

        // Fallback: check latest registration
        if (!targetId) {
          targetId = 'latest';
        }

        // Attempt fetch
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
          // Fallback to locally cached registration from previous step
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
        console.warn('Auto-registration resolution note:', err.message);
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
        setLookupError('No pass found for that Ticket ID or Email. You can enter details below to generate a new pass.');
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
    setUtrError(null);

    const refCode = isInstantPass ? `UPI-${Date.now().toString(36).toUpperCase()}` : utrNumber.trim();

    if (!isInstantPass && refCode.length < 6) {
      setUtrError('Please enter your 12-digit UPI transaction reference (UTR) number from your payment receipt.');
      return;
    }

    setIsSubmittingUtr(true);

    try {
      let activeReg = registration;

      // If candidate has not registered yet, create registration on the fly!
      if (!activeReg) {
        if (!quickFullName.trim()) {
          setUtrError('Please enter your full name above.');
          setIsSubmittingUtr(false);
          return;
        }
        if (!quickEmail.trim() || !quickEmail.includes('@')) {
          setUtrError('Please enter a valid email address above.');
          setIsSubmittingUtr(false);
          return;
        }
        const cleanedPhone = quickPhone.replace(/\D/g, '');
        if (cleanedPhone.length < 10) {
          setUtrError('Please enter a valid 10-digit mobile number above.');
          setIsSubmittingUtr(false);
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
          setUtrError(regData.message || 'Failed to initialize registration.');
          setIsSubmittingUtr(false);
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
        setUtrError('Could not link registration. Please try again.');
        setIsSubmittingUtr(false);
        return;
      }

      // Submit UPI UTR with full candidate context for self-healing across serverless instances
      const res = await fetch('/api/payment/manual-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: activeReg.id,
          ticketId: activeReg.registrationNumber,
          email: activeReg.email,
          phone: activeReg.phone,
          fullName: activeReg.fullName,
          institution: activeReg.institution,
          course: activeReg.course,
          yearOfStudy: activeReg.yearOfStudy,
          amountPaise: activeReg.amountPaise || 69900,
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

      // Success: update client storage cache and redirect to verified pass
      const targetPassId = data.registrationId || activeReg.id;
      if (typeof window !== 'undefined') {
        const verifiedRecord = {
          ...activeReg,
          id: targetPassId,
          paymentStatus: 'verified',
          manualUtr: refCode,
          ...(data.registration || {}),
        };
        localStorage.setItem('illuminate_registration_cache', JSON.stringify(verifiedRecord));
        sessionStorage.setItem('illuminate_registration_id', targetPassId);
        localStorage.setItem('illuminate_last_registration_id', targetPassId);
      }

      router.push(`/success?registrationId=${targetPassId}`);
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
        <p className="text-sm font-medium">Securing UPI payment session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05030a] py-28 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
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
            <QrCode className="w-3.5 h-3.5 text-purple-400" />
            <span>Scan QR & Unlock Pass</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            UPI QR Payment
          </h1>
          <p className="mt-2 text-slate-300 text-sm">
            Scan the official Google Pay QR code below or tap your preferred UPI app to pay ₹{fee}, then enter your transaction UTR number to instantly receive your verified pass.
          </p>
        </div>

        {/* Existing Passholder Overview OR Quick Participant Registration Card */}
        {registration ? (
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
        ) : (
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-purple-800/40 mb-8 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-900/40 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span>Enter Participant Details for Ticket ID</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Provide your name and contact details to generate your pass upon UPI payment.
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

        {/* MAIN PAYMENT WORKFLOW: EXCLUSIVELY QR & UTR */}
        <div className="glass-card rounded-3xl p-6 sm:p-9 border border-purple-800/40 shadow-2xl space-y-8 backdrop-blur-xl">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: THE OFFICIAL PAYMENT QR IMAGE WITH CYBERNETIC SCANNER ANIMATIONS */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-4">
              <div className="relative w-full">
                {/* Ambient breathing neon pulse behind the QR card */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-emerald-500 to-indigo-600 rounded-3xl blur-xl opacity-40 animate-glow-pulse pointer-events-none" />

                <div className="relative w-full p-5 rounded-3xl bg-[#0b0619]/95 border border-purple-700/50 shadow-2xl flex flex-col items-center backdrop-blur-xl">
                  {/* Status header with live pulsing radar dot */}
                  <div className="flex items-center justify-between w-full mb-3 px-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-purple-400" />
                      Official UPI QR
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-semibold text-emerald-300">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span>Scan Active</span>
                    </div>
                  </div>

                  {/* High-Tech Animated QR Scanner Frame with Floating Physics */}
                  <div className="relative w-full max-w-[270px] sm:max-w-[290px] rounded-2xl p-2.5 bg-white shadow-2xl border border-white/20 transition-all duration-300 group animate-float-gentle">
                    
                    {/* Viewfinder Target Reticle Corners */}
                    <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-emerald-500 rounded-tl z-20 animate-corner-pulse pointer-events-none" />
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-emerald-500 rounded-tr z-20 animate-corner-pulse pointer-events-none" />
                    <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-emerald-500 rounded-bl z-20 animate-corner-pulse pointer-events-none" />
                    <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-emerald-500 rounded-br z-20 animate-corner-pulse pointer-events-none" />

                    {/* Holographic Laser Scanner Line */}
                    <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399,0_0_24px_#10b981] animate-qr-scan pointer-events-none z-20" />

                    {/* New Uploaded Square QR Image */}
                    <div className="relative overflow-hidden rounded-xl bg-white p-1">
                      <img
                        src="/payment-qr.png"
                        alt="Official UPI Payment QR Code"
                        className="w-full h-auto object-contain rounded-lg block transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </div>
                  </div>

                  <div className="mt-3.5 text-center">
                    <p className="text-xs font-bold text-white tracking-wide">
                      Scan with any UPI App
                    </p>
                    <p className="text-[11px] text-purple-300/80 mt-0.5">
                      Google Pay • PhonePe • Paytm • BHIM • Cred
                    </p>
                  </div>
                </div>
              </div>

              {/* Coordinator UPI ID with 1-Click Copy */}
              <div className="w-full p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left hover:border-purple-500/30 transition-colors">
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
                    className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/30 text-xs font-mono flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
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
                    className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.03] hover:shadow-blue-900/40 active:scale-[0.97]"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Google Pay</span>
                  </a>

                  <a
                    href={upiIntentUri}
                    className="p-3 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.03] hover:shadow-purple-900/40 active:scale-[0.97]"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>PhonePe</span>
                  </a>

                  <a
                    href={upiIntentUri}
                    className="p-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.03] hover:shadow-sky-900/40 active:scale-[0.97]"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Paytm</span>
                  </a>

                  <a
                    href={upiIntentUri}
                    className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-[1.03] hover:shadow-fuchsia-900/40 active:scale-[0.97]"
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
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.5)]">✓</span>
                    <span>Enter Transfer UTR / UPI Reference</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Step 2 of 2
                  </span>
                </div>

                {utrError && (
                  <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/40 text-xs text-red-200 flex items-center gap-2 animate-shake">
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
                    className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-purple-900/50 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 focus:shadow-[0_0_20px_rgba(16,185,129,0.25)] focus:outline-none text-white text-base font-mono tracking-wider transition-all placeholder:text-zinc-600"
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
                    className="w-full px-4 py-3 rounded-xl bg-black/60 border border-purple-900/50 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 focus:outline-none text-white text-sm placeholder:text-zinc-600 transition-all"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingUtr}
                    className="relative overflow-hidden flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-emerald-950/80 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 group hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]"
                  >
                    {/* Continuous Shimmer Light Beam */}
                    <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />

                    {isSubmittingUtr ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                        <span className="relative z-10">Verifying & Syncing to GSheet...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
                        <span className="relative z-10">Submit UTR & Claim Pass</span>
                      </>
                    )}
                  </button>

                  {/* Organizer Instant Test Verify Button */}
                  <button
                    type="button"
                    onClick={() => handleUpiVerification(undefined, true)}
                    disabled={isSubmittingUtr}
                    className="py-4 px-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer text-center shrink-0"
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
