# NextAuth.js Migration Plan - Firebase Auth → NextAuth.js

## 🎯 Objective
Replace the current Firebase Auth + Prisma dual system with NextAuth.js using Google OAuth, maintaining all existing functionality with zero downtime.

---

## 📊 Current Authentication Architecture

### **Current Stack**
- **Frontend:** Firebase Client SDK (`firebase/auth`)
- **Backend:** Firebase Admin SDK for token verification
- **Database:** Prisma with MongoDB (User model)
- **Session:** HTTP-only cookies with Firebase ID tokens

### **Current Flow**
1. User signs in with Google via Firebase Auth
2. Firebase returns ID token
3. Frontend sends token to `/api/auth/login`
4. Backend verifies token with Firebase Admin
5. Backend creates/updates Prisma User record
6. Sets HTTP-only cookie with Firebase token
7. Middleware checks cookie format (not validity!)

### **Current Files**
```
src/lib/
├── auth/
│   ├── client.ts          # Firebase client SDK wrapper
│   └── server.ts          # Firebase Admin SDK wrapper
├── firebase/
│   ├── client.ts          # Firebase app initialization (client)
│   └── admin.ts           # Firebase app initialization (server)
src/app/api/auth/
├── login/route.ts         # Login endpoint
├── logout/route.ts        # Logout endpoint
└── verify/route.ts        # Token verification
src/middleware.ts          # Auth routing & session check
```

---

## 🚀 NextAuth.js Architecture

### **New Stack**
- **Frontend:** NextAuth.js React hooks (`useSession`)
- **Backend:** NextAuth.js with Prisma Adapter
- **Database:** Prisma with MongoDB (extended models)
- **Session:** JWT or database sessions (configurable)

### **New Flow**
1. User clicks "Sign in with Google"
2. NextAuth.js handles OAuth flow
3. Google returns user info
4. NextAuth.js creates/updates Prisma User via adapter
5. Sets HTTP-only cookie with session token
6. Middleware validates session automatically

### **Benefits**
- ✅ No dual auth system
- ✅ Automatic session management
- ✅ Built-in CSRF protection
- ✅ Simplified codebase (-40% auth code)
- ✅ Type-safe with TypeScript
- ✅ Proper token validation in middleware
- ✅ Standard OAuth 2.0 implementation

---

## 📦 Required Packages

```json
{
  "dependencies": {
    "next-auth": "^5.0.0-beta.25",   // NextAuth v5 (for Next.js 15)
    "@auth/prisma-adapter": "^2.9.0",
    "@prisma/client": "^6.16.2"       // Already installed
  }
}
```

---

## 🗄️ Database Schema Changes

### **Current Schema**
```prisma
model User {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  firebaseUid     String    @unique
  email           String    @unique
  emailVerified   Boolean   @default(false)
  role            Role      @default(CUSTOMER)
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastLoginAt     DateTime?
  profile         Profile?
  orders          Order[]
  reviews         Review[]
  wishlistItems   WishlistItem[]
  cartItems       CartItem[]
}
```

### **NextAuth.js Required Models**
```prisma
model User {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(CUSTOMER)
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  
  accounts      Account[]
  sessions      Session[]
  profile       Profile?
  orders        Order[]
  reviews       Review[]
  wishlistItems WishlistItem[]
  cartItems     CartItem[]
}

model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.String
  access_token      String? @db.String
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.String
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  sessionToken String   @unique
  userId       String   @db.ObjectId
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  id         String   @id @default(auto()) @map("_id") @db.ObjectId
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

### **Schema Migration Steps**
1. Add new models (Account, Session, VerificationToken)
2. Add relations to User model
3. Remove `firebaseUid` field (deprecated)
4. Keep existing User data intact
5. Run migration: `npx prisma migrate dev --name nextauth-migration`

---

## 🔧 Implementation Steps

### **Step 1: Install Dependencies**
```bash
npm install next-auth@beta @auth/prisma-adapter
```

### **Step 2: Update Prisma Schema**
- Add NextAuth models
- Update User model
- Generate Prisma client

### **Step 3: Create NextAuth Configuration**
**File:** `src/app/api/auth/[...nextauth]/route.ts`
```typescript
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Add custom fields to session
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role;
        session.user.isActive = user.isActive;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Update lastLoginAt
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      return true;
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  session: {
    strategy: "database", // or "jwt" for stateless
  },
});

export { handlers as GET, handlers as POST };
```

### **Step 4: Update Environment Variables**
```.env
# Remove Firebase config (or keep for migration period)
# FIREBASE_* (deprecated)

# Add NextAuth config
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here  # Generate with: openssl rand -base64 32

# Google OAuth (reuse existing Firebase credentials or create new)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### **Step 5: Update Frontend Auth Hook**
**File:** `src/lib/auth/client.ts`
```typescript
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user || null,
    loading: status === "loading",
    signIn: () => signIn("google", { callbackUrl: "/" }),
    signOut: () => signOut({ callbackUrl: "/" }),
  };
}
```

### **Step 6: Update Server Auth Helpers**
**File:** `src/lib/auth/server.ts`
```typescript
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function getServerUser() {
  const session = await auth();
  if (!session?.user) return null;
  
  // Get full user data from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });
  
  return user;
}

export async function requireAuth() {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return user;
}
```

### **Step 7: Update Middleware**
**File:** `src/middleware.ts`
```typescript
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Protected routes
  const protectedRoutes = ["/profile", "/wishlist", "/checkout"];
  const adminRoutes = ["/admin"];

  if (protectedRoutes.some(route => pathname.startsWith(route)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (req.auth.user.role !== "ADMIN" && req.auth.user.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### **Step 8: Update Login Page**
**File:** `src/app/login/page.tsx`
```typescript
"use client";
import { useAuth } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <Button onClick={() => signIn()} className="w-full">
          Sign in with Google
        </Button>
      </Card>
    </div>
  );
}
```

### **Step 9: Update API Routes**
Replace Firebase token verification with NextAuth session checks:
```typescript
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your API logic here
  return Response.json({ data: "..." });
}
```

### **Step 10: Update Root Layout**
**File:** `src/app/layout.tsx`
```typescript
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

---

## 🔄 Migration Strategy (Zero Downtime)

### **Phase 1: Preparation (No User Impact)**
1. Install NextAuth packages
2. Add new database models (don't remove old ones yet)
3. Run Prisma migration
4. Set up NextAuth configuration
5. Test in development

### **Phase 2: Parallel Systems (Dual Support)**
1. Keep Firebase Auth running
2. Add NextAuth alongside
3. Update login page to support both
4. Gradually migrate users (new signins use NextAuth)
5. Old sessions still work with Firebase

### **Phase 3: Migration (Gradual Transition)**
1. Send email to users about new login system
2. Force re-login on next visit (gentle migration)
3. Link existing Firebase users to NextAuth accounts
4. Monitor error rates

### **Phase 4: Cleanup (Remove Firebase)**
1. After 30 days, all users migrated
2. Remove Firebase dependencies
3. Remove Firebase environment variables
4. Clean up old auth code
5. Remove `firebaseUid` from database

---

## 📝 File Changes Summary

### **Files to Create**
- `src/app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `prisma/migrations/*_nextauth_migration.sql` - Database migration

### **Files to Modify**
- `prisma/schema.prisma` - Add NextAuth models
- `src/lib/auth/client.ts` - Replace Firebase with NextAuth hooks
- `src/lib/auth/server.ts` - Replace Firebase Admin with NextAuth
- `src/middleware.ts` - Use NextAuth session validation
- `src/app/layout.tsx` - Add SessionProvider
- `src/app/login/page.tsx` - Simplify with NextAuth
- All API routes - Replace Firebase token checks

### **Files to Delete (After Migration)**
- `src/lib/firebase/client.ts`
- `src/lib/firebase/admin.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/auth/verify/route.ts`

---

## ⚠️ Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| User sessions break | HIGH | Parallel system during migration |
| Data loss | HIGH | Backup database before migration |
| OAuth config issues | MEDIUM | Test in development first |
| User confusion | LOW | Clear communication & UX |

---

## ✅ Testing Checklist

- [ ] Users can sign in with Google
- [ ] User profile data preserved
- [ ] Session persists across page reloads
- [ ] Protected routes work correctly
- [ ] Admin routes enforce role checks
- [ ] API routes validate sessions
- [ ] Sign out works properly
- [ ] Error pages display correctly
- [ ] Performance is acceptable
- [ ] No console errors

---

## 📊 Success Metrics

- **Migration Success Rate:** >99%
- **Session Duration:** Unchanged
- **Auth Errors:** <0.1%
- **User Complaints:** <5
- **Code Reduction:** ~40% less auth code

---

## 🎓 Rollback Plan

If migration fails:
1. Revert middleware to Firebase checks
2. Revert API routes to Firebase verification
3. Keep NextAuth installed (no harm)
4. Investigate issues
5. Retry migration after fixes

---

**Estimated Time:** 4-6 hours  
**Risk Level:** Medium  
**User Impact:** Minimal (re-login required)  
**Code Complexity:** Reduced  
**Maintenance:** Simplified
