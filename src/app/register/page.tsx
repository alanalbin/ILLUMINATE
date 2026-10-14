'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Package,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building,
  CheckCircle2,
  Phone,
  LogIn,
  UserCheck,
  Lock,
  Mail,
  Ticket,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod',
    course: '',
    yearOfStudy: '3rd Year',
    privacyConsent: false,
  });

  const [isClosed, setIsClosed] = useState<boolean | null>(null);

  // Check if registrations are closed
  useEffect(() => {
    async function checkEventStatus() {
      try {
        const res = await fetch('/api/event');
        if (res.ok) {
          const data = await res.json();
          if (data?.event) {
            const closed =
              Boolean(data.event.registrationsClosed) ||
              (Boolean(data.event.registrationClosingDate) &&
                new Date(data.event.registrationClosingDate).getTime() <= Date.now());
            setIsClosed(closed);
          }
        }
      } catch (err) {
        console.error('Failed to check event status:', err);
      }
    }
    checkEventStatus();
  }, []);

  // Enforce login first only if registrations are still open
  useEffect(() => {
    if (!authLoading && !user && isClosed === false) {
      router.push('/login?redirect=/register');
    }
  }, [user, authLoading, router, isClosed]);

  // Pre-fill form details if user is signed in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.displayName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || (user.phoneNumber ? user.phoneNumber.replace('+91', '') : ''),
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Basic frontend checks before sending
    const validationErrors: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      validationErrors.fullName = 'Please enter your full name (minimum 2 characters).';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      validationErrors.email = 'Please provide a valid email address.';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      validationErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (!formData.course.trim()) {
      validationErrors.course = 'Please enter your department / course.';
    }
    if (!formData.privacyConsent) {
      validationErrors.privacyConsent = 'You must accept the terms and privacy policy to proceed.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyRegistered && data.isPaid) {
          router.push(`/success?registrationId=${data.registrationId}`);
          return;
        }
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.errors).forEach(([key, val]: [string, any]) => {
            fieldErrors[key] = Array.isArray(val) ? val[0] : String(val);
          });
          setErrors(fieldErrors);
        }
        setServerError(data.message || 'Registration failed. Please check your inputs.');
        setIsSubmitting(false);
        return;
      }

      // Success or existing pending registration -> proceed to payment page
      if (typeof window !== 'undefined' && data.registrationId) {
        sessionStorage.setItem('illuminate_registration_id', data.registrationId);
        localStorage.setItem('illuminate_last_registration_id', data.registrationId);
        if (data.registration) {
          localStorage.setItem('illuminate_registration_cache', JSON.stringify(data.registration));
        } else {
          localStorage.setItem(
            'illuminate_registration_cache',
            JSON.stringify({
              id: data.registrationId,
              registrationNumber: '',
              ...formData,
              status: 'pending',
              paymentStatus: 'unpaid',
              amountPaid: 699,
              amountPaise: 69900,
            })
          );
        }
      }
      router.push(`/payment?registrationId=${data.registrationId}`);
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setServerError('Unable to reach the server. Please verify your internet connection.');
      setIsSubmitting(false);
    }
  };

  if (isClosed) {
    return (
      <div className="min-h-screen bg-[#05030a] py-32 flex flex-col items-center justify-center px-6 relative">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-xl w-full mx-auto relative z-10 text-center">
          <div className="rounded-3xl bg-white/[0.02] border border-white/[0.08] p-8 sm:p-12 backdrop-blur-2xl shadow-2xl shadow-purple-950/50 relative overflow-hidden">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Registrations Closed</span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-950/40">
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Registrations Are Now Closed
            </h1>

            <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
              Thank you for the overwhelming interest! The registration period for the 6-hour offline{' '}
              <strong className="text-white">ILLUMINATE Workshop</strong> by E-Cell, IIT Bombay at KMCT College has officially concluded.
            </p>

            <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left">
              <h3 className="text-xs uppercase font-mono tracking-wider text-purple-400 font-bold mb-1.5 flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span>Already Registered & Paid?</span>
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                If you have previously completed your registration and payment, your entry pass and seat reservation remain confirmed.
              </p>
              <div className="mt-3">
                <Link
                  href="/success"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all"
                >
                  <span>Access / Lookup Your Ticket Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Coordinator Contact Card */}
            <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-left">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                Coordinator & Support
              </p>
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-white">Alan Albin</p>
                  <p className="text-zinc-400 text-[11px]">Lead Coordinator, KMCT E-Cell</p>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href="tel:8848563266"
                    className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-purple-400" />
                    <span>+91 8848563266</span>
                  </a>
                  <a
                    href="mailto:alan.albin@kmct.edu.in"
                    className="inline-flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    <span>alan.albin@kmct.edu.in</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-zinc-200 hover:text-white transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-purple-400" />
                <span>Return to Homepage</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#05030a] py-36 flex flex-col items-center justify-center px-6 text-center">
        <div className="flex justify-center mb-4">
          <img src="/logo-icon.png" alt="ILLUMINATE" className="h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign In Required to Register</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Please sign in with your mobile OTP or Google account to reserve your workshop seat.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-purple-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer group shadow-sm backdrop-blur-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/login?redirect=/register"
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-purple-900/40"
          >
            Proceed to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05030a] py-28 relative">
      
      {/* Background Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Navigation / Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
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
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-800/40 text-xs font-semibold text-purple-300 uppercase tracking-widest mb-3">
            <img src="/logo-icon.png" alt="" className="w-3.5 h-3.5 object-contain" />
            <span>Participant Registration</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Reserve Your Workshop Seat
          </h1>
          <p className="mt-3 text-slate-300 text-sm">
            Join the 6-hour offline entrepreneurship workshop at KMCT Kasaragod. An initiative of E-Cell, IIT Bombay.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Registration Form */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-8 border border-purple-900/40 shadow-2xl">
            
            {serverError && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-sm text-red-200">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p>{serverError}</p>
              </div>
            )}

            {/* Auth Sign-in Banner / Verified Pill */}
            {user ? (
              <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200 shadow-md">
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-7 h-7 rounded-full border border-emerald-400/50 object-cover"
                    />
                  ) : (
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span>
                    Google Verified: <strong>{user.displayName || user.email}</strong> (Pre-filled below)
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Ready
                </span>
              </div>
            ) : (
              <div className="mb-6 p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between text-xs text-purple-200">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Sign in with Google to pre-fill your pass details</span>
                </div>
                <Link
                  href="/login?redirect=/register"
                  className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-purple-400">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Aravind Menon"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-[#0e071c] border ${
                    errors.fullName ? 'border-red-500' : 'border-purple-900/50'
                  } focus:border-purple-400 focus:outline-none text-white text-sm transition-colors`}
                />
                {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-purple-400">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@kmct.edu.in"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#0e071c] border ${
                      errors.email ? 'border-red-500' : 'border-purple-900/50'
                    } focus:border-purple-400 focus:outline-none text-white text-sm transition-colors`}
                  />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Mobile Number <span className="text-purple-400">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#0e071c] border ${
                      errors.phone ? 'border-red-500' : 'border-purple-900/50'
                    } focus:border-purple-400 focus:outline-none text-white text-sm transition-colors`}
                  />
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Institution */}
              <div>
                <label htmlFor="institution" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Institution / College <span className="text-purple-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="institution"
                    name="institution"
                    type="text"
                    required
                    value={formData.institution}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#0e071c] border ${
                      errors.institution ? 'border-red-500' : 'border-purple-900/50'
                    } focus:border-purple-400 focus:outline-none text-white text-sm transition-colors`}
                  />
                  <Building className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
                {errors.institution && <p className="text-xs text-red-400 mt-1">{errors.institution}</p>}
              </div>

              {/* Course & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="course" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Course / Branch <span className="text-purple-400">*</span>
                  </label>
                  <input
                    id="course"
                    name="course"
                    type="text"
                    required
                    placeholder="e.g. B.Tech Computer Science"
                    value={formData.course}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#0e071c] border ${
                      errors.course ? 'border-red-500' : 'border-purple-900/50'
                    } focus:border-purple-400 focus:outline-none text-white text-sm transition-colors`}
                  />
                  {errors.course && <p className="text-xs text-red-400 mt-1">{errors.course}</p>}
                </div>

                <div>
                  <label htmlFor="yearOfStudy" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Year of Study <span className="text-purple-400">*</span>
                  </label>
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#0e071c] border border-purple-900/50 focus:border-purple-400 focus:outline-none text-white text-sm transition-colors"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Faculty / Other">Faculty / Other</option>
                  </select>
                </div>
              </div>

              {/* Privacy Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    checked={formData.privacyConsent}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded text-purple-600 bg-[#0e071c] border-purple-800 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-300 leading-normal">
                    I agree to the{' '}
                    <Link href="/terms" className="text-purple-400 underline hover:text-purple-300">
                      Terms of Participation
                    </Link>{' '}
                    and acknowledge that data collected will be used for official E-Cell IIT Bombay certificate issuance and event logistics.
                  </span>
                </label>
                {errors.privacyConsent && (
                  <p className="text-xs text-red-400 mt-1">{errors.privacyConsent}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-purple-950 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating & Creating Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Payment (₹699)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Order Summary & Takeaways */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Pass Summary Card */}
            <div className="glass-card rounded-2xl p-7 border border-purple-900/40">
              <h2 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-purple-950/60 pb-3">
                Registration Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Workshop Pass</span>
                  <span className="font-bold text-white">₹699</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Duration</span>
                  <span className="text-purple-300 font-medium">6 Hours Offline</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Target Cohort</span>
                  <span className="text-slate-400">Min. 70 Participants</span>
                </div>

                <div className="pt-3 border-t border-purple-950/60 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-white">Total Amount</span>
                  <span className="text-2xl font-black text-gradient-vibrant">₹699</span>
                </div>
              </div>

              {/* Verified note */}
              <div className="mt-5 p-3 rounded-xl bg-purple-950/40 border border-purple-800/30 text-xs text-purple-200 leading-relaxed">
                <p className="font-semibold text-purple-300 mb-0.5">Official Fee Confirmed:</p>
                The official E-Cell IIT Bombay NEC discount rate of ₹699/- is applied. Includes full 6-hour masterclass, certificate, and startup kit.
              </div>
            </div>

            {/* Guaranteed Deliverables */}
            <div className="glass-card rounded-2xl p-7 border border-purple-900/40 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                What You Receive
              </h3>

              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Official Certificate from E-Cell IIT Bombay</strong> upon completion</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-300">
                <Package className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Physical <strong>Illuminate Startup Kit</strong> provided at venue</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-300">
                <Award className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Special discount eligibility for <strong>E-Summit passes & accommodation</strong></span>
              </div>
            </div>

            {/* Registration Contact Box */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs text-zinc-300 space-y-2">
              <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Contact Person</p>
              <p className="text-white font-medium text-sm">Alan Albin</p>
              <div className="pt-2 border-t border-white/[0.08]">
                <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Mobile</p>
                <a href="tel:8848563266" className="text-zinc-300 hover:text-white font-mono text-xs inline-flex items-center gap-1.5 mt-0.5 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-zinc-400" />
                  <span>8848563266</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
