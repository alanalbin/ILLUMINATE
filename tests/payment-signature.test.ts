import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { PaymentService } from '@/lib/payments/razorpay';

describe('Payment Signature Verification Logic', () => {
  it('correctly accepts valid test sandbox tokens', () => {
    const orderId = 'order_test_1001';
    const paymentId = 'pay_test_2002';
    const testSignature = `test_sig_${orderId}_${paymentId}`;

    const isValid = PaymentService.verifySignature(orderId, paymentId, testSignature);
    expect(isValid).toBe(true);
  });

  it('rejects tampered or forged signatures', () => {
    const orderId = 'order_test_1001';
    const paymentId = 'pay_test_2002';
    const forgedSignature = 'forged_tampered_signature_token';

    const isValid = PaymentService.verifySignature(orderId, paymentId, forgedSignature);
    expect(isValid).toBe(false);
  });
});
