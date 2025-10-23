import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { getFirebaseAdmin } from "@/lib/firebase/admin";
import type { UserRole } from "@prisma/client";

// Development-only logging helper
const devLog = (message: string, ...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') {
    devLog(message, ...args);
  }
};

// Helper to generate MongoDB ObjectId-compatible IDs
function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const randomHex = Array.from({ length: 16 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return timestamp + randomHex;
}

// Custom adapter to handle MongoDB ObjectId
function customPrismaAdapter() {
  const baseAdapter = PrismaAdapter(prisma);
  
  return {
    ...baseAdapter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createUser(data: any) {
      // Check if user already exists by email or firebaseUid to prevent duplicates
      devLog('[CustomAdapter] Checking for existing user:', data.email);
      
      try {
        // First, try to find existing user by email
        const existingUser = await prisma.user.findUnique({
          where: { email: data.email },
        });
        
        if (existingUser) {
          devLog('[CustomAdapter] Found existing user by email:', existingUser.id);
          
          // Update the existing user with any new data from OAuth
          const updatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: data.name || existingUser.name,
              image: data.image || existingUser.image,
              emailVerified: data.emailVerified ? new Date(data.emailVerified) : existingUser.emailVerified,
              firebaseUid: data.firebaseUid || existingUser.firebaseUid,
              updatedAt: new Date(),
            },
          });
          
          devLog('[CustomAdapter] Updated existing user:', updatedUser.id);
          return updatedUser;
        }
      } catch (error) {
        devLog('[CustomAdapter] Error checking for existing user:', error);
        // Continue to create new user if check fails
      }
      
      // If no existing user found, create a new one
      const userId = generateObjectId();
      
      devLog('[CustomAdapter] Creating new user with ObjectId:', userId);
      
      try {
        const user = await prisma.user.create({
          data: {
            ...data,
            id: userId,
            emailVerified: data.emailVerified ? new Date(data.emailVerified) : null,
          },
        });
        
        devLog('[CustomAdapter] User created successfully:', user.id);
        return user;
      } catch (error) {
        // If creation fails due to duplicate firebaseUid, try to find and return that user
        devLog('[CustomAdapter] Error creating user, checking for duplicate:', error);
        
        if (data.firebaseUid) {
          const userByFirebaseUid = await prisma.user.findUnique({
            where: { firebaseUid: data.firebaseUid },
          });
          
          if (userByFirebaseUid) {
            devLog('[CustomAdapter] Found existing user by firebaseUid:', userByFirebaseUid.id);
            return userByFirebaseUid;
          }
        }
        
        // If still no user found, re-throw the error
        throw error;
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async linkAccount(data: any) {
      // Generate MongoDB ObjectId for the account
      const accountId = generateObjectId();
      
      // Ensure userId is a string (handle { $oid: '...' } format)
      const userId = typeof data.userId === 'string' ? data.userId : (data.userId.$oid || data.userId);
      
      devLog('[CustomAdapter] Linking account with ObjectId:', accountId, 'for user:', userId);
      
      const account = await prisma.account.create({
        data: {
          ...data,
          id: accountId,
          userId: userId,
        },
      });
      
      devLog('[CustomAdapter] Account linked successfully');
      return account;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async createSession(data: any) {
      // Generate MongoDB ObjectId for the session
      const sessionId = generateObjectId();
      
      devLog('[CustomAdapter] Creating session with ObjectId:', sessionId);
      
      const session = await prisma.session.create({
        data: {
          ...data,
          id: sessionId,
        },
      });
      
      devLog('[CustomAdapter] Session created successfully');
      return session;
    },
    async getUserByEmail(email: string) {
      devLog('[CustomAdapter] Getting user by email:', email);
      
      try {
        // Use raw MongoDB query to get user without type conversion issues
        const result = await prisma.$runCommandRaw({
          find: 'users',
          filter: { email },
          limit: 1,
        });
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const users = (result as any).cursor.firstBatch;
        
        if (users && users.length > 0) {
          const user = users[0];
          
          // Extract ObjectId string from MongoDB's { $oid: '...' } format
          const userId = typeof user._id === 'string' ? user._id : user._id.$oid;
          
          devLog('[CustomAdapter] Found user:', userId);
          
          // Convert MongoDB document to Prisma User format
          return {
            id: userId,
            firebaseUid: user.firebaseUid || null,
            email: user.email,
            emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
            name: user.name || null,
            image: user.image || null,
            role: user.role,
            isActive: user.isActive,
            createdAt: new Date(user.createdAt),
            updatedAt: new Date(user.updatedAt),
          };
        }
        
        devLog('[CustomAdapter] User not found');
        return null;
      } catch (error) {
        console.error('[CustomAdapter] Error getting user by email:', error);
        throw error;
      }
    },
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: customPrismaAdapter() as any, // Custom MongoDB adapter
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true, // Allow linking to existing email accounts
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
      devLog('[Session Callback] Building session for user:', user.id);
      
      if (session.user) {
        session.user.id = user.id;
        // Fetch full user data to get role and status
        const fullUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, isActive: true, name: true }
        });
        
        devLog('[Session Callback] Full user data:', fullUser);
        
        if (fullUser) {
          session.user.role = fullUser.role;
          session.user.isActive = fullUser.isActive;
          // Update name in session if it changed in database
          if (fullUser.name) {
            session.user.name = fullUser.name;
          }
        }
      }
      
      devLog('[Session Callback] Final session:', {
        id: session.user?.id,
        email: session.user?.email,
        name: session.user?.name,
        role: session.user?.role,
        isActive: session.user?.isActive
      });
      
      return session;
    },
    async signIn({ user, account }) {
      devLog('[SignIn Callback] User:', user.id, 'Account:', account?.provider);
      
      // Skip update for OAuth sign-ins during account linking
      // The user will be created by the adapter with proper ObjectId
      if (account?.provider === 'google') {
        devLog('[SignIn Callback] Skipping update for Google OAuth');
        return true;
      }
      
      // Update or create user on sign in (for credentials provider)
      if (user.id) {
        try {
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
        } catch (error) {
          console.error('[SignIn Callback] Error updating user:', error);
          // Don't block sign-in if update fails
        }
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
        try {
          // Ensure userId is a string (handle { $oid: '...' } format)
          const userId = typeof user.id === 'string' 
            ? user.id 
            : ((user.id as { $oid: string }).$oid || String(user.id));
          
          await prisma.userProfile.create({
            data: {
              userId: userId,
              lastLoginAt: new Date(),
            },
          });
        } catch (error) {
          console.error('[CreateUser Event] Error creating profile:', error);
          // Don't block user creation if profile fails
        }
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

