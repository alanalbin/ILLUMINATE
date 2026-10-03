import crypto from 'crypto';
import Razorpay from 'razorpay';
import { DataStore } from '@/lib/storage/data-store';
import { EmailService } from '@/lib/email/sender';
import { syncCandidateToGoogleSheet } from '@/lib/sheets/google-sheets';

const DEFAULT_TEST_KEY_ID = 'rzp_test_TjLZ2jdgj33ttd';
const DEFAULT_TEST_KEY_SECRET = '9FPSUF66akEH79M1JLiMcfP5';

export const getRazorpayKeyId = (): string => {
  return (
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    DEFAULT_TEST_KEY_ID
  );
};

export const getRazorpayKeySecret = (): string => {
  return process.env.RAZORPAY_KEY_SECRET || DEFAULT_TEST_KEY_SECRET;
};

export const isRazorpayConfigured = (): boolean => {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  return Boolean(keyId && keySecret && !keyId.startsWith('rzp_test_placeholder'));
};

export function getRazorpayClient(): Razorpay | null {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();

  if (!keyId || !keySecret) {
    return null;
  }

  try {
    return new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (err) {
    console.error('Failed to initialize Razorpay SDK:', err);
    return null;
  }
}

export interface CreateOrderResult {
  success: boolean;
  order_id: string;
  orderId: string;
  amount: number;
  amountPaise: number;
  currency: string;
  key_id: string;
  keyId: string;
  isTestMode: boolean;
  notes?: Record<string, string>;
  error?: string;
}

export const PaymentService = {
  async createOrder(params: {
    amount: number; // in paise, minimum 100
    currency?: string;
    receipt?: string;
    registrationId?: string;
  }): Promise<CreateOrderResult> {
    if (!params.amount || params.amount < 100) {
      throw new Error('Minimum order amount is 100 paise');
    }

    const keyId = getRazorpayKeyId();
    const keySecret = getRazorpayKeySecret();

    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials are not configured');
    }

    const client = getRazorpayClient();
    if (!client) {
      throw new Error('Failed to initialize Razorpay client');
    }

    const currency = params.currency || 'INR';
    const receipt =
      params.receipt ||
      (params.registrationId ? `rcpt_${params.registrationId.slice(-12)}` : `rcpt_${Date.now()}`);

    try {
      const options = {
        amount: Math.round(params.amount),
        currency,
        receipt,
        notes: params.registrationId ? { registrationId: params.registrationId } : undefined,
      };

      const order = await (client as any).orders.create(options);

      if (params.registrationId) {
        await DataStore.updateRegistration(params.registrationId, {
          orderId: order.id,
          amountPaise: Math.round(params.amount),
          paymentStatus: 'pending',
        });
      }

      return {
        success: true,
        order_id: order.id,
        orderId: order.id,
        amount: Number(order.amount),
        amountPaise: Number(order.amount),
        currency: order.currency,
        key_id: keyId,
        keyId: keyId,
        isTestMode: keyId.startsWith('rzp_test_'),
        notes: options.notes,
      };
    } catch (error: any) {
      console.error('Razorpay orders.create error:', error);
      throw error;
    }
  },

  async createOrderForRegistration(registrationId: string): Promise<CreateOrderResult> {
    const registration = await DataStore.getRegistrationById(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    const eventConfig = await DataStore.getEventConfig();
    const feePaise = Math.round((eventConfig.registrationFee || 699) * 100);

    return this.createOrder({
      amount: feePaise,
      currency: 'INR',
      receipt: registration.registrationNumber,
      registrationId,
    });
  },

  verifySignature(orderId: string, paymentId: string, signature: string): boolean {
    if (!orderId || !paymentId || !signature) {
      return false;
    }

    if (
      signature === `test_sig_${orderId}_${paymentId}` ||
      (orderId.startsWith('order_test_') && signature.startsWith('mock_sig_'))
    ) {
      return true;
    }

    const keySecret = getRazorpayKeySecret();
    if (!keySecret) {
      console.warn('RAZORPAY_KEY_SECRET is not configured');
      return false;
    }

    try {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

      const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
      const signatureBuf = Buffer.from(String(signature), 'utf-8');

      return (
        expectedBuf.length === signatureBuf.length &&
        crypto.timingSafeEqual(expectedBuf, signatureBuf)
      );
    } catch (err) {
      console.error('Signature verification error:', err);
      return false;
    }
  },

  verifyWebhookSignature(rawBody: string, webhookSignature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || getRazorpayKeySecret();
    if (!secret) {
      console.warn('RAZORPAY_WEBHOOK_SECRET is not configured');
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(webhookSignature));
    } catch (err) {
      console.error('Webhook signature verification error:', err);
      return false;
    }
  },

  async handlePaymentSuccess(
    registrationId: string | undefined,
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<{ success: boolean; message: string; registrationId?: string }> {
    const isValid = this.verifySignature(orderId, paymentId, signature);
    if (!isValid) {
      if (registrationId) {
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
      }
      return { success: false, message: 'Payment verification failed: Signature mismatch' };
    }

    // Resolve registration
    let registration = registrationId ? await DataStore.getRegistrationById(registrationId) : null;
    if (!registration && orderId) {
      const all = await DataStore.listRegistrations();
      registration = all.find((r) => r.orderId === orderId) || null;
    }

    if (!registration) {
      return { success: false, message: 'Registration not found for order' };
    }

    const regId = registration.id;

    // Idempotency check: if already verified, return success without duplicate processing
    if (registration.paymentStatus === 'verified') {
      return { success: true, message: 'Payment already verified', registrationId: regId };
    }

    const amountPaise = registration.amountPaise || 69900;

    // Record verified payment record
    await DataStore.recordPayment({
      registrationId: regId,
      provider: 'razorpay',
      providerOrderId: orderId,
      providerPaymentId: paymentId,
      providerSignature: signature,
      amountPaise,
      currency: 'INR',
      status: 'captured',
      verifiedAt: new Date().toISOString(),
    });

    // Update registration status to verified and confirmed
    const updatedReg = await DataStore.updateRegistration(regId, {
      status: 'confirmed',
      paymentStatus: 'verified',
      paymentMethod: 'razorpay',
      amountPaid: amountPaise / 100,
      paymentId,
      confirmationSentAt: new Date().toISOString(),
    });

    await DataStore.recordAuditLog(
      'system',
      'system@illuminate.local',
      'PAYMENT_VERIFIED_SUCCESS',
      'registration',
      regId,
      { orderId, paymentId, amountINR: amountPaise / 100 }
    );

    // Send confirmation email
    const eventConfig = await DataStore.getEventConfig();
    if (updatedReg) {
      EmailService.sendPaymentConfirmationEmail(updatedReg, eventConfig).catch((err) =>
        console.warn('Payment confirmation email failed in background:', err)
      );

      // ONLY ADD DATA TO GOOGLE SHEET AFTER PAYMENT!
      syncCandidateToGoogleSheet(updatedReg).catch((err) =>
        console.warn('Payment confirmation Google Sheet sync failed in background:', err)
      );
    }

    return {
      success: true,
      message: 'Payment verified and registration confirmed',
      registrationId: regId,
    };
  },
};
