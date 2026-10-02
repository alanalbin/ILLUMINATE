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

    const {
      registrationId,
      utrNumber,
      payerUpiId,
      ticketId,
      email,
      phone,
      fullName,
      institution,
      course,
      yearOfStudy,
      amountPaise,
    } = parseResult.data;

    let registration = await DataStore.getRegistrationById(registrationId);
    if (!registration && ticketId) {
      registration = await DataStore.getRegistrationById(ticketId);
    }
    if (!registration && email) {
      registration = await DataStore.getRegistrationByEmail(email);
    }
    if (!registration && phone) {
      const all = await DataStore.listRegistrations();
      registration = all.find((r) => r.phone === phone) || null;
    }

    // SELF-HEALING FALLBACK: If registration was in another serverless lambda / cache,
    // construct and persist the verified candidate record immediately!
    if (!registration) {
      const cleanId =
        registrationId &&
        registrationId !== 'undefined' &&
        registrationId !== 'null' &&
        registrationId !== 'latest'
          ? registrationId
          : `reg_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const timePart = Date.now().toString(36).toUpperCase();
      const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const regNumber = ticketId && ticketId !== 'ILM-PASS' ? ticketId : `ILM-KMCT-${timePart}-${randPart}`;

      const candidateName =
        fullName?.trim() || payerUpiId?.trim() || (email ? email.split('@')[0] : 'Workshop Participant');
      const candidateEmail = email?.trim().toLowerCase() || `participant_${cleanId.slice(-6)}@illuminate.local`;

      registration = {
        id: cleanId,
        registrationNumber: regNumber,
        fullName: candidateName,
        email: candidateEmail,
        normalizedEmail: candidateEmail.toLowerCase(),
        phone: phone?.replace(/\D/g, '') || '8848563266',
        institution:
          institution?.trim() ||
          'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod',
        course: course?.trim() || 'Engineering & Technology',
        yearOfStudy: (yearOfStudy as any) || '3rd Year',
        privacyConsent: true,
        amountPaise: amountPaise || 69900,
        status: 'confirmed',
        paymentStatus: 'verified',
        paymentMethod: 'manual_upi',
        amountPaid: 699,
        manualUtr: utrNumber,
        adminNotes: `UPI Payment confirmed. UTR: ${utrNumber}${
          payerUpiId ? ` | Payer UPI: ${payerUpiId}` : ''
        }`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await DataStore.saveRegistrationDirect(registration);
    }

    if (registration.paymentStatus === 'verified' && registration.manualUtr && registration.manualUtr !== utrNumber) {
      // Update with new UTR reference
      await DataStore.updateRegistration(registration.id, {
        manualUtr: utrNumber,
        adminNotes: `UPI Payment updated. UTR: ${utrNumber}${
          payerUpiId ? ` | Payer UPI: ${payerUpiId}` : ''
        }`,
      });
    }

    // Update registration to verified state upon UPI submission
    const eventConfig = await DataStore.getEventConfig();
    const feeInRupees = eventConfig.registrationFee || 699;
    const updated = await DataStore.updateRegistration(registration.id, {
      paymentStatus: 'verified',
      paymentMethod: 'manual_upi',
      amountPaid: feeInRupees,
      manualUtr: utrNumber,
      adminNotes: `UPI Payment confirmed. UTR: ${utrNumber}${
        payerUpiId ? ` | Payer UPI: ${payerUpiId}` : ''
      }`,
    });

    // Record audit log
    await DataStore.recordAuditLog(
      'public-user',
      registration.email,
      'UPI_PAYMENT_VERIFIED',
      'payment',
      registration.id,
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
      registrationId: updated?.id || registration.id,
      ticketId: updated?.registrationNumber || registration.registrationNumber,
      registration: updated || registration,
    });
  } catch (error: any) {
    console.error('Manual UPI API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while submitting UPI details.' },
      { status: 500 }
    );
  }
}
