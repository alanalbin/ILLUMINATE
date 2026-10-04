import Razorpay from 'razorpay';
import { DataStore } from '@/lib/storage/data-store';
import { getRazorpayKeyId, getRazorpayKeySecret, isRazorpayConfigured } from '@/lib/payments/razorpay';
import { GOOGLE_SHEET_ID } from '@/lib/sheets/google-sheets';
import { Registration } from '@/types';

export interface LiveSeatsInfo {
  total: number;
  paid: number;
  remaining: number;
  percentFilled: number;
  timestamp: number;
}

let cachedSeatsInfo: { data: LiveSeatsInfo; timestamp: number } | null = null;
const CACHE_TTL_MS = 15000; // 15 seconds live cache

interface SheetCandidate {
  timestamp: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  course: string;
  yearOfStudy: string;
  paymentStatus: string;
  paymentMethod: string;
  utr: string;
  amountINR: number;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses Google Sheet CSV export to read verified registered candidates
 */
async function fetchSheetCandidates(): Promise<SheetCandidate[]> {
  try {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv`;
    const res = await fetch(csvUrl, {
      cache: 'no-store',
      headers: { Accept: 'text/csv' },
    });
    if (!res.ok) return [];

    const text = await res.text();
    const rows: SheetCandidate[] = [];
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      const cols = parseCsvLine(lines[i]);
      if (cols.length >= 5 && cols[1]?.startsWith('ILM-')) {
        rows.push({
          timestamp: cols[0] || '',
          registrationNumber: cols[1],
          fullName: cols[2] || '',
          email: (cols[3] || '').toLowerCase().trim(),
          phone: cols[4] || '',
          institution: cols[5] || '',
          course: cols[6] || '',
          yearOfStudy: cols[7] || '',
          paymentStatus: cols[8] || 'CONFIRMED / PAID',
          paymentMethod: cols[9] || 'razorpay',
          utr: cols[10] || '',
          amountINR: Number(cols[11]) || 699,
        });
      }
    }
    return rows;
  } catch (err) {
    console.warn('[LiveSeats] Sheet sync warning:', err);
    return [];
  }
}

/**
 * Fetches captured live payments directly from Razorpay
 */
async function fetchRazorpayCaptured(): Promise<any[]> {
  if (!isRazorpayConfigured()) return [];
  try {
    const client = new Razorpay({
      key_id: getRazorpayKeyId(),
      key_secret: getRazorpayKeySecret(),
    });
    const payments = await client.payments.all({ count: 100 });
    return (payments?.items || []).filter(
      (p: any) => p.status === 'captured' && (p.amount >= 10000 || p.amount === 69900)
    );
  } catch (err) {
    console.warn('[LiveSeats] Razorpay live payments query warning:', err);
    return [];
  }
}

function isTestRecord(email?: string, fullName?: string): boolean {
  const em = (email || '').toLowerCase().trim();
  const fn = (fullName || '').toLowerCase().trim();
  return (
    em.includes('test_') ||
    em.includes('example.com') ||
    em.includes('qrtest_') ||
    em.includes('_test@') ||
    em.includes('restored_') ||
    fn.includes('test') ||
    fn.includes('restored') ||
    fn === 'test participant'
  );
}

/**
 * Reconciles live confirmed payments into DataStore so local and serverless databases
 * stay synchronized with real participants.
 */
async function reconcileWithDataStore(capturedPayments: any[], sheetRows: SheetCandidate[]): Promise<Set<string>> {
  const sheetMap = new Map<string, SheetCandidate>();
  for (const s of sheetRows) {
    if (s.email) sheetMap.set(s.email.toLowerCase().trim(), s);
  }

  const confirmedEmails = new Set<string>();

  // 1. Gather confirmed from Razorpay
  for (const p of capturedPayments) {
    const email = (p.email || p.notes?.email || '').toLowerCase().trim();
    const name = p.notes?.fullName || p.notes?.name || '';
    if (email && !isTestRecord(email, name)) {
      confirmedEmails.add(email);
    }
  }

  // 2. Gather confirmed from Google Sheet
  for (const s of sheetRows) {
    if (s.email && !isTestRecord(s.email, s.fullName)) {
      confirmedEmails.add(s.email.toLowerCase().trim());
    }
  }

  // 3. Sync missing candidates into DataStore
  try {
    const existingList = await DataStore.listRegistrations();
    const existingEmails = new Set(existingList.map((r) => r.email.toLowerCase().trim()));

    // Sync Razorpay payments
    for (const p of capturedPayments) {
      const email = (p.email || p.notes?.email || '').toLowerCase().trim();
      const name = p.notes?.fullName || p.notes?.name || '';
      if (!email || isTestRecord(email, name)) continue;

      if (!existingEmails.has(email)) {
        const sheet = sheetMap.get(email);
        const regNumber = sheet?.registrationNumber || `ILM-KMCT-${p.id.slice(-8).toUpperCase()}`;
        const fullName = sheet?.fullName || p.notes?.fullName || p.notes?.name || email.split('@')[0];
        const phone = sheet?.phone || p.contact?.replace(/^\+91/, '') || p.notes?.phone || '';
        const institution = sheet?.institution || 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod';
        const course = sheet?.course || 'Engineering';
        const yearOfStudy = sheet?.yearOfStudy || '1st Year';
        const amountINR = (p.amount || 69900) / 100;

        const reg: Registration = {
          id: p.notes?.registrationId || `reg_${p.created_at * 1000}_${p.id.slice(-6)}`,
          registrationNumber: regNumber,
          fullName,
          email,
          normalizedEmail: email,
          phone,
          institution,
          course,
          yearOfStudy,
          eventId: 'illuminate-kmct-2026',
          paymentMethod: 'razorpay',
          amountPaid: amountINR,
          amountPaise: p.amount || 69900,
          currency: 'INR',
          orderId: p.order_id || '',
          paymentId: p.id,
          status: 'confirmed',
          paymentStatus: 'verified',
          createdAt: new Date(p.created_at * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await DataStore.saveRegistrationDirect(reg);
        existingEmails.add(email);
      }
    }

    // Sync Google Sheet candidates
    for (const s of sheetRows) {
      const email = (s.email || '').toLowerCase().trim();
      if (!email || isTestRecord(email, s.fullName)) continue;

      if (!existingEmails.has(email)) {
        const reg: Registration = {
          id: `reg_sheet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          registrationNumber: s.registrationNumber,
          fullName: s.fullName,
          email,
          normalizedEmail: email,
          phone: s.phone,
          institution: s.institution || 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod',
          course: s.course || 'Engineering',
          yearOfStudy: s.yearOfStudy || '1st Year',
          eventId: 'illuminate-kmct-2026',
          paymentMethod: s.paymentMethod?.toLowerCase().includes('upi') ? 'manual_upi' : 'razorpay',
          amountPaid: s.amountINR || 699,
          amountPaise: (s.amountINR || 699) * 100,
          currency: 'INR',
          orderId: '',
          paymentId: s.utr || '',
          status: 'confirmed',
          paymentStatus: 'verified',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await DataStore.saveRegistrationDirect(reg);
        existingEmails.add(email);
      }
    }
  } catch (err) {
    console.warn('[LiveSeats] Reconciliation warning:', err);
  }

  return confirmedEmails;
}

/**
 * Returns current authoritative live seat metrics for the workshop
 */
export async function getLiveSeatsInfo(): Promise<LiveSeatsInfo> {
  const now = Date.now();
  if (cachedSeatsInfo && now - cachedSeatsInfo.timestamp < CACHE_TTL_MS) {
    return cachedSeatsInfo.data;
  }

  try {
    const config = await DataStore.getEventConfig();
    const totalSeats = config.capacity || config.minimumTarget || 70;

    // Fetch authoritative live sources in parallel
    const [rzpPayments, sheetCandidates] = await Promise.all([
      fetchRazorpayCaptured(),
      fetchSheetCandidates(),
    ]);

    const liveConfirmedEmails = await reconcileWithDataStore(rzpPayments, sheetCandidates);

    // Also check DataStore verified registrations
    const dbRegistrations = await DataStore.listRegistrations();
    for (const r of dbRegistrations) {
      const email = (r.email || '').toLowerCase().trim();
      if (r.paymentStatus === 'verified' && email && !isTestRecord(email, r.fullName)) {
        liveConfirmedEmails.add(email);
      }
    }

    // Ground truth: deduplicated unique confirmed emails across all sources (minimum 6 known verified)
    const paid = Math.max(6, liveConfirmedEmails.size);
    const remaining = Math.max(0, totalSeats - paid);
    const percentFilled = Math.min(100, Math.round((paid / totalSeats) * 100));

    const result: LiveSeatsInfo = {
      total: totalSeats,
      paid,
      remaining,
      percentFilled,
      timestamp: now,
    };

    cachedSeatsInfo = { data: result, timestamp: now };
    return result;
  } catch (err) {
    console.error('[LiveSeats] Calculation error, falling back:', err);
    if (cachedSeatsInfo) return cachedSeatsInfo.data;

    return {
      total: 70,
      paid: 6,
      remaining: 64,
      percentFilled: 9,
      timestamp: now,
    };
  }
}
