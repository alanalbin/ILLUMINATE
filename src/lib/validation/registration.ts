import { z } from 'zod';

// Indian phone number regex: allows optional +91 or 0 followed by 10 digits starting with 6-9
const indianPhoneRegex = /^(?:(?:\+|0{0,2})91[\s-]?)?[6-9]\d{9}$/;

export const registrationFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: 'Full name must be at least 2 characters.' })
    .max(100, { message: 'Full name cannot exceed 100 characters.' }),
  email: z
    .string()
    .trim()
    .email({ message: 'Please enter a valid email address.' })
    .max(120, { message: 'Email address cannot exceed 120 characters.' })
    .transform((val) => val.toLowerCase()),
  phone: z
    .string()
    .trim()
    .refine((val) => indianPhoneRegex.test(val.replace(/\s+/g, '')), {
      message: 'Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).',
    })
    .transform((val) => {
      // Normalize to 10 digits
      const cleaned = val.replace(/\D/g, '');
      return cleaned.length > 10 ? cleaned.slice(-10) : cleaned;
    }),
  institution: z
    .string()
    .trim()
    .min(3, { message: 'Institution name must be at least 3 characters.' })
    .max(150, { message: 'Institution cannot exceed 150 characters.' })
    .default('KMCT College of Engineering for Emerging Technologies and Management, Kasaragod'),
  course: z
    .string()
    .trim()
    .min(2, { message: 'Please specify your department or degree program.' })
    .max(100, { message: 'Course name cannot exceed 100 characters.' }),
  yearOfStudy: z.enum(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate', 'Faculty / Other'], {
    message: 'Please select your current year of study.',
  }),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: 'You must accept the privacy policy and terms to proceed.',
  }),
});

export type RegistrationFormData = z.infer<typeof registrationFormSchema>;

export const manualUpiSubmissionSchema = z.object({
  registrationId: z.string().min(1, 'Registration ID is required'),
  utrNumber: z
    .string()
    .trim()
    .min(6, 'UTR / Transaction Reference must be at least 6 characters')
    .max(30, 'UTR / Transaction Reference must be under 30 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'UTR must only contain letters and numbers'),
  payerUpiId: z.string().trim().optional(),
});

export type ManualUpiSubmissionData = z.infer<typeof manualUpiSubmissionSchema>;
