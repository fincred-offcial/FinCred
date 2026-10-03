import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

let config: any = {
  projectId: 'phrasal-operator-lt3g1',
  appId: '1:482042051980:web:bfe278994fa8d95f5f6aa9',
  apiKey: 'AIzaSyBKjYSeGRGyy6S2f1zosuz2HCGnYq0upv8',
  authDomain: 'phrasal-operator-lt3g1.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-fincred-88978bce-70ea-421a-9ee3-0bc0aaba8b22',
  storageBucket: 'phrasal-operator-lt3g1.firebasestorage.app',
  messagingSenderId: '482042051980'
};

// Check for client-side environment overrides
if (import.meta.env.VITE_FIREBASE_CONFIG) {
  try {
    config = { ...config, ...JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG) };
  } catch (e) {
    console.warn('Could not parse VITE_FIREBASE_CONFIG:', e);
  }
} else if (import.meta.env.VITE_FIREBASE_PROJECT_ID) {
  config = {
    ...config,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || config.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || config.authDomain,
    firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || config.firestoreDatabaseId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || config.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || config.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || config.appId
  };
}

const app = !getApps().length ? initializeApp(config) : getApp();

export const db = (config.firestoreDatabaseId)
  ? getFirestore(app, config.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export default app;
