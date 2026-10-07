import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/razorpay';
import { DataStore } from '@/lib/storage/data-store';
import { EmailService } from '@/lib/email/sender';
import { syncCandidateToGoogleSheet } from '@/lib/sheets/google-sheets';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ success: false, message: 'Missing signature header' }, { status: 400 });
    }

    const isValid = PaymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      await DataStore.recordAuditLog(
        'webhook-caller',
        'razorpay-webhook',
        'WEBHOOK_SIGNATURE_FAILED',
        'payment',
        'unknown',
        { signature }
      );
      return NextResponse.json({ success: false, message: 'Invalid webhook signature' }, { status: 401 });
    }

    const eventData = JSON.parse(rawBody);
    const eventType = eventData.event;

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const paymentEntity = eventData.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || {};
      const registrationId = notes.registrationId;

      if (orderId && paymentId) {
        let reg = registrationId ? await DataStore.getRegistrationById(registrationId) : null;
        if (!reg && paymentEntity?.email) {
          reg = await DataStore.getRegistrationByEmail(paymentEntity.email);
        }

        const email = (paymentEntity.email || notes.email || '').toLowerCase().trim();
        const fullName = notes.fullName || notes.name || email.split('@')[0] || 'Participant';
        const phone = notes.phone || paymentEntity.contact?.replace(/^\+91/, '') || '';
        const ticketId = reg?.registrationNumber || `ILM-KMCT-${paymentId.slice(-8).toUpperCase()}`;
        const targetRegId = registrationId || reg?.id || `reg_${paymentEntity.created_at ? paymentEntity.created_at * 1000 : Date.now()}_${paymentId.slice(-6)}`;

        if (!reg) {
          reg = {
            id: targetRegId,
            registrationNumber: ticketId,
            fullName,
            email,
            normalizedEmail: email,
            phone,
            institution: notes.institution || 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod',
            course: notes.course || 'Engineering',
            yearOfStudy: notes.yearOfStudy || '1st Year',
            eventId: 'illuminate-kmct-2026',
            paymentMethod: 'razorpay',
            amountPaid: (paymentEntity.amount || 69900) / 100,
            amountPaise: paymentEntity.amount || 69900,
            currency: 'INR',
            orderId,
            paymentId,
            status: 'confirmed',
            paymentStatus: 'verified',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await DataStore.saveRegistrationDirect(reg);
        } else if (reg.paymentStatus !== 'verified') {
          reg = (await DataStore.updateRegistration(reg.id, {
            status: 'confirmed',
            paymentStatus: 'verified',
            paymentMethod: 'razorpay',
            registrationNumber: reg.registrationNumber || ticketId,
            amountPaid: (paymentEntity.amount || 69900) / 100,
            paymentId,
            confirmationSentAt: new Date().toISOString(),
          })) || reg;
        }

        await DataStore.recordPayment({
          registrationId: reg.id,
          provider: 'razorpay',
          providerOrderId: orderId,
          providerPaymentId: paymentId,
          providerSignature: signature,
          amountPaise: paymentEntity.amount || 69900,
          currency: 'INR',
          status: 'captured',
          verifiedAt: new Date().toISOString(),
        });

        const config = await DataStore.getEventConfig();
        EmailService.sendPaymentConfirmationEmail(reg, config).catch((e) =>
          console.warn('Webhook email sending error:', e)
        );

        try {
          await syncCandidateToGoogleSheet(reg, {
            registrationId: reg.id,
            provider: 'razorpay',
            providerOrderId: orderId,
            providerPaymentId: paymentId,
            amountPaise: paymentEntity.amount || 69900,
            currency: 'INR',
            status: 'captured',
            verifiedAt: new Date().toISOString(),
          });
        } catch (e) {
          console.warn('Webhook Google Sheet sync error:', e);
        }

        await DataStore.recordAuditLog(
          'system-webhook',
          'razorpay@system',
          'WEBHOOK_PAYMENT_PROCESSED',
          'registration',
          reg.id,
          { orderId, paymentId }
        );
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, message: 'Webhook processing error' }, { status: 500 });
  }
}
