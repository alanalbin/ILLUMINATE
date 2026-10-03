import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { PaymentService, getRazorpayKeySecret } from '@/lib/payments/razorpay';

describe('Payment Signature Verification Logic', () => {
  it('correctly accepts valid test sandbox tokens in test environment', () => {
    const orderId = 'order_test_1001';
    const paymentId = 'pay_test_2002';
    const testSignature = `test_sig_${orderId}_${paymentId}`;

    const isValid = PaymentService.verifySignature(orderId, paymentId, testSignature);
    expect(isValid).toBe(true);
  });

  it('correctly validates genuine HMAC-SHA256 signature generated with key secret', () => {
    const orderId = 'order_real_8877';
    const paymentId = 'pay_real_9922';
    const secret = getRazorpayKeySecret() || 'cE18hxV74WgU6ORozFzddzHb';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const isValid = PaymentService.verifySignature(orderId, paymentId, validSignature);
    expect(isValid).toBe(true);
  });

  it('rejects tampered or forged signatures', () => {
    const orderId = 'order_test_1001';
    const paymentId = 'pay_test_2002';
    const forgedSignature = 'forged_tampered_signature_token_00000000000000000000000000000000';

    const isValid = PaymentService.verifySignature(orderId, paymentId, forgedSignature);
    expect(isValid).toBe(false);
  });

  it('rejects empty or missing parameters', () => {
    expect(PaymentService.verifySignature('', 'pay_123', 'sig_123')).toBe(false);
    expect(PaymentService.verifySignature('order_123', '', 'sig_123')).toBe(false);
    expect(PaymentService.verifySignature('order_123', 'pay_123', '')).toBe(false);
  });
});
