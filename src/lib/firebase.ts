import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    ? undefined
    : undefined,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only on client side
function getApp() {
  if (typeof window === "undefined") return null;
  if (getApps().length > 0) return getApps()[0];
  return initializeApp(firebaseConfig);
}

function getFirebaseAuth() {
  const app = getApp();
  if (!app) return null;
  return getAuth(app);
}

function getFirebaseFirestore() {
  const app = getApp();
  if (!app) return null;
  return getFirestore(app);
}

export const googleProvider = new GoogleAuthProvider();

let analytics: ReturnType<typeof getAnalytics> | null = null;
export async function getFirebaseAnalytics() {
  if (typeof window === "undefined") return null;
  if (analytics) return analytics;
  const supported = await isSupported();
  if (supported) {
    analytics = getAnalytics(getApp()!);
  }
  return analytics;
}

export { getApp, getFirebaseAuth, getFirebaseFirestore };
