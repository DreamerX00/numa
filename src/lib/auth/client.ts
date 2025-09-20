import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { getFirebaseClient } from '@/lib/firebase/client';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth } = getFirebaseClient();
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      const { auth } = getFirebaseClient();
      await signOut(auth);
      
      // Call the logout API to clear the session cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { auth, googleProvider } = getFirebaseClient();
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      // Create session cookie
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      
      if (!res.ok) throw new Error('Session creation failed');
      
      return result;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    logout,
    signInWithGoogle,
    isAuthenticated: !!user,
  };
}

export function getAuthDisplayName(user: AuthUser): string {
  return user.displayName || user.email?.split('@')[0] || 'User';
}