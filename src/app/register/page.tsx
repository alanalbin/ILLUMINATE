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
  Loader2,
  AlertCircle,
  Building,
  CheckCircle2,
  Phone,
  LogIn,
  UserCheck,
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

  // Enforce login first: redirect unauthenticated visitors to /login
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/register');
    }
  }, [user, authLoading, router]);

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
      router.push(`/payment?registrationId=${data.registrationId}`);
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setServerError('Unable to reach the server. Please verify your internet connection.');
      setIsSubmitting(false);
    }
  };

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
        <Link
          href="/login?redirect=/register"
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-purple-900/40"
        >
          Proceed to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05030a] py-28 relative">
      
      {/* Background Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
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
            <div className="p-5 rounded-2xl bg-purple-950/30 border border-purple-900/40 text-xs text-slate-300 space-y-2">
              <p className="text-[11px] uppercase font-bold text-purple-400">Contact Person</p>
              <p className="text-white font-bold text-sm">Alan Albin</p>
              <div className="pt-1 border-t border-purple-950/60">
                <p className="text-[11px] uppercase font-bold text-purple-400">Mobile</p>
                <a href="tel:8848563266" className="text-purple-300 hover:text-purple-200 font-bold text-sm inline-flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-purple-400" />
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
