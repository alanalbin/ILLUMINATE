'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  Search,
  Download,
  Filter,
  Check,
  X,
  Settings,
  Activity,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Building,
  Calendar,
  Save,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';
import { Registration, EventConfig, DashboardMetrics, AuditLog } from '@/types';

export default function AdminPage() {
  // Dashboard Data State
  const [activeTab, setActiveTab] = useState<'registrations' | 'manualQueue' | 'settings' | 'audit'>('registrations');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'manual_review' | 'pending' | 'failed'>('all');

  // Event Settings Form State
  const [settingsForm, setSettingsForm] = useState<Partial<EventConfig>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Load dashboard data directly
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      const [metricsRes, regRes, auditRes] = await Promise.all([
        fetch('/api/admin/metrics'),
        fetch('/api/admin/registrations'),
        fetch('/api/admin/audit-logs'),
      ]);

      const metricsData = await metricsRes.json();
      const regData = await regRes.json();
      const auditData = await auditRes.json();

      if (metricsData.success) {
        setMetrics(metricsData.metrics);
        setEventConfig(metricsData.event);
        setSettingsForm(metricsData.event);
      }
      if (regData.success) {
        setRegistrations(regData.registrations);
      }
      if (auditData.success) {
        setAuditLogs(auditData.logs);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Status modification action
  const handleUpdateStatus = async (
    regId: string,
    newStatus: 'verified' | 'failed' | 'pending',
    adminNotes?: string
  ) => {
    try {
      const res = await fetch('/api/admin/registrations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: regId,
          paymentStatus: newStatus,
          adminNotes,
        }),
      });

      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Save Event Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const res = await fetch('/api/admin/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });

      if (res.ok) {
        setSettingsSuccess(true);
        fetchDashboardData();
        setTimeout(() => setSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Toggle Live Payments
  const handleToggleLivePayments = async () => {
    if (!eventConfig) return;
    const newStatus = !eventConfig.livePaymentsEnabled;
    try {
      const res = await fetch('/api/admin/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ livePaymentsEnabled: newStatus }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Toggle live payment error:', err);
    }
  };

  // Acknowledge Price Discrepancy
  const handleAcknowledgePrice = async () => {
    try {
      const res = await fetch('/api/admin/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceDiscrepancyAcknowledged: true }),
      });
      if (res.ok) {
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Acknowledge price error:', err);
    }
  };

  // Filter registrations
  const filteredRegistrations = registrations.filter((r) => {
    const matchesSearch =
      searchTerm === '' ||
      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      r.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.manualUtr && r.manualUtr.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || r.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const manualReviewQueue = registrations.filter((r) => r.paymentStatus === 'manual_review');

  // --- COORDINATOR DASHBOARD VIEW (NO LOGIN GATE) ---
  return (
    <div className="min-h-screen bg-[#05030a] text-slate-200 pt-20 pb-16">
      
      {/* Top Admin Bar */}
      <div className="bg-[#090514] border-b border-purple-950/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-300">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-wide">
                ILLUMINATE COORDINATOR DASHBOARD
              </h1>
              <p className="text-xs text-slate-400">
                KMCT College of Engineering, Kasaragod • E-Cell IIT Bombay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <a
              href="https://docs.google.com/spreadsheets/d/146f_VkQ6NnYNmxkTjVtBD22y5JzXRQi3zvxO3QwI5O4/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open Live Candidate Google Sheet"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Sheet</span>
            </a>

            <a
              href="https://nxtbyteksd.netlify.app/#cta"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900/80 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Visit Nxt Byte College E-Cell"
            >
              <span>Nxt Byte E-Cell</span>
              <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
            </a>

            <button
              onClick={fetchDashboardData}
              disabled={loadingData}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin text-purple-400' : ''}`} />
            </button>

            <a
              href="/api/admin/registrations?export=csv"
              className="px-4 py-2 rounded-lg bg-purple-950/80 hover:bg-purple-900/80 border border-purple-700/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Download CSV for E-Cell submission"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>

            <Link
              href="/"
              className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Return to Illuminate Website"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit to Site</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* OFFICIAL PRICE CONFIRMATION & GATEWAY SAFETY CONTROLS */}
        <div className="p-6 rounded-2xl bg-purple-950/40 border border-purple-500/40 shadow-2xl space-y-3">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-900/60 border border-purple-500/50 flex items-center justify-center shrink-0 text-purple-300 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wide">
                  Official Registration Fee: ₹{eventConfig?.registrationFee || 699}/-
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  NEC DISCOUNT CONFIRMED
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                The official workshop registration fee is configured at <strong>₹{eventConfig?.registrationFee || 699}</strong> per participant, in full alignment with the official E-Cell IIT Bombay NEC discount guidelines (valid until <strong>{eventConfig?.discountDeadline || '30 September 2026'}</strong>).
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-300">Live Gateway Payments:</span>
                  <button
                    onClick={handleToggleLivePayments}
                    className={`px-3 py-1 rounded-md font-bold text-xs transition-colors ${
                      eventConfig?.livePaymentsEnabled
                        ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                        : 'bg-red-950 border border-red-700 text-red-300 hover:bg-red-900'
                    }`}
                  >
                    {eventConfig?.livePaymentsEnabled ? 'ENABLED (LIVE)' : 'DISABLED (PROTECTED TEST MODE)'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* METRICS KPI CARDS */}
        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Total Registrations */}
            <div className="glass-card rounded-2xl p-5 border border-purple-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-slate-400">Total Entries</span>
                <Users className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-white mt-2">{metrics.totalRegistrations}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                {metrics.paidRegistrations} confirmed • {metrics.pendingRegistrations} unpaid
              </p>
            </div>

            {/* Target Progress (70 Min Target) */}
            <div className="glass-card rounded-2xl p-5 border border-purple-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-slate-400">Cohort Target Progress</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-3xl font-black text-white">{metrics.paidRegistrations}</p>
                <span className="text-xs text-slate-400">/ {metrics.targetCount} min target</span>
              </div>
              <div className="w-full bg-purple-950 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${metrics.percentOfTarget}%` }}
                />
              </div>
              <p className="text-[11px] text-purple-300 mt-1">
                {metrics.percentOfTarget}% reached (70 is minimum target, not capacity limit)
              </p>
            </div>

            {/* Manual Review Queue */}
            <div className="glass-card rounded-2xl p-5 border border-purple-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-slate-400">Manual UPI Queue</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-amber-300 mt-2">{metrics.manualReviewRegistrations}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Students awaiting coordinator UTR approval
              </p>
            </div>

            {/* Total Revenue */}
            <div className="glass-card rounded-2xl p-5 border border-purple-900/40">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-semibold text-slate-400">Recorded Revenue</span>
                <IndianRupee className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-3xl font-black text-gradient-vibrant mt-2">
                ₹{metrics.totalRevenueINR.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Based on verified payments
              </p>
            </div>

          </div>
        )}

        {/* TABS NAVIGATION */}
        <div className="flex border-b border-purple-950/60 gap-4">
          <button
            onClick={() => setActiveTab('registrations')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'registrations'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>All Registrations ({registrations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('manualQueue')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'manualQueue'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Manual UPI Queue ({manualReviewQueue.length})</span>
            {manualReviewQueue.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-black font-extrabold">
                {manualReviewQueue.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'settings'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Event Settings Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'audit'
                ? 'border-purple-500 text-purple-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: ALL REGISTRATIONS */}
        {activeTab === 'registrations' && (
          <div className="space-y-4">
            
            {/* Search & Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search name, email, phone, pass..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0e071c] border border-purple-900/50 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
                <Search className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-500" />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-xl bg-[#0e071c] border border-purple-900/50 text-xs text-slate-200 focus:outline-none focus:border-purple-400"
                >
                  <option value="all">All Payment Statuses</option>
                  <option value="verified">Verified Only</option>
                  <option value="manual_review">Manual Review</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="glass-card rounded-2xl border border-purple-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-950/60 border-b border-purple-900/50 text-slate-300 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Pass ID</th>
                      <th className="py-3 px-4">Participant</th>
                      <th className="py-3 px-4">Course & Year</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4">Ref / UTR</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-950/40">
                    {filteredRegistrations.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No registrations match current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-purple-950/20 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-purple-300">
                            {reg.registrationNumber}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">{reg.fullName}</span>
                            <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                              {reg.institution}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {reg.course} • <span className="text-purple-300">{reg.yearOfStudy}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <div>{reg.email}</div>
                            <div className="text-[11px] text-slate-400">+91 {reg.phone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                reg.paymentStatus === 'verified'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                                  : reg.paymentStatus === 'manual_review'
                                  ? 'bg-amber-950 text-amber-300 border border-amber-700'
                                  : 'bg-purple-950 text-purple-300 border border-purple-800'
                              }`}
                            >
                              {reg.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                            {reg.manualUtr || reg.paymentId || '—'}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            {reg.paymentStatus !== 'verified' && (
                              <button
                                onClick={() => handleUpdateStatus(reg.id, 'verified', 'Manually marked verified by coordinator')}
                                className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-[10px] font-bold uppercase transition-colors"
                              >
                                Mark Paid
                              </button>
                            )}
                            <Link
                              href={`/success?registrationId=${reg.id}`}
                              target="_blank"
                              className="px-2.5 py-1 rounded bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-300 text-[10px] font-bold uppercase transition-colors inline-block"
                            >
                              Pass
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MANUAL UPI QUEUE */}
        {activeTab === 'manualQueue' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-900/50 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                These students transferred fee to <strong>{eventConfig?.upiId}</strong> and submitted their transaction UTR number. Verify with your UPI banking app statement before approving.
              </span>
            </div>

            {manualReviewQueue.length === 0 ? (
              <div className="glass-card rounded-2xl p-12 text-center border border-purple-900/40">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Manual Queue is Clear</h3>
                <p className="text-xs text-slate-400 mt-1">No pending UTR submissions awaiting review.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {manualReviewQueue.map((item) => (
                  <div key={item.id} className="glass-card rounded-2xl p-6 border border-amber-500/40 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-purple-400">{item.registrationNumber}</span>
                        <h4 className="text-base font-bold text-white mt-0.5">{item.fullName}</h4>
                        <p className="text-xs text-slate-400">{item.email} • +91 {item.phone}</p>
                      </div>
                      <span className="text-lg font-black text-white">₹{item.amountPaid || eventConfig?.registrationFee}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-purple-900/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Submitted UTR Reference</span>
                      <span className="text-sm font-mono font-black text-amber-300 tracking-wide block mt-0.5">
                        {item.manualUtr}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'verified', `UTR ${item.manualUtr} verified against bank statement`)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve & Issue Pass</span>
                      </button>

                      <button
                        onClick={() => handleUpdateStatus(item.id, 'failed', 'Invalid UTR / Payment not found on bank statement')}
                        className="py-2 px-4 rounded-xl bg-red-950/60 hover:bg-red-900/60 border border-red-800 text-red-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EVENT SETTINGS EDITOR */}
        {activeTab === 'settings' && (
          <div className="glass-card rounded-2xl p-8 border border-purple-900/40 shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-950/60">
              <div>
                <h3 className="text-lg font-bold text-white">Event Configuration Settings</h3>
                <p className="text-xs text-slate-400">
                  Update event parameters in real-time without touching code or redeploying.
                </p>
              </div>

              {settingsSuccess && (
                <div className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Settings Saved Successfully!</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Event Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={settingsForm.title || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0e071c] border border-purple-900/50 text-white text-xs"
                  />
                </div>

                {/* Host Institution */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Host Institution
                  </label>
                  <input
                    type="text"
                    value={settingsForm.hostInstitution || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, hostInstitution: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0e071c] border border-purple-900/50 text-white text-xs"
                  />
                </div>

                {/* Event Date (Configurable TBA) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Event Date (Leave empty for &quot;To be announced&quot;)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15 October 2026 or leave blank for TBA"
                    value={settingsForm.date || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, date: e.target.value || null })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0e071c] border border-purple-900/50 text-white text-xs"
                  />
                </div>

                {/* Room / Seminar Hall */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Seminar Hall / Room (Leave empty for TBA)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium / Seminar Hall B"
                    value={settingsForm.roomNumber || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, roomNumber: e.target.value || null })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0e071c] border border-purple-900/50 text-white text-xs"
                  />
                </div>

                {/* Registration Fee */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Configured Registration Fee (INR)
                  </label>
                  <input
                    type="number"
                    value={settingsForm.registrationFee || 699}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        registrationFee: Number(e.target.value),
                        registrationFeePaise: Number(e.target.value) * 100,
                      })
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0e071c] border border-purple-900/50 text-white text-xs"
                  />
                  <span className="text-[11px] text-emerald-400 mt-1 block">
                    Official E-Cell IIT Bombay NEC discount rate is ₹699/- (valid till 30 Sept 2026).
                  </span>
                </div>

                {/* Minimum Target & Capacity */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Minimum Target
                    </label>
                    <input
                      type="number"
                      value={settingsForm.minimumTarget || 70}
                      onChange={(e) => setSettingsForm({ ...settingsForm, minimumTarget: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e071c] border border-purple-900/50 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Max Capacity (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="Leave empty for open"
                      value={settingsForm.capacity || ''}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          capacity: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0e071c] border border-purple-900/50 text-white text-xs"
                    />
                  </div>
                </div>

                {/* UPI Receiver ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    UPI Receiver ID
                  </label>
                  <input
                    type="text"
                    value={settingsForm.upiId || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, upiId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0e071c] border border-purple-900/50 text-white text-xs"
                  />
                </div>

                {/* Merchant / Beneficiary Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    UPI Beneficiary Display Name
                  </label>
                  <input
                    type="text"
                    value={settingsForm.upiMerchantName || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, upiMerchantName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0e071c] border border-purple-900/50 text-white text-xs"
                  />
                </div>

              </div>

              <div className="pt-4 border-t border-purple-950/60 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'audit' && (
          <div className="glass-card rounded-2xl border border-purple-900/40 overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-purple-950/60 bg-purple-950/40">
              <h3 className="text-sm font-bold text-white">System & Administrative Audit Trail</h3>
              <p className="text-xs text-slate-400">Chronological history of security events, payments, and approvals.</p>
            </div>
            <div className="divide-y divide-purple-950/40">
              {auditLogs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No audit records yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-purple-950/20 text-xs flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-purple-300">{log.action}</span>
                        <span className="text-[10px] text-slate-400">by {log.actorEmail}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Target: {log.targetType} ({log.targetId})
                      </p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <pre className="mt-1 text-[10px] bg-black/40 p-1.5 rounded text-purple-200 overflow-x-auto">
                          {JSON.stringify(log.details)}
                        </pre>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
