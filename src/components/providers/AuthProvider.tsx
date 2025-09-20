"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirebaseClient } from '@/lib/firebase/client';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auth } = getFirebaseClient();
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AuthProvider: onAuthStateChanged triggered", {
        firebaseUser: firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email } : null
      });
      
      if (firebaseUser) {
        // Verify that we also have a valid server-side session
        try {
          console.log("AuthProvider: Verifying server session...");
          const response = await fetch('/api/auth/verify');
          const { authenticated } = await response.json();
          
          console.log("AuthProvider: Server verification result:", { authenticated });
          
          if (authenticated) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });
            console.log("AuthProvider: User set from existing session");
          } else {
            // Firebase auth is valid but no server session - create one
            console.log("AuthProvider: Creating new server session...");
            const idToken = await firebaseUser.getIdToken();
            await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken }),
            });
            
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            });
            console.log("AuthProvider: User set from new session");
          }
        } catch (error) {
          console.error('AuthProvider: Session verification error:', error);
          setUser(null);
        }
      } else {
        console.log("AuthProvider: No firebase user, setting user to null");
        setUser(null);
      }
      setLoading(false);
      console.log("AuthProvider: Loading set to false");
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
      
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function getAuthDisplayName(user: AuthUser | null): string {
  if (!user) return 'Guest';
  return user.displayName || user.email?.split('@')[0] || 'User';
}