import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signInError: string | null;
  signIn: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (name: string, email: string, password: string) => Promise<void>;
  signInAsGuest: () => void;
  updateProfilePhoto: (url: string) => void;
  clearError: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const buildProfile = (firebaseUser: User, extra?: any) => ({
  uid: firebaseUser.uid,
  displayName: firebaseUser.displayName || extra?.name || 'Alumni',
  email: firebaseUser.email || '',
  photoURL: firebaseUser.photoURL || '',
  role: 'user',
  classOf: '2024',
  location: 'Unknown',
  expertise: [],
  bio: '',
  ...extra
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (unsubscribeProfile) { unsubscribeProfile(); unsubscribeProfile = null; }

      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            await setDoc(docRef, buildProfile(firebaseUser));
          }
          unsubscribeProfile = onSnapshot(docRef,
            (snap) => { if (snap.exists()) setProfile(snap.data()); },
            (error) => console.error('Profile listener error:', error)
          );
        } catch (error) {
          console.error('Error initializing user profile:', error);
          setProfile(buildProfile(firebaseUser));
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => { unsubscribeAuth(); if (unsubscribeProfile) unsubscribeProfile(); };
  }, []);

  const handleAuthError = (error: any) => {
    console.error('Auth error:', error);
    const code = error?.code;
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return;
    if (code === 'auth/unauthorized-domain') setSignInError('UNAUTHORIZED_DOMAIN');
    else if (code === 'auth/popup-blocked') setSignInError('Popup was blocked. Please allow popups and try again.');
    else if (code === 'auth/user-not-found') setSignInError('No account found with this email.');
    else if (code === 'auth/wrong-password') setSignInError('Incorrect password. Please try again.');
    else if (code === 'auth/email-already-in-use') setSignInError('This email is already registered. Please sign in.');
    else if (code === 'auth/weak-password') setSignInError('Password must be at least 6 characters.');
    else if (code === 'auth/invalid-email') setSignInError('Please enter a valid email address.');
    else if (code === 'auth/network-request-failed') setSignInError('Network error. Check your internet connection.');
    else if (code === 'auth/invalid-credential') setSignInError('Incorrect email or password. Please try again.');
    else setSignInError('Authentication failed. Please try again.');
  };

  const signIn = async () => {
    setSignInError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setSignInError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const createAccount = async (name: string, email: string, password: string) => {
    setSignInError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      // Firestore profile created by onAuthStateChanged
    } catch (error: any) {
      handleAuthError(error);
    }
  };

  const signInAsGuest = () => {
    setSignInError(null);
    setUser({ uid: 'guest-123', displayName: 'Guest User', email: 'guest@alumnicloud.edu', photoURL: 'https://picsum.photos/seed/guest/200/200' } as User);
    setProfile({ uid: 'guest-123', displayName: 'Guest User', email: 'guest@alumnicloud.edu', photoURL: 'https://picsum.photos/seed/guest/200/200', role: 'guest', classOf: '2024', location: 'Local Campus', expertise: ['Exploring'], bio: 'Just visiting the AlumniCloud network.' });
    setLoading(false);
  };

  const logout = async () => {
    try {
      setUser(null);
      setProfile(null);
      await signOut(auth).catch(() => {});
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfilePhoto = (url: string) => {
    setProfile((prev: any) => prev ? { ...prev, photoURL: url } : prev);
  };

  const clearError = () => setSignInError(null);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInError, signIn, signInWithEmail, createAccount, signInAsGuest, updateProfilePhoto, clearError, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
