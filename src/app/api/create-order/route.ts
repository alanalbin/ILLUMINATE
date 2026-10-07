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
    let { amount, currency = 'INR', receipt, registrationId, registration, registrationData } = body;

    const candidateRecord = registration || registrationData;
    if (candidateRecord && (candidateRecord.email || candidateRecord.fullName)) {
      try {
        await DataStore.saveRegistrationDirect({
          ...candidateRecord,
          id: candidateRecord.id || registrationId || `reg_${Date.now()}`,
        });
      } catch (err) {
        console.warn('Could not persist registration in create-order:', err);
      }
    }

    // If registrationId is provided but amount is missing, resolve authoritative amount
    if ((!amount || typeof amount !== 'number') && registrationId) {
      const reg = await DataStore.getRegistrationById(registrationId);
      const eventConfig = await DataStore.getEventConfig();
      amount = reg?.amountPaise || Math.round((eventConfig.registrationFee || 699) * 100);
      if (!receipt && reg) {
        receipt = reg.registrationNumber || reg.id.slice(-40);
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
      candidate: candidateRecord,
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
    if (
      error?.statusCode === 401 ||
      (error?.error?.code === 'BAD_REQUEST_ERROR' && error?.message?.includes('auth')) ||
      error?.message?.includes('Authentication failed')
    ) {
      return NextResponse.json(
        {
          success: false,
          isAuthError: true,
          message:
            'Razorpay authentication failed: The provided Key ID or Key Secret is invalid or expired. Please regenerate your Test Key in Razorpay Dashboard > Settings > API Keys.',
        },
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
