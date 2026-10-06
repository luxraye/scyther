import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail,
  onAuthStateChanged, 
  type User as FirebaseUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer, 
  setDoc, 
  updateDoc,
  deleteDoc,
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  where,
  getDocs,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with the provisioned databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Initialize Cloud Storage
export const storage = getStorage(app, firebaseConfig.storageBucket);

// Enable Firestore offline persistence for field resilience (ambulances, rural clinics)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore offline persistence: multiple tabs open, persistence enabled in first tab.');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore offline persistence: browser does not support IndexedDB persistence.');
    }
  });
}

// Upload file helper for donor documents, lab certs, and clinical signatures
export async function uploadFileToStorage(
  storagePath: string,
  file: Blob | Uint8Array | ArrayBuffer,
  metadata?: { contentType?: string }
): Promise<{ downloadUrl: string; storagePath: string }> {
  const fileRef = storageRef(storage, storagePath);
  await uploadBytes(fileRef, file, metadata);
  const downloadUrl = await getDownloadURL(fileRef);
  return { downloadUrl, storagePath };
}

// Test connection to Firestore
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is currently offline.');
    } else {
      console.log('Firestore connection initialized.');
    }
    return false;
  }
}

// Trigger connection test
testConnection();

export { 
  signInWithPopup, 
  fbSignOut, 
  signInAnonymously, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  where,
  getDocs,
  storageRef,
  getDownloadURL,
  deleteObject,
  type FirebaseUser 
};
