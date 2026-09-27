import { describe, it, expect } from 'vitest';
import { registrationFormSchema, manualUpiSubmissionSchema } from '@/lib/validation/registration';

describe('Participant Registration Validation Schema', () => {
  it('successfully validates and sanitizes a complete participant registration', () => {
    const validData = {
      fullName: '  Rohit Krishna  ',
      email: '  Rohit.K@kmct.edu.in ',
      phone: '+91 9847123456',
      institution: 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod',
      course: 'Artificial Intelligence & Machine Learning',
      yearOfStudy: '3rd Year',
      privacyConsent: true,
    };

    const result = registrationFormSchema.safeParse(validData);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.fullName).toBe('Rohit Krishna');
      expect(result.data.email).toBe('rohit.k@kmct.edu.in');
      expect(result.data.phone).toBe('9847123456');
    }
  });

  it('rejects an invalid Indian mobile number', () => {
    const invalidPhoneData = {
      fullName: 'Aravind',
      email: 'aravind@kmct.edu.in',
      phone: '12345', // Too short and doesn't start with 6-9
      institution: 'KMCT',
      course: 'CSE',
      yearOfStudy: '2nd Year',
      privacyConsent: true,
    };

    const result = registrationFormSchema.safeParse(invalidPhoneData);
    expect(result.success).toBe(false);
    if (!result.success) {
      const formatted = result.error.format();
      expect(formatted.phone?._errors.length).toBeGreaterThan(0);
    }
  });

  it('rejects missing privacy consent', () => {
    const noConsentData = {
      fullName: 'Fathima',
      email: 'fathima@kmct.edu.in',
      phone: '9847123456',
      institution: 'KMCT',
      course: 'ECE',
      yearOfStudy: '1st Year',
      privacyConsent: false,
    };

    const result = registrationFormSchema.safeParse(noConsentData);
    expect(result.success).toBe(false);
  });
});

describe('Manual UPI UTR Submission Schema', () => {
  it('accepts a valid alphanumeric UTR', () => {
    const validUtr = {
      registrationId: 'reg-12345',
      utrNumber: 'UPI429019283741',
      payerUpiId: 'student@okaxis',
    };

    const result = manualUpiSubmissionSchema.safeParse(validUtr);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid short UTR or special characters', () => {
    const invalidUtr = {
      registrationId: 'reg-12345',
      utrNumber: '12-ab', // too short & contains hyphen
    };

    const result = manualUpiSubmissionSchema.safeParse(invalidUtr);
    expect(result.success).toBe(false);
  });
});
