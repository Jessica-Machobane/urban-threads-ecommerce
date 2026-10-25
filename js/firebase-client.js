/**
 * URBAN THREADS — FIREBASE CLIENT & FIRESTORE DATABASE SERVICE
 * Direct connection to Firebase Firestore and Authentication.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut as fbSignOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  query, 
  where 
} from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "core-entry-zv4kj",
  appId: "1:833611327405:web:2363302504c51aa3552324",
  apiKey: "AIzaSyAknWS-y8ISiN_1S5E0QUhJyN5SwSXqhgU",
  authDomain: "core-entry-zv4kj.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-2be31e99-8311-4fa7-8f31-dd57ed48b1a9",
  storageBucket: "core-entry-zv4kj.firebasestorage.app",
  messagingSenderId: "833611327405",
  oAuthClientId: "833611327405-qjj7q24pnclrthdfuc05huit58a1e9r8.apps.googleusercontent.com"
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

/**
 * Sync or load products from Firestore `products` collection
 * Seeds catalog into Firestore if collection is empty
 */
export async function getOrSeedFirestoreProducts(fallbackCatalog) {
  try {
    const colRef = collection(db, 'products');
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const items = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() });
      });
      return items;
    }

    // Seed initial products into Firestore
    for (const item of fallbackCatalog) {
      try {
        await setDoc(doc(db, 'products', item.id), item);
      } catch (seedErr) {
        console.warn('Notice seeding item:', item.id, seedErr);
      }
    }
    return fallbackCatalog;
  } catch (err) {
    console.warn('Firestore products read notice (falling back to local catalog):', err);
    return fallbackCatalog;
  }
}

/**
 * Save customer order directly to Firestore `orders` collection
 */
export async function saveOrderToFirestore(orderData) {
  try {
    // If user is not yet logged in with Firebase Auth, sign in anonymously so rules allow order creation
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (authErr) {
        console.warn('Anonymous sign in for checkout notice:', authErr);
      }
    }

    const currentUid = auth.currentUser ? auth.currentUser.uid : orderData.userId;
    const sanitizedOrder = {
      ...orderData,
      userId: currentUid,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'orders', orderData.id), sanitizedOrder);
    return { success: true, orderId: orderData.id };
  } catch (err) {
    console.error('Failed to save order to Firestore:', err);
    // Return gracefully so the shopper still receives their confirmation
    return { success: false, error: err.message, orderId: orderData.id };
  }
}

/**
 * Sync shopping cart to Firestore for authenticated user
 */
export async function syncUserCartToFirestore(userId, cartItems) {
  if (!userId || !db) return;
  try {
    const cartDocRef = doc(db, 'users', userId, 'cart', 'current');
    await setDoc(cartDocRef, {
      items: cartItems,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (err) {
    console.warn('Notice syncing cart to Firestore:', err);
  }
}

/**
 * Load shopping cart from Firestore for authenticated user
 */
export async function loadUserCartFromFirestore(userId) {
  if (!userId || !db) return null;
  try {
    const cartDocRef = doc(db, 'users', userId, 'cart', 'current');
    const snap = await getDoc(cartDocRef);
    if (snap.exists() && snap.data().items) {
      return snap.data().items;
    }
  } catch (err) {
    console.warn('Notice loading cart from Firestore:', err);
  }
  return null;
}

/**
 * Fetch orders for the current user from Firestore
 */
export async function fetchUserOrdersFromFirestore(userId) {
  if (!userId || !db) return [];
  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('userId', '==', userId));
    const snap = await getDocs(q);
    const orders = [];
    snap.forEach(d => orders.push({ id: d.id, ...d.data() }));
    return orders;
  } catch (err) {
    console.warn('Notice fetching user orders from Firestore:', err);
    return [];
  }
}
