import { NextResponse } from 'next/server';
import { syncAllMissingCapturedPaymentsToSheet } from '@/lib/seats/live-seats';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const result = await syncAllMissingCapturedPaymentsToSheet();
    return NextResponse.json(
      {
        ...result,
        message: result.syncedCount > 0
          ? `Successfully synced ${result.syncedCount} missing candidate(s) to Google Sheets.`
          : 'Google Sheet is already completely up to date with all Razorpay payments.',
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Google Sheet sync API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to sync Google Sheets.',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
