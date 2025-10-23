"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const loading = status === 'loading' || !isInitialized;

  useEffect(() => {
    console.log('[AuthProvider] Session status changed:', status, 'Session:', session?.user?.email, 'Initialized:', isInitialized);
    
    if (status === 'authenticated' && session?.user) {
      const authUser = {
        uid: session.user.id,
        email: session.user.email || null,
        displayName: session.user.name || null,
        photoURL: session.user.image || null,
        role: session.user.role,
        isActive: session.user.isActive,
      };
      
      console.log('[AuthProvider] Setting user:', authUser);
      setUser(authUser);
      setIsInitialized(true);
    } else if (status === 'unauthenticated') {
      console.log('[AuthProvider] User unauthenticated, clearing user state');
      setUser(null);
      setIsInitialized(true);
    }
    // Don't clear user during 'loading' status to prevent flicker
  }, [session, status, isInitialized]);

  const logout = async () => {
    try {
      await nextAuthSignOut({ redirect: false });
      setUser(null);
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
  
  // Priority: displayName > extracted first name from email > email username > fallback
  if (user.displayName) {
    return user.displayName;
  }
  
  // If email exists, extract a friendly username
  if (user.email) {
    const emailUsername = user.email.split('@')[0];
    // Capitalize first letter and make it more readable
    return emailUsername
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
  
  return 'User';
}