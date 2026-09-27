import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage/data-store';
import { EmailService } from '@/lib/email/sender';
import { PaymentStatus, RegistrationStatus } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const paymentStatus = (searchParams.get('paymentStatus') as PaymentStatus | 'all') || 'all';
    const status = (searchParams.get('status') as RegistrationStatus | 'all') || 'all';
    const exportCsv = searchParams.get('export') === 'csv';

    const registrations = await DataStore.listRegistrations({
      search,
      paymentStatus,
      status,
    });

    if (exportCsv) {
      // Build clean CSV for submission to E-Cell IIT Bombay
      const headers = [
        'Registration ID',
        'Full Name',
        'Email Address',
        'Mobile Number',
        'Institution',
        'Course / Department',
        'Year of Study',
        'Registration Status',
        'Payment Status',
        'Payment Method',
        'Amount Paid (INR)',
        'UTR / Ref Number',
        'Created Timestamp',
      ];

      const rows = registrations.map((r) => [
        `"${r.registrationNumber}"`,
        `"${r.fullName.replace(/"/g, '""')}"`,
        `"${r.email}"`,
        `"${r.phone}"`,
        `"${r.institution.replace(/"/g, '""')}"`,
        `"${r.course.replace(/"/g, '""')}"`,
        `"${r.yearOfStudy}"`,
        `"${r.status}"`,
        `"${r.paymentStatus}"`,
        `"${r.paymentMethod}"`,
        `"${r.amountPaid}"`,
        `"${(r.manualUtr || r.paymentId || '').replace(/"/g, '""')}"`,
        `"${r.createdAt}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="illuminate-kmct-participants-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      registrations,
    });
  } catch (error: any) {
    console.error('Admin registrations list error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve registrations' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { registrationId, paymentStatus, status, adminNotes } = await req.json();

    if (!registrationId) {
      return NextResponse.json({ success: false, message: 'Registration ID required' }, { status: 400 });
    }

    const reg = await DataStore.getRegistrationById(registrationId);
    if (!reg) {
      return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
    }

    const updates: any = {};
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
      if (paymentStatus === 'verified') {
        updates.status = 'confirmed';
        updates.amountPaid = (reg.amountPaise || 69900) / 100;
        updates.confirmationSentAt = new Date().toISOString();
      }
    }
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const updated = await DataStore.updateRegistration(registrationId, updates);

    // Record audit log
    await DataStore.recordAuditLog(
      'admin-coordinator',
      'coordinator@kmct.edu.in',
      'REGISTRATION_STATUS_MODIFIED',
      'registration',
      registrationId,
      { previousStatus: reg.paymentStatus, newStatus: paymentStatus, notes: adminNotes }
    );

    // If verified by coordinator, dispatch confirmation pass email
    if (paymentStatus === 'verified' && updated) {
      const config = await DataStore.getEventConfig();
      EmailService.sendPaymentConfirmationEmail(updated, config).catch((e) =>
        console.warn('Failed to send verified pass email:', e)
      );
    }

    return NextResponse.json({
      success: true,
      registration: updated,
      message: 'Registration updated successfully',
    });
  } catch (error: any) {
    console.error('Admin update registration error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update registration' }, { status: 500 });
  }
}
