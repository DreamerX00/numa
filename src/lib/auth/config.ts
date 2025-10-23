import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any, // Type workaround for NextAuth v5 beta
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add custom fields to session
      if (session.user) {
        session.user.id = user.id;
        // Fetch full user data to get role and status
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, isActive: true }
        });
        
        if (fullUser) {
          session.user.role = fullUser.role;
          session.user.isActive = fullUser.isActive;
        }
      }
      return session;
    },
    async signIn({ user }) {
      // Update or create user on sign in
      if (user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            updatedAt: new Date(),
          },
        });
        
        // Update profile with last login
        await prisma.userProfile.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            lastLoginAt: new Date(),
          },
          update: {
            lastLoginAt: new Date(),
          },
        });
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  events: {
    async createUser({ user }) {
      // Create default profile when user is created
      if (user.id) {
        await prisma.userProfile.create({
          data: {
            userId: user.id,
            lastLoginAt: new Date(),
          },
        });
      }
    },
  },
});

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: UserRole;
      isActive: boolean;
    };
  }
  
  interface User {
    role: UserRole;
    isActive: boolean;
  }
}
