import { Registration, PaymentRecord } from '@/types';

export const GOOGLE_SHEET_ID = '146f_VkQ6NnYNmxkTjVtBD22y5JzXRQi3zvxO3QwI5O4';
export const GOOGLE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/edit?usp=sharing`;

export interface CandidateRow {
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
  transactionOrUtr: string;
  amountINR: number;
}

/**
 * Converts a registration record into formatted candidate spreadsheet row data
 */
export function formatCandidateForSheet(
  registration: Registration,
  payment?: PaymentRecord | null
): CandidateRow {
  return {
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    registrationNumber: registration.registrationNumber,
    fullName: registration.fullName,
    email: registration.email,
    phone: registration.phone,
    institution: registration.institution,
    course: registration.course,
    yearOfStudy: registration.yearOfStudy,
    paymentStatus:
      registration.paymentStatus === 'verified'
        ? 'CONFIRMED / PAID'
        : registration.paymentStatus === 'manual_review'
        ? 'MANUAL REVIEW (UPI)'
        : registration.paymentStatus === 'pending'
        ? 'PENDING PAYMENT'
        : 'UNPAID',
    paymentMethod:
      payment?.provider === 'manual_upi' || registration.manualUtr
        ? 'Direct UPI'
        : registration.paymentMethod || 'None',
    transactionOrUtr: payment?.providerPaymentId || registration.paymentId || registration.manualUtr || 'N/A',
    amountINR: registration.amountPaid ? registration.amountPaid / 100 : 699,
  };
}

export const GOOGLE_SHEET_DEPLOYMENT_ID =
  'AKfycbxjXc24ovEYwjPYPWT5cQQwLE3Q2qkO7_sp1krEWDH65_5RhuCAhpR2kKlwBbiRJXeBJQ';
export const DEFAULT_WEBHOOK_URL = `https://script.google.com/macros/s/${GOOGLE_SHEET_DEPLOYMENT_ID}/exec`;

/**
 * Sends candidate record to the connected Google Sheet via Google Apps Script Webhook
 */
export async function syncCandidateToGoogleSheet(
  registration: Registration,
  payment?: PaymentRecord | null
): Promise<{ success: boolean; error?: string }> {
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;

  const payload = formatCandidateForSheet(registration, payment);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { success: false, error: `Webhook returned status ${res.status}` };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Google Sheet sync error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Helper to generate CSV headers and content matching the Google Sheet columns
 */
export function generateSheetCsv(registrations: Registration[]): string {
  const headers = [
    'Timestamp',
    'Registration Number',
    'Full Name',
    'Email Address',
    'Phone Number',
    'Institution / College',
    'Course / Department',
    'Year of Study',
    'Payment Status',
    'Payment Method',
    'Transaction / UTR Number',
    'Amount (INR)',
  ];

  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = registrations.map((r) => {
    const row = formatCandidateForSheet(r);
    return [
      escapeCsv(row.timestamp),
      escapeCsv(row.registrationNumber),
      escapeCsv(row.fullName),
      escapeCsv(row.email),
      escapeCsv(row.phone),
      escapeCsv(row.institution),
      escapeCsv(row.course),
      escapeCsv(row.yearOfStudy),
      escapeCsv(row.paymentStatus),
      escapeCsv(row.paymentMethod),
      escapeCsv(row.transactionOrUtr),
      escapeCsv(row.amountINR),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
