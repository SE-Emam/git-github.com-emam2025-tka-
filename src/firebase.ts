import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '@/firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

// Messaging may not be supported in all environments (e.g. iFrames)
export const getMessagingInstance = async () => {
  try {
    if (typeof window !== 'undefined' && await isSupported()) {
      return getMessaging(app);
    }
  } catch (err) {
    console.warn("Firebase Messaging is not supported in this environment:", err);
  }
  return null;
};

// Enable Offline Persistence
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Persistence failed: Browser not supported');
    }
  });
}

export const googleProvider = new GoogleAuthProvider();

export default app;
