import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';

export const isFirebaseAdminConfigured = (): boolean => {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  );
};

let cachedApp: App | null = null;
let cachedDb: Firestore | null = null;
let cachedAuth: Auth | null = null;

export async function getAdminDb(): Promise<Firestore | null> {
  if (typeof window !== 'undefined' || !isFirebaseAdminConfigured()) {
    return null;
  }
  if (cachedDb) return cachedDb;

  try {
    const { initializeApp, getApps, getApp, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');

    if (!cachedApp) {
      if (!getApps().length) {
        cachedApp = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        cachedApp = getApp();
      }
    }
    cachedDb = getFirestore(cachedApp);
    return cachedDb;
  } catch (err) {
    console.warn('Firebase Admin getAdminDb safe bypass:', err);
    return null;
  }
}

export async function getAdminAuth(): Promise<Auth | null> {
  if (typeof window !== 'undefined' || !isFirebaseAdminConfigured()) {
    return null;
  }
  if (cachedAuth) return cachedAuth;

  try {
    const { initializeApp, getApps, getApp, cert } = await import('firebase-admin/app');
    const { getAuth } = await import('firebase-admin/auth');

    if (!cachedApp) {
      if (!getApps().length) {
        cachedApp = initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          }),
        });
      } else {
        cachedApp = getApp();
      }
    }
    cachedAuth = getAuth(cachedApp);
    return cachedAuth;
  } catch (err) {
    console.warn('Firebase Admin getAdminAuth safe bypass:', err);
    return null;
  }
}
