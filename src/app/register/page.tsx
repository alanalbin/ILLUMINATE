'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  Award,
  Package,
  ArrowRight,
  Loader2,
  AlertCircle,
  Building,
  CheckCircle2,
  Phone,
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

      router.push(`/payment?registrationId=${data.registrationId}`);
    } catch (err: any) {
      console.error('Registration submission error:', err);
      setServerError('Unable to reach the server. Please verify your internet connection.');
      setIsSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#07060b] py-36 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center font-mono font-bold text-xs text-white mb-4">
          IL
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-xs text-zinc-400 max-w-sm mb-6 leading-relaxed">
          Please authenticate with your Google account to access the registration desk.
        </p>
        <Link
          href="/login?redirect=/register"
          className="px-6 py-2.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-colors"
        >
          Sign In with Google
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07060b] py-28 relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded mb-4">
            <span>Pass Application</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Reserve Your Delegate Seat
          </h1>
          <p className="mt-2 text-zinc-400 text-sm leading-relaxed">
            Register for the 6-hour offline entrepreneurship masterclass at KMCT Kasaragod. Conducted in association with E-Cell, IIT Bombay.
          </p>
        </div>

        {/* 2-Column Architectural Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Form Container (7 cols) */}
          <div className="lg:col-span-7 surface-card rounded-xl p-8 sm:p-9">
            
            {serverError && (
              <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-800/40 flex items-start gap-3 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p>{serverError}</p>
              </div>
            )}

            {/* Verified Google Badge */}
            <div className="mb-6 p-3 rounded-lg bg-white/[0.02] border border-white/[0.08] flex items-center justify-between text-xs text-zinc-300">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google User'}
                    className="w-6 h-6 rounded-full border border-white/20 object-cover"
                  />
                ) : (
                  <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>
                  Verified: <strong className="text-white">{user.displayName || user.email}</strong>
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                READY
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                  Full Legal Name <span className="text-violet-400">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Aravind Menon"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border ${
                    errors.fullName ? 'border-red-500' : 'border-white/10'
                  } focus:border-violet-400 focus:outline-none text-white text-sm transition-colors`}
                />
                {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
                <p className="text-[11px] text-zinc-500 mt-1">
                  This exact name will be engraved on your official E-Cell IIT Bombay certificate.
                </p>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                    Email Address <span className="text-violet-400">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@kmct.edu.in"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border ${
                      errors.email ? 'border-red-500' : 'border-white/10'
                    } focus:border-violet-400 focus:outline-none text-white text-sm transition-colors`}
                  />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                    Mobile Number <span className="text-violet-400">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border ${
                      errors.phone ? 'border-red-500' : 'border-white/10'
                    } focus:border-violet-400 focus:outline-none text-white text-sm transition-colors`}
                  />
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Institution */}
              <div>
                <label htmlFor="institution" className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                  Host Institution <span className="text-violet-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="institution"
                    name="institution"
                    type="text"
                    required
                    value={formData.institution}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border ${
                      errors.institution ? 'border-red-500' : 'border-white/10'
                    } focus:border-violet-400 focus:outline-none text-white text-sm transition-colors pr-10`}
                  />
                  <Building className="absolute right-3 top-3 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
                {errors.institution && <p className="text-xs text-red-400 mt-1">{errors.institution}</p>}
              </div>

              {/* Course & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="course" className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                    Course / Branch <span className="text-violet-400">*</span>
                  </label>
                  <input
                    id="course"
                    name="course"
                    type="text"
                    required
                    placeholder="e.g. B.Tech Computer Science"
                    value={formData.course}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border ${
                      errors.course ? 'border-red-500' : 'border-white/10'
                    } focus:border-violet-400 focus:outline-none text-white text-sm transition-colors`}
                  />
                  {errors.course && <p className="text-xs text-red-400 mt-1">{errors.course}</p>}
                </div>

                <div>
                  <label htmlFor="yearOfStudy" className="block font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-1.5">
                    Year of Study <span className="text-violet-400">*</span>
                  </label>
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-white/10 focus:border-violet-400 focus:outline-none text-white text-sm transition-colors"
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

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    checked={formData.privacyConsent}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 rounded text-violet-600 bg-zinc-900 border-white/20 focus:ring-0"
                  />
                  <span className="text-xs text-zinc-400 leading-normal">
                    I agree to the{' '}
                    <Link href="/terms" className="text-zinc-200 underline hover:text-white">
                      Terms of Participation
                    </Link>{' '}
                    and confirm this registration data will be submitted to E-Cell IIT Bombay for official credential issuance.
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
                  className="w-full py-3.5 px-6 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Validating Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Payment — ₹699</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Specification & Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Specification Summary Table */}
            <div className="surface-card rounded-xl p-7">
              <h2 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-4 pb-3 border-b border-white/[0.08]">
                Pass Specification
              </h2>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Workshop Tariff</span>
                  <span className="font-semibold text-white">₹699</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Format</span>
                  <span className="text-zinc-200">6 Hours In-Person</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Cohort Size</span>
                  <span className="text-zinc-400 font-mono">Min. 70 Seats</span>
                </div>

                <div className="pt-3.5 border-t border-white/[0.08] flex justify-between items-baseline">
                  <span className="font-medium text-white">Total Payable</span>
                  <span className="font-mono text-2xl font-bold text-white">₹699</span>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed">
                <span className="text-violet-400 font-mono font-medium block mb-1">
                  NEC Institutional Rate Applied
                </span>
                The official E-Cell IIT Bombay discount rate is secured for KMCT students. Full masterclass, startup kit, and verified credential included.
              </div>
            </div>

            {/* Inclusions */}
            <div className="surface-card rounded-xl p-7 space-y-3">
              <h3 className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-3">
                Included Deliverables
              </h3>

              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Official Certificate from E-Cell IIT Bombay</strong> with credential verification</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <Package className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>Physical <strong>Illuminate Startup Kit & Resource Deck</strong> provided at venue</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-zinc-300">
                <Award className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>Special student discount eligibility for <strong>IIT Bombay E-Summit Passes</strong></span>
              </div>
            </div>

            {/* Coordinator Desk */}
            <div className="surface-card rounded-xl p-6 text-xs text-zinc-400 space-y-2">
              <span className="font-mono text-[10px] uppercase text-zinc-500 block">
                Local Registration Desk
              </span>
              <p className="text-white font-medium text-sm">Alan Albin</p>
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-zinc-500">Helpline</span>
                <a
                  href="tel:8848563266"
                  className="text-zinc-300 hover:text-white font-mono text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
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
