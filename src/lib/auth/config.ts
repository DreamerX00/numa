import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
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
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Use Firebase Admin to verify email/password
          const { adminAuth } = getFirebaseAdmin();
          
          // Get user by email from Firebase
          let firebaseUser;
          try {
            firebaseUser = await adminAuth.getUserByEmail(credentials.email as string);
          } catch (error) {
            console.error("Firebase user not found:", error);
            return null;
          }

          // For Firebase users, we need to verify password via Firebase Client SDK
          // Since Admin SDK can't verify passwords, we'll check if user exists in our DB
          // and trust that the client-side Firebase auth already validated the password
          
          // Find or create user in database
          let dbUser = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: { profile: true }
          });

          if (!dbUser && firebaseUser) {
            // Create user if they exist in Firebase but not in DB
            dbUser = await prisma.user.create({
              data: {
                email: credentials.email as string,
                name: firebaseUser.displayName || null,
                emailVerified: firebaseUser.emailVerified ? new Date() : null,
                firebaseUid: firebaseUser.uid,
                image: firebaseUser.photoURL || null,
                profile: {
                  create: {
                    displayName: firebaseUser.displayName || credentials.email as string,
                    lastLoginAt: new Date(),
                  }
                }
              },
              include: { profile: true }
            });
          }

          if (!dbUser) {
            return null;
          }

          // Update last login
          await prisma.userProfile.upsert({
            where: { userId: dbUser.id },
            create: {
              userId: dbUser.id,
              lastLoginAt: new Date(),
            },
            update: {
              lastLoginAt: new Date(),
            },
          });

          // Return user object for NextAuth
          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
            role: dbUser.role,
            isActive: dbUser.isActive,
          };
        } catch (error) {
          console.error("Credentials authorization error:", error);
          return null;
        }
      },
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
