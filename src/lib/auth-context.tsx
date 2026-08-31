"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "@/lib/firebase";

const DEMO_USER_KEY = "scholarlens-demo-user";

// Create a mock User-like object from localStorage demo data
function getDemoUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(DEMO_USER_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
      emailVerified: true,
      isAnonymous: false,
      metadata: {} as User["metadata"],
      providerData: [],
      refreshToken: "",
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => "",
      getIdTokenResult: async (_forceRefresh?: boolean) => ({} as never),
      reload: async () => {},
      toJSON: () => ({}),
      providerId: "google.com",
    } as unknown as User;
  } catch {
    return null;
  }
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  isDemoMode: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check for demo mode first
    const demoUser = getDemoUser();
    if (demoUser) {
      setUser(demoUser);
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    // Check if Firebase auth is available
    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (!auth) {
      // Demo mode fallback
      const mockUser = {
        uid: "demo-user-001",
        email: "demo@scholarlens.app",
        displayName: "Demo Student",
        photoURL: null,
      };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
      window.location.reload();
      return;
    }
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    // Clear demo mode
    localStorage.removeItem(DEMO_USER_KEY);
    setIsDemoMode(false);

    const auth = getFirebaseAuth();
    if (auth) {
      await firebaseSignOut(auth);
    }
    setUser(null);
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
