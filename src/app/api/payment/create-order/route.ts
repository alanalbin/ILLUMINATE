import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/razorpay';

export async function POST(req: NextRequest) {
  try {
    const { registrationId } = await req.json();

    if (!registrationId) {
      return NextResponse.json(
        { success: false, message: 'Registration ID is required' },
        { status: 400 }
      );
    }

    const orderResult = await PaymentService.createOrderForRegistration(registrationId);

    return NextResponse.json(orderResult);
  } catch (error: any) {
    console.error('Create order API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to initialize payment gateway order' },
      { status: 500 }
    );
  }
}
