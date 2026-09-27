import fs from 'fs';
import path from 'path';
import { adminDb, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';
import {
  EventConfig,
  Registration,
  PaymentRecord,
  AuditLog,
  DashboardMetrics,
  PaymentStatus,
  RegistrationStatus,
} from '@/types';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface LocalDatabase {
  eventConfig: EventConfig;
  registrations: Registration[];
  payments: PaymentRecord[];
  auditLogs: AuditLog[];
}

function getInitialLocalDb(): LocalDatabase {
  return {
    eventConfig: { ...DEFAULT_EVENT_CONFIG },
    registrations: [],
    payments: [],
    auditLogs: [],
  };
}

function readLocalDb(): LocalDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialLocalDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content) as LocalDatabase;
  } catch (err) {
    console.warn('Error reading local db fallback:', err);
    return getInitialLocalDb();
  }
}

function writeLocalDb(db: LocalDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local db fallback:', err);
  }
}

// Data Store Repository
export const DataStore = {
  async getEventConfig(): Promise<EventConfig> {
    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        const doc = await adminDb.collection('events').doc('illuminate-kmct-2026').get();
        if (doc.exists) {
          return doc.data() as EventConfig;
        }
        await adminDb.collection('events').doc('illuminate-kmct-2026').set(DEFAULT_EVENT_CONFIG);
        return DEFAULT_EVENT_CONFIG;
      } catch (e) {
        console.warn('Firestore getEventConfig failed, falling back:', e);
      }
    }
    const local = readLocalDb();
    return local.eventConfig || DEFAULT_EVENT_CONFIG;
  },

  async updateEventConfig(updates: Partial<EventConfig>): Promise<EventConfig> {
    const current = await this.getEventConfig();
    const updated: EventConfig = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb.collection('events').doc('illuminate-kmct-2026').set(updated, { merge: true });
      } catch (e) {
        console.warn('Firestore updateEventConfig failed:', e);
      }
    }

    const local = readLocalDb();
    local.eventConfig = updated;
    writeLocalDb(local);
    return updated;
  },

  async createRegistration(
    regData: Omit<Registration, 'id' | 'registrationNumber' | 'status' | 'paymentStatus' | 'amountPaid' | 'createdAt' | 'updatedAt'>
  ): Promise<Registration> {
    const local = readLocalDb();
    const count = local.registrations.length + 1;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regNumber = `ILL-KMCT-${1000 + count}-${randomSuffix}`;
    const id = `reg-${Date.now()}-${randomSuffix}`;

    const newRegistration: Registration = {
      ...regData,
      id,
      registrationNumber: regNumber,
      status: 'pending',
      paymentStatus: 'unpaid',
      amountPaid: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb.collection('registrations').doc(id).set(newRegistration);
      } catch (e) {
        console.warn('Firestore createRegistration failed:', e);
      }
    }

    local.registrations.unshift(newRegistration);
    writeLocalDb(local);
    return newRegistration;
  },

  async getRegistrationById(id: string): Promise<Registration | null> {
    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        const doc = await adminDb.collection('registrations').doc(id).get();
        if (doc.exists) {
          return doc.data() as Registration;
        }
      } catch (e) {
        console.warn('Firestore getRegistrationById failed:', e);
      }
    }
    const local = readLocalDb();
    return local.registrations.find((r) => r.id === id) || null;
  },

  async getRegistrationByEmail(email: string): Promise<Registration | null> {
    const normalized = email.toLowerCase().trim();
    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        const snapshot = await adminDb
          .collection('registrations')
          .where('normalizedEmail', '==', normalized)
          .limit(1)
          .get();
        if (!snapshot.empty) {
          return snapshot.docs[0].data() as Registration;
        }
      } catch (e) {
        console.warn('Firestore getRegistrationByEmail failed:', e);
      }
    }
    const local = readLocalDb();
    return local.registrations.find((r) => r.normalizedEmail === normalized) || null;
  },

  async updateRegistration(id: string, updates: Partial<Registration>): Promise<Registration | null> {
    const current = await this.getRegistrationById(id);
    if (!current) return null;

    const updated: Registration = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb.collection('registrations').doc(id).update({
          ...updates,
          updatedAt: updated.updatedAt,
        });
      } catch (e) {
        console.warn('Firestore updateRegistration failed:', e);
      }
    }

    const local = readLocalDb();
    const idx = local.registrations.findIndex((r) => r.id === id);
    if (idx !== -1) {
      local.registrations[idx] = updated;
      writeLocalDb(local);
    }
    return updated;
  },

  async listRegistrations(query?: {
    search?: string;
    paymentStatus?: PaymentStatus | 'all';
    status?: RegistrationStatus | 'all';
  }): Promise<Registration[]> {
    let list: Registration[] = [];

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        const snapshot = await adminDb.collection('registrations').orderBy('createdAt', 'desc').get();
        list = snapshot.docs.map((doc: any) => doc.data() as Registration);
      } catch (e) {
        console.warn('Firestore listRegistrations failed:', e);
        list = readLocalDb().registrations;
      }
    } else {
      list = readLocalDb().registrations;
    }

    if (query?.paymentStatus && query.paymentStatus !== 'all') {
      list = list.filter((r) => r.paymentStatus === query.paymentStatus);
    }
    if (query?.status && query.status !== 'all') {
      list = list.filter((r) => r.status === query.status);
    }
    if (query?.search) {
      const q = query.search.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.registrationNumber.toLowerCase().includes(q) ||
          (r.manualUtr && r.manualUtr.toLowerCase().includes(q))
      );
    }

    return list;
  },

  async recordPayment(paymentData: Omit<PaymentRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentRecord> {
    const id = `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record: PaymentRecord = {
      ...paymentData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb.collection('payments').doc(id).set(record);
      } catch (e) {
        console.warn('Firestore recordPayment failed:', e);
      }
    }

    const local = readLocalDb();
    local.payments.unshift(record);
    writeLocalDb(local);
    return record;
  },

  async recordAuditLog(
    actorUid: string,
    actorEmail: string,
    action: string,
    targetType: AuditLog['targetType'],
    targetId: string,
    details: Record<string, unknown>
  ): Promise<AuditLog> {
    const id = `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const log: AuditLog = {
      id,
      actorUid,
      actorEmail,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };

    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        await adminDb.collection('auditLogs').doc(id).set(log);
      } catch (e) {
        console.warn('Firestore recordAuditLog failed:', e);
      }
    }

    const local = readLocalDb();
    local.auditLogs.unshift(log);
    writeLocalDb(local);
    return log;
  },

  async getAuditLogs(limitCount = 50): Promise<AuditLog[]> {
    if (isFirebaseAdminConfigured() && adminDb) {
      try {
        const snapshot = await adminDb.collection('auditLogs').orderBy('timestamp', 'desc').limit(limitCount).get();
        return snapshot.docs.map((d: any) => d.data() as AuditLog);
      } catch (e) {
        console.warn('Firestore getAuditLogs failed:', e);
      }
    }
    const local = readLocalDb();
    return local.auditLogs.slice(0, limitCount);
  },

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const registrations = await this.listRegistrations();
    const config = await this.getEventConfig();

    const total = registrations.length;
    const paid = registrations.filter((r) => r.paymentStatus === 'verified').length;
    const pending = registrations.filter((r) => r.paymentStatus === 'pending' || r.paymentStatus === 'unpaid').length;
    const manualReview = registrations.filter((r) => r.paymentStatus === 'manual_review').length;
    const failed = registrations.filter((r) => r.paymentStatus === 'failed').length;
    const totalRevenueINR = paid * config.registrationFee;
    const targetCount = config.minimumTarget || 70;
    const percentOfTarget = Math.min(100, Math.round((paid / targetCount) * 100));

    return {
      totalRegistrations: total,
      paidRegistrations: paid,
      pendingRegistrations: pending,
      manualReviewRegistrations: manualReview,
      failedRegistrations: failed,
      targetCount,
      totalRevenueINR,
      percentOfTarget,
    };
  },
};
