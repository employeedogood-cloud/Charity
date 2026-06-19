import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  collection, 
  onSnapshot, 
  addDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  query, 
  orderBy, 
  limit, 
  getDocFromServer,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Donation } from './types';

// Detect if Firebase has been configured with real credentials
export const isFirebaseActive = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey.trim().length > 0);

let app;
let db: any = null;

if (isFirebaseActive) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  } catch (err) {
    console.error("Failed to initialize Firebase:", err);
  }
}

export { db };

// Enumeration matching error handler requirements
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

// Strictly compliant Firestore Error Handling function as per System guidelines
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validation helper to verify connection when app starts
export async function testFirestoreConnection() {
  if (!isFirebaseActive || !db) return;
  const testPath = 'totals/global';
  try {
    await getDocFromServer(doc(db, testPath));
    console.log("Firestore connection validated successfully.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or network.");
    }
  }
}

// 1. Subscribe to Global Stats (total money count)
export function subscribeToStats(onUpdate: (data: { totalMoney: number }) => void) {
  if (!isFirebaseActive || !db) return () => {};

  const statsDocRef = doc(db, 'totals', 'global');
  
  // Set up real-time listener
  return onSnapshot(statsDocRef, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data() as { totalMoney: number });
    } else {
      // If global stats doc doesn't exist, seed it with the starting RM12,450.00
      setDoc(statsDocRef, {
        totalMoney: 12450.00,
        updatedAt: serverTimestamp()
      }).catch(err => {
        console.error("Error setting up default totals document:", err);
      });
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'totals/global');
  });
}

// 2. Subscribe to Dynamic Recent Donation Feed
export function subscribeToDonations(onUpdate: (donations: Donation[]) => void) {
  if (!isFirebaseActive || !db) return () => {};

  const q = query(
    collection(db, 'donations'),
    orderBy('createdAt', 'desc'),
    limit(6)
  );

  return onSnapshot(q, (snap) => {
    const list: Donation[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      list.push({
        id: docSnap.id,
        name: data.name || "Anonymous",
        amount: data.amount || 0,
        eggs: data.eggs || 0,
        timestamp: data.createdAt ? 'Just Now' : 'Pending',
        message: data.message || ""
      });
    });
    onUpdate(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.LIST, 'donations');
  });
}

// 3. Submit a live genuine contribution
export async function addRealDonation(name: string, amount: number, eggs: number, message: string) {
  if (!isFirebaseActive || !db) {
    // Return false if offline fallback is needed
    return false;
  }

  const donationsCol = collection(db, 'donations');
  const statsDocRef = doc(db, 'totals', 'global');

  try {
    // Sanitize the donation input to perfectly match firestore.rules requirements (schema size 4 or 5)
    const donationPayload: any = {
      name: (name || '').trim() || "Anonymous",
      amount: Number(amount),
      eggs: Number(eggs),
      createdAt: serverTimestamp()
    };

    if (message && message.trim().length > 0) {
      donationPayload.message = message.trim();
    }

    // 1. Add donation stream event
    await addDoc(donationsCol, donationPayload);

    // 2. Concurrency-safe atomicity operation using atomic increment is supported by Firestore
    await updateDoc(statsDocRef, {
      totalMoney: increment(amount),
      updatedAt: serverTimestamp()
    });

    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'donations');
    return false;
  }
}
