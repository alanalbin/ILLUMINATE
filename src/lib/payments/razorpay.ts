import crypto from 'crypto';
import Razorpay from 'razorpay';
import { DataStore } from '@/lib/storage/data-store';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

export const isRazorpayConfigured = (): boolean => {
  return Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET && !RAZORPAY_KEY_ID.startsWith('rzp_test_placeholder'));
};

let razorpayClient: Razorpay | null = null;
if (isRazorpayConfigured()) {
  try {
    razorpayClient = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.warn('Failed to initialize Razorpay SDK:', err);
  }
}

export interface CreateOrderResult {
  success: boolean;
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string;
  isTestMode: boolean;
  notes?: Record<string, string>;
  error?: string;
}

export const PaymentService = {
  async createOrderForRegistration(registrationId: string): Promise<CreateOrderResult> {
    const registration = await DataStore.getRegistrationById(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    const eventConfig = await DataStore.getEventConfig();

    // Server-side authoritative fee calculation in integer paise
    const feePaise = Math.round(eventConfig.registrationFee * 100);

    // If live payments are not enabled, or Razorpay keys not provided, provide sandbox test order
    if (!isRazorpayConfigured() || !eventConfig.livePaymentsEnabled) {
      const mockOrderId = `order_test_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      
      // Update registration with order ID
      await DataStore.updateRegistration(registrationId, {
        orderId: mockOrderId,
        amountPaise: feePaise,
        paymentStatus: 'pending',
      });

      return {
        success: true,
        orderId: mockOrderId,
        amountPaise: feePaise,
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID || 'rzp_test_local_sandbox',
        isTestMode: true,
        notes: {
          registrationId,
          registrationNumber: registration.registrationNumber,
          eventId: eventConfig.id,
        },
      };
    }

    try {
      const options = {
        amount: feePaise,
        currency: 'INR',
        receipt: registration.registrationNumber,
        notes: {
          registrationId,
          registrationNumber: registration.registrationNumber,
          eventId: eventConfig.id,
        },
      };

      const order = await (razorpayClient as any).orders.create(options);

      await DataStore.updateRegistration(registrationId, {
        orderId: order.id,
        amountPaise: feePaise,
        paymentStatus: 'pending',
      });

      return {
        success: true,
        orderId: order.id,
        amountPaise: feePaise,
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID,
        isTestMode: RAZORPAY_KEY_ID.startsWith('rzp_test_'),
      };
    } catch (error: any) {
      console.error('Razorpay order creation error:', error);
      throw new Error(error?.message || 'Failed to initialize payment gateway order');
    }
  },

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    // In test sandbox without keys, accept test payment verification token
    if (!isRazorpayConfigured()) {
      return signature === `test_sig_${orderId}_${paymentId}` || signature.startsWith('mock_sig_');
    }

    try {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature));
    } catch (err) {
      console.error('Signature verification error:', err);
      return false;
    }
  },

  verifyWebhookSignature(rawBody: string, webhookSignature: string): boolean {
    if (!RAZORPAY_WEBHOOK_SECRET) {
      console.warn('RAZORPAY_WEBHOOK_SECRET is not configured');
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(webhookSignature));
    } catch (err) {
      console.error('Webhook signature verification error:', err);
      return false;
    }
  },

  async handlePaymentSuccess(
    registrationId: string,
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<{ success: boolean; message: string }> {
    const registration = await DataStore.getRegistrationById(registrationId);
    if (!registration) {
      return { success: false, message: 'Registration not found' };
    }

    // Idempotency check: if already verified, return true without double processing
    if (registration.paymentStatus === 'verified') {
      return { success: true, message: 'Payment already verified' };
    }

    const isValid = this.verifySignature(orderId, paymentId, signature);
    if (!isValid) {
      await DataStore.updateRegistration(registrationId, {
        paymentStatus: 'failed',
        adminNotes: `Signature verification failed for paymentId: ${paymentId}`,
      });
      await DataStore.recordAuditLog(
        'system',
        'system@illuminate.local',
        'PAYMENT_VERIFICATION_FAILED',
        'registration',
        registrationId,
        { orderId, paymentId }
      );
      return { success: false, message: 'Invalid payment signature' };
    }

    // Record verified payment record
    await DataStore.recordPayment({
      registrationId,
      provider: 'razorpay',
      providerOrderId: orderId,
      providerPaymentId: paymentId,
      providerSignature: signature,
      amountPaise: registration.amountPaise || 70000,
      currency: 'INR',
      status: 'captured',
      verifiedAt: new Date().toISOString(),
    });

    // Update registration status to verified and confirmed
    await DataStore.updateRegistration(registrationId, {
      status: 'confirmed',
      paymentStatus: 'verified',
      paymentMethod: 'razorpay',
      amountPaid: (registration.amountPaise || 70000) / 100,
      paymentId,
      confirmationSentAt: new Date().toISOString(),
    });

    await DataStore.recordAuditLog(
      'system',
      'system@illuminate.local',
      'PAYMENT_VERIFIED_SUCCESS',
      'registration',
      registrationId,
      { orderId, paymentId, amountINR: (registration.amountPaise || 70000) / 100 }
    );

    return { success: true, message: 'Payment verified and registration confirmed' };
  },
};
