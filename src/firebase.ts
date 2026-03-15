/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
};

// Validate config before initialization
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

if (!isConfigValid) {
  console.warn(
    "⚠️ Firebase Configuration Missing: Please set your VITE_FIREBASE_* environment variables in the Settings menu. " +
    "The app will remain in a limited state until configured."
  );
}

const app = isConfigValid ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : ({} as any);
export const db = app ? getFirestore(app, import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || '(default)') : ({} as any);

export default app;
