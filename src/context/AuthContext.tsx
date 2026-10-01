'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User as FirebaseUser,
} from 'firebase/auth';
import { getClientAuth } from '@/lib/firebase/client';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  sendMobileOtp: (
    phoneWithCountryCode: string,
    recaptchaVerifier: RecaptchaVerifier
  ) => Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }>;
  verifyOtp: (
    confirmationResult: ConfirmationResult,
    code: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoUser: (userData: Partial<AppUser>) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check localStorage for persisted user first
    try {
      const stored = localStorage.getItem('illuminate_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not read stored user', e);
    }

    const auth = getClientAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    // Check if user is returning from a Google redirect
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        const fbUser = result.user;
        const mappedUser: AppUser = {
          uid: fbUser.uid,
          displayName: fbUser.displayName,
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          photoURL: fbUser.photoURL,
        };
        setUser(mappedUser);
        try {
          localStorage.setItem('illuminate_user', JSON.stringify(mappedUser));
        } catch (_) {}
      }
    }).catch((e) => {
      console.warn('Redirect sign-in notice:', e);
    });

    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const mappedUser: AppUser = {
          uid: fbUser.uid,
          displayName: fbUser.displayName,
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          photoURL: fbUser.photoURL,
        };
        setUser(mappedUser);
        try {
          localStorage.setItem('illuminate_user', JSON.stringify(mappedUser));
        } catch (_) {}
      } else {
        const stored = localStorage.getItem('illuminate_user');
        if (!stored) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const signInWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const auth = getClientAuth();
      if (!auth) {
        throw new Error('Authentication is not initialized');
      }
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        const result = await signInWithPopup(auth, provider);
        const fbUser = result.user;
        const mappedUser: AppUser = {
          uid: fbUser.uid,
          displayName: fbUser.displayName,
          email: fbUser.email,
          phoneNumber: fbUser.phoneNumber,
          photoURL: fbUser.photoURL,
        };
        setUser(mappedUser);
        localStorage.setItem('illuminate_user', JSON.stringify(mappedUser));
        closeAuthModal();
        return { success: true };
      } catch (popupErr: any) {
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request') {
          await signInWithRedirect(auth, provider);
          return { success: true };
        }
        throw popupErr;
      }
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in with Google. Please check your connection.',
      };
    }
  };

  const sendMobileOtp = async (
    phoneWithCountryCode: string,
    recaptchaVerifier: RecaptchaVerifier
  ): Promise<{ success: boolean; confirmationResult?: ConfirmationResult; error?: string }> => {
    try {
      const auth = getClientAuth();
      if (!auth) {
        throw new Error('Authentication is not initialized');
      }
      const confirmationResult = await signInWithPhoneNumber(auth, phoneWithCountryCode, recaptchaVerifier);
      return { success: true, confirmationResult };
    } catch (error: any) {
      console.error('Mobile OTP Send Error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send OTP to mobile. Please verify the phone number.',
      };
    }
  };

  const verifyOtp = async (
    confirmationResult: ConfirmationResult,
    code: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await confirmationResult.confirm(code);
      const fbUser = result.user;
      const mappedUser: AppUser = {
        uid: fbUser.uid,
        displayName: fbUser.displayName || 'Illuminate Participant',
        email: fbUser.email,
        phoneNumber: fbUser.phoneNumber,
        photoURL: fbUser.photoURL,
      };
      setUser(mappedUser);
      localStorage.setItem('illuminate_user', JSON.stringify(mappedUser));
      closeAuthModal();
      return { success: true };
    } catch (error: any) {
      console.error('Verify OTP Error:', error);
      return {
        success: false,
        error: error.message || 'Invalid or expired OTP code. Please try again.',
      };
    }
  };

  const loginAsDemoUser = (userData: Partial<AppUser>) => {
    const demoUser: AppUser = {
      uid: 'user_' + Date.now(),
      displayName: userData.displayName || 'Verified Candidate',
      email: userData.email || 'student@kmct.edu.in',
      phoneNumber: userData.phoneNumber || '+919876543210',
      photoURL: userData.photoURL || null,
    };
    setUser(demoUser);
    try {
      localStorage.setItem('illuminate_user', JSON.stringify(demoUser));
    } catch (_) {}
    closeAuthModal();
  };

  const signOut = async () => {
    try {
      const auth = getClientAuth();
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (e) {
      console.warn('Sign out notice:', e);
    } finally {
      setUser(null);
      localStorage.removeItem('illuminate_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        signInWithGoogle,
        sendMobileOtp,
        verifyOtp,
        loginAsDemoUser,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
