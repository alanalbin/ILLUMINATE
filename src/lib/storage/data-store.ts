import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getAdminDb, isFirebaseAdminConfigured } from '@/lib/firebase/admin';
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

const isCloudServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const PRIMARY_DATA_DIR = isCloudServerless ? path.join('/tmp', '.data') : path.join(process.cwd(), '.data');
const PRIMARY_DB_FILE = path.join(PRIMARY_DATA_DIR, 'db.json');
const SECONDARY_DB_FILE = isCloudServerless
  ? path.join(process.cwd(), '.data', 'db.json')
  : path.join('/tmp', '.data', 'db.json');

interface LocalDatabase {
  eventConfig: EventConfig;
  registrations: Registration[];
  payments: PaymentRecord[];
  auditLogs: AuditLog[];
}

let inMemoryDb: LocalDatabase | null = null;

function getInitialLocalDb(): LocalDatabase {
  return {
    eventConfig: { ...DEFAULT_EVENT_CONFIG },
    registrations: [],
    payments: [],
    auditLogs: [],
  };
}

function readLocalDb(): LocalDatabase {
  let parsedFromDisk: LocalDatabase | null = null;

  // Try reading primary database file on disk
  try {
    if (fs.existsSync(PRIMARY_DB_FILE)) {
      const content = fs.readFileSync(PRIMARY_DB_FILE, 'utf-8');
      parsedFromDisk = JSON.parse(content) as LocalDatabase;
    }
  } catch (err) {
    console.warn('Error reading primary db file:', err);
  }

  // Cross-check secondary location if primary is missing or empty
  try {
    if (fs.existsSync(SECONDARY_DB_FILE)) {
      const altContent = fs.readFileSync(SECONDARY_DB_FILE, 'utf-8');
      const altParsed = JSON.parse(altContent) as LocalDatabase;
      if (altParsed && Array.isArray(altParsed.registrations) && altParsed.registrations.length > 0) {
        if (!parsedFromDisk) {
          parsedFromDisk = altParsed;
        } else {
          const existingIds = new Set(parsedFromDisk.registrations.map((r) => r.id));
          for (const reg of altParsed.registrations) {
            if (!existingIds.has(reg.id)) {
              parsedFromDisk.registrations.push(reg);
              existingIds.add(reg.id);
            }
          }
        }
      }
    }
  } catch {
    // Secondary fallback ignored
  }

  if (parsedFromDisk) {
    inMemoryDb = parsedFromDisk;
    return parsedFromDisk;
  }

  if (inMemoryDb) {
    return inMemoryDb;
  }

  const fallback = getInitialLocalDb();
  inMemoryDb = fallback;
  return fallback;
}

function writeLocalDb(db: LocalDatabase): void {
  inMemoryDb = db;
  // Write to primary database path
  try {
    if (!fs.existsSync(PRIMARY_DATA_DIR)) {
      fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Primary file write bypassed:', err);
  }

  // Mirror write to secondary database path for multi-worker/process consistency
  try {
    const secDir = path.dirname(SECONDARY_DB_FILE);
    if (!fs.existsSync(secDir)) {
      fs.mkdirSync(secDir, { recursive: true });
    }
    fs.writeFileSync(SECONDARY_DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch {
    // Secondary mirror ignored in restricted environments
  }
}

// Data Store Repository
export const DataStore = {
  async getEventConfig(): Promise<EventConfig> {
    if (isFirebaseAdminConfigured()) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          const doc = await adminDb.collection('events').doc('illuminate-kmct-2026').get();
          if (doc.exists && doc.data()) {
            return {
              ...DEFAULT_EVENT_CONFIG,
              ...doc.data(),
            } as EventConfig;
          }
          await adminDb.collection('events').doc('illuminate-kmct-2026').set(DEFAULT_EVENT_CONFIG);
          return DEFAULT_EVENT_CONFIG;
        }
      } catch (e) {
        console.warn('Firestore getEventConfig failed, falling back:', e);
      }
    }
    try {
      const local = readLocalDb();
      return {
        ...DEFAULT_EVENT_CONFIG,
        ...(local?.eventConfig || {}),
      };
    } catch {
      return DEFAULT_EVENT_CONFIG;
    }
  },

  async updateEventConfig(updates: Partial<EventConfig>): Promise<EventConfig> {
    const current = await this.getEventConfig();
    const updated: EventConfig = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAdminConfigured()) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          await adminDb.collection('events').doc('illuminate-kmct-2026').set(updated, { merge: true });
        }
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
    const id = `reg_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    // Pass and Ticket ID are strictly NOT issued until payment verification
    const newRegistration: Registration = {
      ...regData,
      id,
      registrationNumber: '', // Issued only after successful payment verification
      status: 'pending',
      paymentStatus: 'unpaid',
      amountPaid: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAdminConfigured()) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          await adminDb.collection('registrations').doc(id).set(newRegistration);
        }
      } catch (e) {
        console.warn('Firestore createRegistration failed:', e);
      }
    }

    local.registrations.unshift(newRegistration);
    writeLocalDb(local);
    return newRegistration;
  },

  async saveRegistrationDirect(registration: Registration): Promise<Registration> {
    if (isFirebaseAdminConfigured()) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          await adminDb.collection('registrations').doc(registration.id).set(registration, { merge: true });
        }
      } catch (e) {
        console.warn('Firestore saveRegistrationDirect failed:', e);
      }
    }
    const local = readLocalDb();
    const idx = local.registrations.findIndex(
      (r) => r.id === registration.id || (Boolean(registration.registrationNumber) && r.registrationNumber === registration.registrationNumber)
    );
    if (idx !== -1) {
      local.registrations[idx] = registration;
    } else {
      local.registrations.unshift(registration);
    }
    writeLocalDb(local);
    return registration;
  },

  async getRegistrationById(id: string): Promise<Registration | null> {
    if (!id) return null;
    const cleanId = String(id).trim();

    if (isFirebaseAdminConfigured()) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          const doc = await adminDb.collection('registrations').doc(cleanId).get();
          if (doc.exists) {
            return doc.data() as Registration;
          }
          // Query by ticket registrationNumber if valid ticket prefix
          if (cleanId.startsWith('ILM-')) {
            const numSnap = await adminDb
              .collection('registrations')
              .where('registrationNumber', '==', cleanId)
              .limit(1)
              .get();
            if (!numSnap.empty) {
              return numSnap.docs[0].data() as Registration;
            }
          }
          // Query by normalized email
          const emailSnap = await adminDb
            .collection('registrations')
            .where('normalizedEmail', '==', cleanId.toLowerCase())
            .limit(1)
            .get();
          if (!emailSnap.empty) {
            return emailSnap.docs[0].data() as Registration;
          }
        }
      } catch (e) {
        console.warn('Firestore getRegistrationById failed:', e);
      }
    }

    const local = readLocalDb();
    const cleanLower = cleanId.toLowerCase();
    return (
      local.registrations.find(
        (r) =>
          r.id === cleanId ||
          (Boolean(r.registrationNumber) && r.registrationNumber.toLowerCase() === cleanLower) ||
          r.email?.toLowerCase() === cleanLower ||
          r.phone === cleanId
      ) || null
    );
  },

  async getRegistrationByEmail(email: string): Promise<Registration | null> {
    if (!email) return null;
    const normalized = email.toLowerCase().trim();
    if (isFirebaseAdminConfigured()) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          const snapshot = await adminDb
            .collection('registrations')
            .where('normalizedEmail', '==', normalized)
            .limit(1)
            .get();
          if (!snapshot.empty) {
            return snapshot.docs[0].data() as Registration;
          }
        }
      } catch (e) {
        console.warn('Firestore getRegistrationByEmail failed:', e);
      }
    }
    const local = readLocalDb();
    return local.registrations.find((r) => r.normalizedEmail === normalized || r.email.toLowerCase() === normalized) || null;
  },

  async updateRegistration(id: string, updates: Partial<Registration>): Promise<Registration | null> {
    const current = await this.getRegistrationById(id);
    if (!current) return null;

    const updated: Registration = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (isFirebaseAdminConfigured()) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          await adminDb.collection('registrations').doc(current.id).update({
            ...updates,
            updatedAt: updated.updatedAt,
          });
        }
      } catch (e) {
        console.warn('Firestore updateRegistration failed:', e);
      }
    }

    const local = readLocalDb();
    const idx = local.registrations.findIndex(
      (r) => r.id === current.id || (Boolean(current.registrationNumber) && r.registrationNumber === current.registrationNumber)
    );
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

    if (isFirebaseAdminConfigured()) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          const snapshot = await adminDb.collection('registrations').orderBy('createdAt', 'desc').get();
          list = snapshot.docs.map((doc: any) => doc.data() as Registration);
        } else {
          list = readLocalDb().registrations;
        }
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

    if (isFirebaseAdminConfigured()) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          await adminDb.collection('payments').doc(id).set(record);
        }
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

    if (isFirebaseAdminConfigured()) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          await adminDb.collection('auditLogs').doc(id).set(log);
        }
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
    if (isFirebaseAdminConfigured()) {
      try {
        const adminDb = await getAdminDb();
        if (adminDb) {
          const snapshot = await adminDb.collection('auditLogs').orderBy('timestamp', 'desc').limit(limitCount).get();
          return snapshot.docs.map((d: any) => d.data() as AuditLog);
        }
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
