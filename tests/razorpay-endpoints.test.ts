import { describe, it, expect, beforeEach } from 'vitest';
import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { POST as createOrderPOST } from '@/app/api/create-order/route';
import { POST as verifyPaymentPOST } from '@/app/api/verify-payment/route';
import { DataStore } from '@/lib/storage/data-store';
import { getRazorpayKeySecret } from '@/lib/payments/razorpay';

describe('Razorpay Standard Checkout API Endpoints', () => {
  let testRegistrationId: string;

  beforeEach(async () => {
    const reg = await DataStore.createRegistration({
      fullName: 'Test Participant',
      email: `test_${Date.now()}@kmct.edu.in`,
      normalizedEmail: `test_${Date.now()}@kmct.edu.in`,
      phone: '9876543210',
      institution: 'KMCT College',
      course: 'B.Tech CSE',
      yearOfStudy: '3rd Year',
      eventId: 'illuminate-kmct-2026',
      paymentMethod: 'none',
      amountPaise: 69900,
      currency: 'INR',
    });
    testRegistrationId = reg.id;
  });

  describe('POST /api/create-order', () => {
    it('rejects orders below minimum 100 paise with status 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 50, // below 100 paise
          currency: 'INR',
        }),
      });

      const res = await createOrderPOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('Minimum amount is 100 paise');
    });

    it('rejects requests with missing or invalid amounts', async () => {
      const req = new NextRequest('http://localhost:3000/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 'invalid',
        }),
      });

      const res = await createOrderPOST(req);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/verify-payment', () => {
    it('returns status 400 when required fields are missing', async () => {
      const req = new NextRequest('http://localhost:3000/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: 'order_123',
          // missing payment_id and signature
        }),
      });

      const res = await verifyPaymentPOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('Missing required');
    });

    it('returns status 400 and does NOT mark as paid on signature mismatch', async () => {
      const orderId = 'order_test_mismatch_100';
      const paymentId = 'pay_test_mismatch_200';
      const forgedSig = 'tampered_signature_hex_0000000000000000000000000000000000000000000000000000000000000000';

      const req = new NextRequest('http://localhost:3000/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: testRegistrationId,
          order_id: orderId,
          payment_id: paymentId,
          signature: forgedSig,
        }),
      });

      const res = await verifyPaymentPOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain('Signature mismatch');

      // Verify registration was NOT marked as verified
      const reg = await DataStore.getRegistrationById(testRegistrationId);
      expect(reg?.paymentStatus).not.toBe('verified');
    });

    it('returns status 200 and confirms registration when HMAC-SHA256 signature is valid', async () => {
      const orderId = `order_${Date.now()}`;
      const paymentId = `pay_${Date.now()}`;
      const secret = getRazorpayKeySecret() || 'cE18hxV74WgU6ORozFzddzHb';

      const validSignature = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const req = new NextRequest('http://localhost:3000/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: testRegistrationId,
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: validSignature,
        }),
      });

      const res = await verifyPaymentPOST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);

      // Verify registration is now confirmed & verified with official Ticket ID issued
      const reg = await DataStore.getRegistrationById(testRegistrationId);
      expect(reg?.paymentStatus).toBe('verified');
      expect(reg?.status).toBe('confirmed');
      expect(reg?.paymentMethod).toBe('razorpay');
      expect(reg?.registrationNumber).toMatch(/^ILM-KMCT-/);
      expect(data.registrationNumber).toMatch(/^ILM-KMCT-/);
      expect(data.ticketId).toMatch(/^ILM-KMCT-/);
    });
  });

  describe('Post-Payment Exclusivity Rules', () => {
    it('does NOT assign or expose Ticket ID prior to payment', async () => {
      const unpaidReg = await DataStore.getRegistrationById(testRegistrationId);
      expect(unpaidReg?.paymentStatus).toBe('unpaid');
      expect(unpaidReg?.registrationNumber || '').toBe('');
    });

    it('rejects syncing candidate details to Google Sheets if payment is unpaid', async () => {
      const { syncCandidateToGoogleSheet } = await import('@/lib/sheets/google-sheets');
      const unpaidReg = await DataStore.getRegistrationById(testRegistrationId);
      expect(unpaidReg).toBeDefined();

      const result = await syncCandidateToGoogleSheet(unpaidReg!);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not completed or verified');
    });
  });
});
