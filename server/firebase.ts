import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import fs from 'fs';
import path from 'path';

let firebaseConfig: any = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'phrasal-operator-lt3g1',
  appId: process.env.FIREBASE_APP_ID || '1:482042051980:web:bfe278994fa8d95f5f6aa9',
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyBKjYSeGRGyy6S2f1zosuz2HCGnYq0upv8',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'phrasal-operator-lt3g1.firebaseapp.com',
  firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || 'ai-studio-fincred-88978bce-70ea-421a-9ee3-0bc0aaba8b22',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'phrasal-operator-lt3g1.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '482042051980'
};

// Check for FIREBASE_CONFIG JSON string in environment
if (process.env.FIREBASE_CONFIG) {
  try {
    const parsed = JSON.parse(process.env.FIREBASE_CONFIG);
    firebaseConfig = { ...firebaseConfig, ...parsed };
  } catch (e) {
    console.warn('Could not parse FIREBASE_CONFIG env variable:', e);
  }
} else {
  // Read firebase-applet-config.json if present
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const diskConfig = JSON.parse(raw);
      firebaseConfig = { ...firebaseConfig, ...diskConfig };
    } catch (e) {
      console.warn('Notice: Could not parse firebase-applet-config.json:', e);
    }
  }
}

const serverApp = !getApps().length ? initializeApp(firebaseConfig, 'server') : getApp('server');

export const serverDb = (process.env.FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId)
  ? getFirestore(serverApp, process.env.FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId)
  : getFirestore(serverApp);

export const serverAuth = getAuth(serverApp);
export default serverApp;
