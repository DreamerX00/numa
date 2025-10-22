"use client";

import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
  isActive: boolean;
}

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user as AuthUser | null,
    loading: status === "loading",
    signIn: () => nextAuthSignIn("google", { callbackUrl: "/" }),
    signOut: () => nextAuthSignOut({ callbackUrl: "/" }),
    logout: () => nextAuthSignOut({ callbackUrl: "/" }), // Alias for compatibility
  };
}

export function getAuthDisplayName(user: AuthUser | null): string {
  if (!user) return "Guest";
  return user.name || user.email || "User";
}
