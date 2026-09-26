import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  ConfirmationResult, 
  Auth 
} from 'firebase/auth';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export const FIREBASE_CONFIG_STORAGE_KEY = 'ordertracker_firebase_config';

// Default config from env or storage
export function getStoredFirebaseConfig(): FirebaseConfig | null {
  try {
    const saved = localStorage.getItem(FIREBASE_CONFIG_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse stored Firebase config:', e);
  }

  // Fallback to Vite env variables if present
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
  }

  return null;
}

export function saveFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(FIREBASE_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  const config = getStoredFirebaseConfig();
  if (!config || !config.apiKey) return null;

  try {
    if (!firebaseApp) {
      const existing = getApps();
      firebaseApp = existing.length > 0 ? getApp() : initializeApp(config);
    }
    if (!firebaseAuth) {
      firebaseAuth = getAuth(firebaseApp);
      firebaseAuth.useDeviceLanguage();
    }
    return firebaseAuth;
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
}

/**
 * Creates and initializes a RecaptchaVerifier on the specified container
 */
export function createRecaptchaVerifier(containerId: string, auth: Auth): RecaptchaVerifier {
  // Clear any existing verifier on window if necessary
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      // ignore
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired, please retry.');
    }
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Sends a real SMS verification code via Firebase Phone Authentication
 */
export async function sendFirebasePhoneOtp(
  phoneNumberE164: string, // format: "+919876543210"
  appVerifier: RecaptchaVerifier,
  auth: Auth
): Promise<ConfirmationResult> {
  return await signInWithPhoneNumber(auth, phoneNumberE164, appVerifier);
}
