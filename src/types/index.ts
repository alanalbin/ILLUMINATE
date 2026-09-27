export interface EventContact {
  name: string;
  email: string;
  phone: string;
  role?: string;
}

export interface WorkshopSpeaker {
  name: string;
  role: string;
  organization?: string;
  topic?: string;
  confirmed: boolean;
}

export interface EventBenefit {
  id: string;
  title: string;
  description: string;
  verified: boolean;
  condition?: string;
  iconName?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'registration' | 'payment' | 'event';
}

export interface EventConfig {
  id: string;
  title: string;
  tagline: string;
  description: string;
  durationHours: number;
  hostInstitution: string;
  locationCity: string;
  locationState: string;
  associatedInitiative: string;
  officialWebsite: string;
  
  // Schedule & Venue (Unconfirmed by default, to be announced / editable by admin)
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  venue: string;
  roomNumber: string | null;
  registrationClosingDate: string | null;
  
  // Pricing & Capacities
  registrationFee: number; // in INR e.g. 699
  registrationFeePaise: number; // 69900
  officialDiscountFee: number; // 699
  discountDeadline: string; // "30 September 2026"
  priceDiscrepancyAcknowledged: boolean;
  livePaymentsEnabled: boolean;
  minimumTarget: number; // 70 participants minimum target
  capacity: number | null; // Configured separately from target
  
  // Payment Gateways & Manual UPI
  razorpayKeyId?: string;
  upiId: string;
  upiMerchantName: string;
  
  // Contacts
  officialContact: EventContact;
  localCoordinator: EventContact | null;
  
  // Additional configurable details
  speakers: WorkshopSpeaker[];
  benefits: EventBenefit[];
  faq: FaqItem[];
  published: boolean;
  updatedAt: string;
}

export type RegistrationStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'verified' | 'failed' | 'manual_review';
export type PaymentMethod = 'razorpay' | 'manual_upi' | 'none';

export interface Registration {
  id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  normalizedEmail: string;
  phone: string;
  institution: string;
  course: string;
  yearOfStudy: string;
  eventId: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  amountPaise: number;
  currency: 'INR';
  orderId?: string;
  paymentId?: string;
  manualUtr?: string;
  manualUpiScreenshotUrl?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  confirmationSentAt?: string;
}

export interface PaymentRecord {
  id: string;
  registrationId: string;
  provider: 'razorpay' | 'manual_upi';
  providerOrderId?: string;
  providerPaymentId?: string;
  providerSignature?: string;
  amountPaise: number;
  currency: 'INR';
  status: 'created' | 'attempted' | 'captured' | 'failed' | 'awaiting_approval' | 'refunded';
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'superadmin' | 'organizer';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  targetType: 'event' | 'registration' | 'payment' | 'admin';
  targetId: string;
  details: Record<string, unknown>;
  timestamp: string;
}

export interface DashboardMetrics {
  totalRegistrations: number;
  paidRegistrations: number;
  pendingRegistrations: number;
  manualReviewRegistrations: number;
  failedRegistrations: number;
  targetCount: number;
  totalRevenueINR: number;
  percentOfTarget: number;
}
