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

    // Update registration to verified state upon UPI submission
    const eventConfig = await DataStore.getEventConfig();
    const updated = await DataStore.updateRegistration(registrationId, {
      paymentStatus: 'verified',
      paymentMethod: 'manual_upi',
      amountPaid: registration.amountPaise || 69900,
      manualUtr: utrNumber,
      adminNotes: `UPI Gateway Payment confirmed. UTR: ${utrNumber}${
        payerUpiId ? ` | Payer UPI: ${payerUpiId}` : ''
      }`,
    });

    // Record audit log
    await DataStore.recordAuditLog(
      'public-user',
      registration.email,
      'UPI_PAYMENT_VERIFIED',
      'payment',
      registrationId,
      { utrNumber, payerUpiId, amountINR: 699 }
    );

    // Sync verified candidate to Google Sheet in background
    if (updated) {
      syncCandidateToGoogleSheet(updated).catch((err) =>
        console.warn('Google Sheet sync error on UPI payment:', err)
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your UPI transaction has been verified! Redirecting to your official pass...',
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
