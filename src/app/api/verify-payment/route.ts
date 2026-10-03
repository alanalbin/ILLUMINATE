import { NextRequest, NextResponse } from 'next/server';
import { PaymentService, getRazorpayKeySecret } from '@/lib/payments/razorpay';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // Accept multiple field naming conventions
    const orderId = body.razorpay_order_id || body.order_id || body.orderId;
    const paymentId = body.razorpay_payment_id || body.payment_id || body.paymentId;
    const signature = body.razorpay_signature || body.signature;
    const registrationId = body.registrationId || body.registration_id;

    // Missing fields check
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required payment verification parameters (order_id, payment_id, signature).',
        },
        { status: 400 }
      );
    }

    const keySecret = getRazorpayKeySecret();
    if (!keySecret) {
      return NextResponse.json(
        { success: false, message: 'Server payment configuration secret is missing.' },
        { status: 500 }
      );
    }

    // Direct HMAC-SHA256 algorithm verification
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const signatureBuf = Buffer.from(String(signature), 'utf-8');

    const isValid =
      expectedBuf.length === signatureBuf.length &&
      crypto.timingSafeEqual(expectedBuf, signatureBuf);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Payment verification failed: Signature mismatch.' },
        { status: 400 }
      );
    }

    // Process payment success (updates registration to verified and syncs candidate to GSheet)
    const result = await PaymentService.handlePaymentSuccess(
      registrationId,
      orderId,
      paymentId,
      signature
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully and registration confirmed.',
      registrationId: result.registrationId || registrationId,
      registrationNumber: result.registrationNumber,
      ticketId: result.ticketId,
    });
  } catch (error: any) {
    console.error('Verify payment API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Payment verification failed due to internal error.' },
      { status: 500 }
    );
  }
}
