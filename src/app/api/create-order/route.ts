import { NextRequest, NextResponse } from 'next/server';
import { PaymentService, getRazorpayKeyId, getRazorpayKeySecret } from '@/lib/payments/razorpay';
import { DataStore } from '@/lib/storage/data-store';

export async function POST(req: NextRequest) {
  try {
    const keyId = getRazorpayKeyId();
    const keySecret = getRazorpayKeySecret();

    if (!keyId || !keySecret) {
      return NextResponse.json(
        { success: false, message: 'Razorpay API credentials not configured.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    let { amount, currency = 'INR', receipt, registrationId } = body;

    // If registrationId is provided but amount is missing, resolve authoritative amount
    if ((!amount || typeof amount !== 'number') && registrationId) {
      const reg = await DataStore.getRegistrationById(registrationId);
      const eventConfig = await DataStore.getEventConfig();
      amount = reg?.amountPaise || Math.round((eventConfig.registrationFee || 699) * 100);
      if (!receipt && reg) {
        receipt = reg.registrationNumber;
      }
    }

    // Amount validation
    if (!amount || typeof amount !== 'number' || amount < 100) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid amount. Minimum amount is 100 paise (₹1.00).',
        },
        { status: 400 }
      );
    }

    const orderResult = await PaymentService.createOrder({
      amount: Math.round(amount),
      currency: currency || 'INR',
      receipt: receipt || (registrationId ? `rcpt_${registrationId.slice(-10)}` : `rcpt_${Date.now()}`),
      registrationId,
    });

    return NextResponse.json({
      success: true,
      order_id: orderResult.order_id,
      amount: orderResult.amount,
      currency: orderResult.currency,
      key_id: keyId,
      keyId: keyId,
      orderId: orderResult.order_id,
    });
  } catch (error: any) {
    console.error('Razorpay create-order API error:', error);

    // Check for authentication error from Razorpay
    if (error?.statusCode === 401 || error?.error?.code === 'BAD_REQUEST_ERROR' && error?.message?.includes('auth')) {
      return NextResponse.json(
        { success: false, message: 'Razorpay authentication failed. Please verify API keys.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to create Razorpay order',
        error: error?.description || error?.error?.description || undefined,
      },
      { status: 500 }
    );
  }
}
