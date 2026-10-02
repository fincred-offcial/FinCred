import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import fs from 'fs';
import path from 'path';

// Read firebase-applet-config.json safely from process.cwd()
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
let firebaseConfig: any = {};
try {
  const raw = fs.readFileSync(configPath, 'utf-8');
  firebaseConfig = JSON.parse(raw);
} catch (e) {
  console.error('Failed to read firebase-applet-config.json in server:', e);
}

const serverApp = !getApps().length ? initializeApp(firebaseConfig, 'server') : getApp('server');

export const serverDb = firebaseConfig.firestoreDatabaseId
  ? getFirestore(serverApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(serverApp);

export const serverAuth = getAuth(serverApp);
export default serverApp;
