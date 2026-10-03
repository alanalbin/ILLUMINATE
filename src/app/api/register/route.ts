import { NextRequest, NextResponse } from 'next/server';
import { registrationFormSchema } from '@/lib/validation/registration';
import { DataStore } from '@/lib/storage/data-store';
import { EmailService } from '@/lib/email/sender';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Zod Server-side Validation
    const validationResult = registrationFormSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          errors: validationResult.error.flatten().fieldErrors,
          message: 'Please correct the invalid fields in the form.',
        },
        { status: 400 }
      );
    }

    const { fullName, email, phone, institution, course, yearOfStudy } = validationResult.data;

    // 2. Fetch current event config
    const eventConfig = await DataStore.getEventConfig();

    // Check if capacity is reached (if capacity limit is explicitly set)
    if (eventConfig.capacity) {
      const allRegistrations = await DataStore.listRegistrations();
      const confirmedCount = allRegistrations.filter((r) => r.paymentStatus === 'verified').length;
      if (confirmedCount >= eventConfig.capacity) {
        return NextResponse.json(
          {
            success: false,
            message: 'Registrations are currently closed as maximum capacity has been reached.',
          },
          { status: 403 }
        );
      }
    }

    // 3. Duplicate email check
    const existing = await DataStore.getRegistrationByEmail(email);
    if (existing) {
      if (existing.paymentStatus === 'verified') {
        return NextResponse.json(
          {
            success: false,
            alreadyRegistered: true,
            isPaid: true,
            registrationId: existing.id,
            registrationNumber: existing.registrationNumber,
            message: 'You are already registered and your payment is verified! Redirecting to your pass...',
          },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          {
            success: true,
            isExistingPending: true,
            registrationId: existing.id,
            registration: {
              ...existing,
              registrationNumber: '', // Ticket ID is only issued after payment
            },
            message: 'An existing pending registration was found for this email. Proceeding to payment...',
          },
          { status: 200 }
        );
      }
    }

    // 4. Create new registration
    const feePaise = Math.round(eventConfig.registrationFee * 100);

    const newReg = await DataStore.createRegistration({
      fullName,
      email,
      normalizedEmail: email.toLowerCase(),
      phone,
      institution,
      course,
      yearOfStudy,
      eventId: eventConfig.id,
      paymentMethod: 'none',
      amountPaise: feePaise,
      currency: 'INR',
    });

    // 5. Audit Log
    await DataStore.recordAuditLog(
      'public-user',
      email,
      'REGISTRATION_CREATED',
      'registration',
      newReg.id,
      { fee: eventConfig.registrationFee }
    );

    // Note: Ticket ID, pass, and confirmation email are strictly issued AFTER payment is verified.

    return NextResponse.json({
      success: true,
      registrationId: newReg.id,
      registration: {
        ...newReg,
        registrationNumber: '', // Ticket ID is issued only upon successful payment
      },
      message: 'Registration created successfully. Please complete payment to unlock your ticket and pass.',
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected server error occurred while processing your registration. Please try again.',
      },
      { status: 500 }
    );
  }
}
