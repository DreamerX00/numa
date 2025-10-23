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
  const loading = status === 'loading';

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setUser({
        uid: session.user.id,
        email: session.user.email || null,
        displayName: session.user.name || null,
        photoURL: session.user.image || null,
        role: session.user.role,
        isActive: session.user.isActive,
      });
    } else if (status === 'unauthenticated') {
      setUser(null);
    }
  }, [session, status]);

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
  return user.displayName || user.email?.split('@')[0] || 'User';
}