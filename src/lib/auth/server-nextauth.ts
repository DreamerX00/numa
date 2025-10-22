import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import type { User, UserRole } from "@prisma/client";

/**
 * Get the current authenticated user from NextAuth session
 * Returns null if not authenticated
 */
export async function getServerUser(): Promise<User | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  
  // Get full user data from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  
  return user;
}

/**
 * Require authentication - throws error if not authenticated
 * Use in API routes and server components that need auth
 */
export async function requireAuth(): Promise<User> {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Unauthorized - Please sign in");
  }
  if (!user.isActive) {
    throw new Error("Account is deactivated");
  }
  return user;
}

/**
 * Require admin role - throws error if not admin
 * Use in admin API routes and pages
 */
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden - Admin access required");
  }
  return user;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const user = await getServerUser();
  return user?.role === role;
}

/**
 * Check if user is admin (ADMIN or SUPER_ADMIN)
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getServerUser();
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

/**
 * Get session for use in middleware and API routes
 */
export { auth as getSession } from "@/lib/auth/config";
