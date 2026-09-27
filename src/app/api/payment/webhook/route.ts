import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/razorpay';
import { DataStore } from '@/lib/storage/data-store';
import { EmailService } from '@/lib/email/sender';

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

      if (registrationId && orderId && paymentId) {
        const reg = await DataStore.getRegistrationById(registrationId);
        if (reg && reg.paymentStatus !== 'verified') {
          await DataStore.recordPayment({
            registrationId,
            provider: 'razorpay',
            providerOrderId: orderId,
            providerPaymentId: paymentId,
            providerSignature: signature,
            amountPaise: paymentEntity.amount || 70000,
            currency: 'INR',
            status: 'captured',
            verifiedAt: new Date().toISOString(),
          });

          await DataStore.updateRegistration(registrationId, {
            status: 'confirmed',
            paymentStatus: 'verified',
            paymentMethod: 'razorpay',
            amountPaid: (paymentEntity.amount || 70000) / 100,
            paymentId,
            confirmationSentAt: new Date().toISOString(),
          });

          const config = await DataStore.getEventConfig();
          EmailService.sendPaymentConfirmationEmail(reg, config).catch((e) =>
            console.warn('Webhook email sending error:', e)
          );

          await DataStore.recordAuditLog(
            'system-webhook',
            'razorpay@system',
            'WEBHOOK_PAYMENT_PROCESSED',
            'registration',
            registrationId,
            { orderId, paymentId }
          );
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, message: 'Webhook processing error' }, { status: 500 });
  }
}
