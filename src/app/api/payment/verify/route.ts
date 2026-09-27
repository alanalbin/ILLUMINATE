import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/razorpay';
import { DataStore } from '@/lib/storage/data-store';
import { EmailService } from '@/lib/email/sender';

export async function POST(req: NextRequest) {
  try {
    const { registrationId, orderId, paymentId, signature } = await req.json();

    if (!registrationId || !orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, message: 'Missing required payment verification parameters' },
        { status: 400 }
      );
    }

    const verificationResult = await PaymentService.handlePaymentSuccess(
      registrationId,
      orderId,
      paymentId,
      signature
    );

    if (!verificationResult.success) {
      return NextResponse.json(
        { success: false, message: verificationResult.message },
        { status: 400 }
      );
    }

    // Send confirmation pass email
    const reg = await DataStore.getRegistrationById(registrationId);
    const event = await DataStore.getEventConfig();
    if (reg) {
      EmailService.sendPaymentConfirmationEmail(reg, event).catch((err) =>
        console.warn('Payment confirmation email failed in background:', err)
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment successfully verified. Registration confirmed.',
      registrationId,
    });
  } catch (error: any) {
    console.error('Verify payment API error:', error);
    return NextResponse.json(
      { success: false, message: 'Payment verification failed due to internal error.' },
      { status: 500 }
    );
  }
}
