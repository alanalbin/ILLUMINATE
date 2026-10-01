import { NextRequest, NextResponse } from 'next/server';
import { manualUpiSubmissionSchema } from '@/lib/validation/registration';
import { DataStore } from '@/lib/storage/data-store';
import { syncCandidateToGoogleSheet } from '@/lib/sheets/google-sheets';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parseResult = manualUpiSubmissionSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          errors: parseResult.error.flatten().fieldErrors,
          message: 'Invalid transaction reference format.',
        },
        { status: 400 }
      );
    }

    const { registrationId, utrNumber, payerUpiId } = parseResult.data;

    const registration = await DataStore.getRegistrationById(registrationId);
    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Registration record not found' },
        { status: 404 }
      );
    }

    if (registration.paymentStatus === 'verified') {
      return NextResponse.json(
        { success: true, message: 'Registration is already paid and verified' },
        { status: 200 }
      );
    }

    // Update registration to manual_review state
    await DataStore.updateRegistration(registrationId, {
      paymentStatus: 'manual_review',
      paymentMethod: 'manual_upi',
      manualUtr: utrNumber,
      adminNotes: `Manual UPI submission received. UTR: ${utrNumber}${
        payerUpiId ? ` | Payer UPI: ${payerUpiId}` : ''
      }`,
    });

    // Record audit log
    await DataStore.recordAuditLog(
      'public-user',
      registration.email,
      'MANUAL_UPI_SUBMITTED',
      'payment',
      registrationId,
      { utrNumber, payerUpiId }
    );

    // Sync updated UPI UTR to Google Sheet in background
    syncCandidateToGoogleSheet({
      ...registration,
      paymentStatus: 'manual_review',
      manualUtr: utrNumber,
    }).catch((err) => console.warn('Google sheet sync error:', err));

    return NextResponse.json({
      success: true,
      message: 'Your UPI transaction details have been submitted for coordinator verification.',
      registrationId,
    });
  } catch (error: any) {
    console.error('Manual UPI API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while submitting UPI details.' },
      { status: 500 }
    );
  }
}
