import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  ReceiptDocument,
  ClientInfo,
  CompanyInfo,
  AppUser,
  FirebaseConfigSettings,
} from '../types';

const CLOUD_CONFIG_STORAGE_KEY = 'receipt_cloud_config_v1';
const LOCAL_USER_STORAGE_KEY = 'receipt_local_simulated_user_v1';

// Read config from environment variables (Vercel) or localStorage (in-app setup)
export const getFirebaseConfig = (): FirebaseConfigSettings | null => {
  try {
    const localSaved = localStorage.getItem(CLOUD_CONFIG_STORAGE_KEY);
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read saved Firebase config:', e);
  }

  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
    };
  }

  return null;
};

export const saveCustomFirebaseConfig = (config: FirebaseConfigSettings): void => {
  localStorage.setItem(CLOUD_CONFIG_STORAGE_KEY, JSON.stringify(config));
};

export const clearCustomFirebaseConfig = (): void => {
  localStorage.removeItem(CLOUD_CONFIG_STORAGE_KEY);
};

export const isFirebaseConfigured = (): boolean => {
  return getFirebaseConfig() !== null;
};

// Initialize Firebase App
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

const initFirebase = () => {
  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    authInstance = getAuth(appInstance);
    dbInstance = getFirestore(appInstance);
    return { app: appInstance, auth: authInstance, db: dbInstance };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    return null;
  }
};

// Trigger early init
initFirebase();

const mapFirebaseUser = (user: FirebaseUser): AppUser => {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || user.email?.split('@')[0] || 'User',
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
  };
};

// ==========================================
// AUTHENTICATION METHODS
// ==========================================

export const signUpWithEmail = async (
  email: string,
  pass: string,
  displayName?: string
): Promise<AppUser> => {
  const fb = initFirebase();
  if (fb?.auth) {
    const cred = await createUserWithEmailAndPassword(fb.auth, email, pass);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    return mapFirebaseUser(cred.user);
  }

  // Local-only simulated auth fallback (when Firebase is not yet configured)
  const simulatedUser: AppUser = {
    uid: 'local_' + btoa(email.toLowerCase()).replace(/=/g, ''),
    email,
    displayName: displayName || email.split('@')[0],
  };
  localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(simulatedUser));
  return simulatedUser;
};

export const signInWithEmail = async (email: string, pass: string): Promise<AppUser> => {
  const fb = initFirebase();
  if (fb?.auth) {
    const cred = await signInWithEmailAndPassword(fb.auth, email, pass);
    return mapFirebaseUser(cred.user);
  }

  // Local fallback
  const simulatedUser: AppUser = {
    uid: 'local_' + btoa(email.toLowerCase()).replace(/=/g, ''),
    email,
    displayName: email.split('@')[0],
  };
  localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(simulatedUser));
  return simulatedUser;
};

export const sendResetPassword = async (email: string): Promise<void> => {
  const fb = initFirebase();
  if (fb?.auth) {
    await sendPasswordResetEmail(fb.auth, email);
    return;
  }
  // Simulated success
  return;
};

export const signOutUser = async (): Promise<void> => {
  const fb = initFirebase();
  if (fb?.auth) {
    await signOut(fb.auth);
  }
  localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
};

export const subscribeToAuth = (callback: (user: AppUser | null) => void): (() => void) => {
  const fb = initFirebase();
  if (fb?.auth) {
    const unsub = onAuthStateChanged(fb.auth, (user) => {
      if (user) {
        callback(mapFirebaseUser(user));
      } else {
        // Check if there was a local simulated user
        const local = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
        callback(local ? JSON.parse(local) : null);
      }
    });
    return unsub;
  }

  // Local simulated user listener
  const local = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
  callback(local ? JSON.parse(local) : null);
  return () => {};
};

// ==========================================
// REAL-TIME FIRESTORE MULTI-DEVICE SYNC
// ==========================================

/**
 * Subscribes to the user's documents in Firestore.
 * Automatically splits results into active documents and deleted documents (for recovery).
 * Real-time updates occur across all open devices (phone, laptop, desktop).
 */
export const subscribeToCloudDocuments = (
  userId: string,
  onActiveDocs: (docs: ReceiptDocument[]) => void,
  onDeletedDocs: (docs: ReceiptDocument[]) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  const fb = initFirebase();
  if (!fb?.db || userId.startsWith('local_')) {
    // Firebase not connected or local mode
    return () => {};
  }

  const docsRef = collection(fb.db, 'users', userId, 'documents');

  return onSnapshot(
    docsRef,
    (snapshot) => {
      const active: ReceiptDocument[] = [];
      const deleted: ReceiptDocument[] = [];

      snapshot.forEach((snap) => {
        const data = snap.data() as ReceiptDocument;
        if (data.isDeleted) {
          deleted.push(data);
        } else {
          active.push(data);
        }
      });

      // Sort by createdAt / updatedAt descending
      active.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      deleted.sort((a, b) => new Date(b.deletedAt || b.updatedAt).getTime() - new Date(a.deletedAt || a.updatedAt).getTime());

      onActiveDocs(active);
      onDeletedDocs(deleted);
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      onError?.(error);
    }
  );
};

/**
 * Saves or updates a document in Firestore.
 */
export const syncDocumentToCloud = async (
  userId: string,
  docData: ReceiptDocument
): Promise<boolean> => {
  const fb = initFirebase();
  if (!fb?.db || userId.startsWith('local_')) {
    return false;
  }

  try {
    const docRef = doc(fb.db, 'users', userId, 'documents', docData.id);
    await setDoc(docRef, {
      ...docData,
      userId,
      isDeleted: false,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err) {
    console.error('Error syncing document to cloud:', err);
    return false;
  }
};

/**
 * Soft deletes a document in the cloud: marks isDeleted = true and records deletedAt.
 * This preserves the invoice so it can be restored anytime via the Online Recovery tool!
 */
export const softDeleteDocumentInCloud = async (
  userId: string,
  docId: string
): Promise<boolean> => {
  const fb = initFirebase();
  if (!fb?.db || userId.startsWith('local_')) {
    return false;
  }

  try {
    const docRef = doc(fb.db, 'users', userId, 'documents', docId);
    await setDoc(
      docRef,
      {
        isDeleted: true,
        deletedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error soft deleting document in cloud:', err);
    return false;
  }
};

/**
 * Restores a deleted document from the cloud back to active history.
 */
export const restoreDocumentInCloud = async (
  userId: string,
  docId: string
): Promise<boolean> => {
  const fb = initFirebase();
  if (!fb?.db || userId.startsWith('local_')) {
    return false;
  }

  try {
    const docRef = doc(fb.db, 'users', userId, 'documents', docId);
    await setDoc(
      docRef,
      {
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.error('Error restoring document from cloud:', err);
    return false;
  }
};

/**
 * Permanently deletes a document from the cloud.
 */
export const permanentDeleteDocumentInCloud = async (
  userId: string,
  docId: string
): Promise<boolean> => {
  const fb = initFirebase();
  if (!fb?.db || userId.startsWith('local_')) {
    return false;
  }

  try {
    const docRef = doc(fb.db, 'users', userId, 'documents', docId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error('Error permanently deleting document in cloud:', err);
    return false;
  }
};

/**
 * Restores all deleted documents for a user.
 */
export const restoreAllDocumentsInCloud = async (
  userId: string,
  deletedDocs: ReceiptDocument[]
): Promise<boolean> => {
  const fb = initFirebase();
  if (!fb?.db || userId.startsWith('local_')) {
    return false;
  }

  try {
    const promises = deletedDocs.map((docData) =>
      setDoc(
        doc(fb.db!, 'users', userId, 'documents', docData.id),
        {
          isDeleted: false,
          deletedAt: null,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    );
    await Promise.all(promises);
    return true;
  } catch (err) {
    console.error('Error restoring all documents:', err);
    return false;
  }
};

// ==========================================
// USER SETTINGS & BRANDING SYNC
// ==========================================

export const syncCompanyToCloud = async (
  userId: string,
  company: CompanyInfo
): Promise<boolean> => {
  const fb = initFirebase();
  if (!fb?.db || userId.startsWith('local_')) return false;

  try {
    await setDoc(doc(fb.db, 'users', userId, 'settings', 'company'), company, { merge: true });
    return true;
  } catch (e) {
    console.error('Error syncing company to cloud:', e);
    return false;
  }
};

export const syncClientsToCloud = async (
  userId: string,
  clients: ClientInfo[]
): Promise<boolean> => {
  const fb = initFirebase();
  if (!fb?.db || userId.startsWith('local_')) return false;

  try {
    await setDoc(doc(fb.db, 'users', userId, 'settings', 'clients'), { list: clients }, { merge: true });
    return true;
  } catch (e) {
    console.error('Error syncing clients to cloud:', e);
    return false;
  }
};

export const syncInvoiceCounterToCloud = async (
  userId: string,
  nextCounter: string
): Promise<boolean> => {
  const fb = initFirebase();
  if (!fb?.db || userId.startsWith('local_')) return false;

  try {
    await setDoc(doc(fb.db, 'users', userId, 'settings', 'invoice_counter'), { nextCounter }, { merge: true });
    return true;
  } catch (e) {
    console.error('Error syncing invoice counter to cloud:', e);
    return false;
  }
};

/**
 * Subscribes to company and client settings in the cloud so changes made on one device
 * reflect instantly on other devices.
 */
export const subscribeToUserSettings = (
  userId: string,
  onCompany: (comp: CompanyInfo) => void,
  onClients: (clients: ClientInfo[]) => void,
  onCounter?: (counter: string) => void
): (() => void) => {
  const fb = initFirebase();
  if (!fb?.db || userId.startsWith('local_')) return () => {};

  const unsubCompany = onSnapshot(doc(fb.db, 'users', userId, 'settings', 'company'), (snap) => {
    if (snap.exists()) {
      onCompany(snap.data() as CompanyInfo);
    }
  });

  const unsubClients = onSnapshot(doc(fb.db, 'users', userId, 'settings', 'clients'), (snap) => {
    if (snap.exists() && snap.data()?.list) {
      onClients(snap.data().list as ClientInfo[]);
    }
  });

  let unsubCounter = () => {};
  if (onCounter) {
    unsubCounter = onSnapshot(doc(fb.db, 'users', userId, 'settings', 'invoice_counter'), (snap) => {
      if (snap.exists() && snap.data()?.nextCounter) {
        onCounter(snap.data().nextCounter);
      }
    });
  }

  return () => {
    unsubCompany();
    unsubClients();
    unsubCounter();
  };
};

/**
 * Migrates local offline data to Cloud Firestore once user logs in.
 */
export const migrateLocalDataToCloud = async (
  userId: string,
  history: ReceiptDocument[],
  company: CompanyInfo,
  clients: ClientInfo[]
): Promise<number> => {
  const fb = initFirebase();
  if (!fb?.db || userId.startsWith('local_')) return 0;

  let count = 0;
  for (const docData of history) {
    await syncDocumentToCloud(userId, docData);
    count++;
  }
  await syncCompanyToCloud(userId, company);
  await syncClientsToCloud(userId, clients);
  return count;
};
