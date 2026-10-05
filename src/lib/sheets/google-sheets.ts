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
    transactionOrUtr: registration.manualUtr || payment?.providerPaymentId || registration.paymentId || 'N/A',
    amountINR: registration.amountPaid
      ? (registration.amountPaid > 1000 ? Math.round(registration.amountPaid / 100) : registration.amountPaid)
      : 699,
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
  // CRITICAL: ONLY add candidate details to Google Sheet AFTER payment is completed & verified!
  if (registration.paymentStatus !== 'verified') {
    console.info(
      `[Google Sheets Sync Skipped] Candidate ${registration.id} (${registration.email}) is unpaid/unverified. Details are only synced after verified payment.`
    );
    return { success: false, error: 'Registration payment is not completed or verified' };
  }

  // Prevent test suite or dummy runs from sending to production Google Sheet
  const emailLower = (registration.email || '').toLowerCase().trim();
  const nameLower = (registration.fullName || '').toLowerCase().trim();
  if (
    process.env.NODE_ENV === 'test' ||
    emailLower.startsWith('test_') ||
    emailLower.startsWith('restored_') ||
    emailLower.startsWith('phantom_') ||
    emailLower.includes('example.com') ||
    nameLower.includes('test participant') ||
    nameLower.includes('restored candidate')
  ) {
    console.info(`[Google Sheets Sync Skipped] Skipping test candidate (${emailLower}) from syncing to live sheet.`);
    return { success: true };
  }

  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;

  const formatted = formatCandidateForSheet(registration, payment);
  const utrVal = registration.manualUtr || formatted.transactionOrUtr;

  const payload = {
    ...formatted,
    utr: utrVal,
    utrNumber: utrVal,
    UTR: utrVal,
    transactionId: utrVal,
    transactionOrUtr: utrVal,
    'Transaction / UTR Number': utrVal,
    'Registration Number': formatted.registrationNumber,
    'Full Name': formatted.fullName,
    'Email Address': formatted.email,
    'Phone Number': formatted.phone,
    'Institution / College': formatted.institution,
    'Course / Department': formatted.course,
    'Year of Study': formatted.yearOfStudy,
    'Payment Status': formatted.paymentStatus,
    'Payment Method': formatted.paymentMethod,
    'Amount (INR)': formatted.amountINR,
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
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
