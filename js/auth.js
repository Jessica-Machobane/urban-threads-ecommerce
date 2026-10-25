/**
 * URBAN THREADS — AUTHENTICATION STATE MANAGER
 * Uses Firebase Auth with local fallback and state synchronization across pages
 */
import { auth } from './firebase-client.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

// Local Session for instant page transitions
const LOCAL_STORAGE_KEY = 'urban_threads_user';

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export function getCurrentUser() {
  const local = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (local) {
    try { return JSON.parse(local); } catch (e) { /* ignore */ }
  }
  if (auth && auth.currentUser) {
    const u = auth.currentUser;
    return {
      uid: u.uid,
      email: u.email || 'Guest Explorer',
      displayName: u.displayName || (u.email ? u.email.split('@')[0] : 'Urban Explorer'),
      photoURL: u.photoURL || '',
      isAnonymous: u.isAnonymous,
      provider: u.providerData && u.providerData[0] ? u.providerData[0].providerId : 'firebase'
    };
  }
  return null;
}

export function subscribeAuthState(callback) {
  // Fire initial with local mirror
  const current = getCurrentUser();
  callback(current);

  if (auth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email || 'Guest Explorer',
          displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Urban Explorer'),
          photoURL: user.photoURL || '',
          isAnonymous: user.isAnonymous,
          provider: user.providerData && user.providerData[0] ? user.providerData[0].providerId : 'firebase'
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
        callback(userData);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        callback(null);
      }
    });
  }
}

/**
 * Sign in using Google Account with popup (per AI Studio iframe guidelines)
 */
export async function loginWithGoogle() {
  try {
    if (auth) {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userData = {
        uid: user.uid,
        email: user.email || 'Google User',
        displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Urban Explorer'),
        photoURL: user.photoURL || '',
        isAnonymous: false,
        provider: 'google.com'
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
      return { success: true, user: userData };
    }
  } catch (error) {
    // Gracefully handle expected user cancellation, closed popup, or blocked popup
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      return {
        cancelled: true,
        message: 'Google sign-in window was closed. You can try again whenever you are ready.'
      };
    }
    if (error?.code === 'auth/popup-blocked') {
      return {
        cancelled: true,
        message: 'Google sign-in popup was blocked by browser. Please allow popups for this site and try again.'
      };
    }

    console.warn('Google Auth notice:', error?.message || error);
    throw error;
  }

  //  fallback for offline preview environment
  const fallback = {
    uid: 'google_' + Date.now(),
    email: 'jessicamachobane@gmail.com',
    displayName: 'Jessica Machobane',
    photoURL: '',
    isAnonymous: false,
    provider: 'google.com'
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallback));
  return { success: true, user: fallback };
}

export async function loginWithEmail(email, password) {
  try {
    if (auth) {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userData = {
        uid: userCred.user.uid,
        email: userCred.user.email,
        isAnonymous: false,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
      return { success: true, user: userData };
    }
  } catch (error) {
    // If Firebase Auth throws an error or user does not exist yet
    throw error;
  }
  // Local fallback if offline
  const fallback = { uid: 'usr_' + Date.now(), email, isAnonymous: false };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallback));
  return { success: true, user: fallback };
}

export async function signupWithEmail(email, password) {
  try {
    if (auth) {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const userData = {
        uid: userCred.user.uid,
        email: userCred.user.email,
        isAnonymous: false,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
      return { success: true, user: userData };
    }
  } catch (error) {
    throw error;
  }
  const fallback = { uid: 'usr_' + Date.now(), email, isAnonymous: false };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallback));
  return { success: true, user: fallback };
}

export async function loginAsGuest() {
  try {
    if (auth) {
      const userCred = await signInAnonymously(auth);
      const userData = {
        uid: userCred.user.uid,
        email: 'Guest Explorer',
        isAnonymous: true,
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userData));
      return { success: true, user: userData };
    }
  } catch (e) {
    console.warn('Anonymous auth note:', e);
  }
  const fallback = { uid: 'guest_' + Date.now(), email: 'Guest Explorer', isAnonymous: true };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallback));
  return { success: true, user: fallback };
}

export async function logoutUser() {
  try {
    if (auth) await fbSignOut(auth);
  } catch (e) {
    console.warn('Logout note:', e);
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY);
  window.dispatchEvent(new Event('auth-changed'));
}
