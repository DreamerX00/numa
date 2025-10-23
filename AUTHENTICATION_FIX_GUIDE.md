# Authentication Fix Guide - NUMA Platform

**Last Updated:** December 2024  
**Related:** Phase 8 Feature Audit  
**Priority:** 🔴 **CRITICAL - P0 BLOCKER**

---

## 🚨 Current Issues

### Issue 1: Firebase Authentication - Project Mismatch
**Status:** 🔴 **BROKEN - Blocking all Firebase authentication**

**Symptom:**
```
Error: Firebase ID token has incorrect 'aud' (audience) claim. 
Expected "my-numa-jwell" but got "numa-marketplace"
```

**Root Cause:**
- Frontend configuration: Project ID `my-numa-jwell`
- Service account file: Project ID `numa-marketplace`
- Mismatch prevents server-side Firebase token verification

**Impact:**
- ❌ Server-side authentication fails
- ❌ Protected API routes reject valid users
- ❌ Admin dashboard inaccessible
- ✅ Client-side login still works (but server rejects)

---

### Issue 2: NextAuth Google OAuth - Not Configured
**Status:** 🟡 **READY BUT INACTIVE**

**Current State:**
- ✅ NextAuth infrastructure complete
- ✅ Prisma schema includes Session/Account models
- ✅ Auth routes configured
- ❌ Google OAuth credentials empty in `.env`

**Environment Variables:**
```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

---

## 🔧 Fix #1: Firebase Service Account Replacement

### Prerequisites
- Access to Firebase Console
- Firebase project: `my-numa-jwell`
- Admin/Owner role in Firebase project

### Steps

#### 1. Download Correct Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **my-numa-jwell**
3. Click ⚙️ **Project Settings** (gear icon, top left)
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Confirm security warning
7. Download JSON file (will be named something like `my-numa-jwell-firebase-adminsdk-xxxxx.json`)

#### 2. Replace Service Account File

**Location:** `d:\Numa Website\numa\serviceAccountKey.json`

**Option A: Replace File Directly**
```bash
# Backup current file
mv serviceAccountKey.json serviceAccountKey.json.backup

# Copy downloaded file
# (Replace the path with your actual download location)
cp ~/Downloads/my-numa-jwell-firebase-adminsdk-xxxxx.json serviceAccountKey.json
```

**Option B: Copy Contents**
1. Open downloaded JSON file in text editor
2. Copy entire contents
3. Open `serviceAccountKey.json` in project root
4. Replace all contents with copied JSON
5. Save file

#### 3. Verify Service Account Content

Open `serviceAccountKey.json` and verify:

```json
{
  "type": "service_account",
  "project_id": "my-numa-jwell",  // ← MUST be "my-numa-jwell"
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxxxx@my-numa-jwell.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**Key Checks:**
- ✅ `"project_id": "my-numa-jwell"` (NOT "numa-marketplace")
- ✅ `client_email` contains `@my-numa-jwell.iam.gserviceaccount.com`
- ✅ `private_key` starts with `-----BEGIN PRIVATE KEY-----`

#### 4. Update Environment Variables (Optional)

If you want to use environment variables instead of the JSON file:

**Edit `.env`:**
```env
FIREBASE_PROJECT_ID=my-numa-jwell
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@my-numa-jwell.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
...your private key...
-----END PRIVATE KEY-----"
```

**Update `src/lib/firebase/admin.ts`:**
```typescript
// Option 1: Use environment variables (recommended for production)
import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Option 2: Use JSON file (current setup)
import admin from 'firebase-admin';
import serviceAccount from '../../../serviceAccountKey.json';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}
```

#### 5. Restart Development Server

**Stop current server:**
- Press `Ctrl+C` in terminal

**Start fresh:**
```bash
npm run dev
```

**IMPORTANT:** A full restart is required. Hot reload won't pick up service account changes.

#### 6. Test Authentication

**Test Endpoint:**
```bash
# Login first to get a session cookie, then:
curl -X POST http://localhost:3000/api/auth/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{}'
```

**Expected Response (Success):**
```json
{
  "success": true,
  "user": {
    "uid": "...",
    "email": "user@example.com",
    "displayName": "User Name"
  }
}
```

**Expected Response (Still Broken):**
```json
{
  "success": false,
  "error": "Firebase ID token has incorrect 'aud' (audience) claim"
}
```

#### 7. Verify Admin Dashboard Access

1. Login at: http://localhost:3000/login
2. Use admin account credentials
3. Navigate to: http://localhost:3000/admin
4. Should see dashboard (not redirect to login)

---

## 🔧 Fix #2: NextAuth Google OAuth Setup

### Prerequisites
- Google Cloud Console account
- Email to use for OAuth consent screen

### Steps

#### 1. Create Google Cloud Project (If Needed)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Project name: `NUMA E-Commerce` (or your choice)
4. Click **Create**
5. Wait for project creation (30-60 seconds)

#### 2. Enable Google+ API

1. In Google Cloud Console, select your project
2. Go to **APIs & Services** → **Library**
3. Search for "Google+ API"
4. Click **Google+ API**
5. Click **Enable** (if not already enabled)

#### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Click **Create**

**App Information:**
- App name: `NUMA E-Commerce`
- User support email: Your email
- Developer contact email: Your email

**App Domain (Optional for development):**
- Leave blank for now
- Add in production: `https://your-domain.com`

**Scopes:**
- Click **Add or Remove Scopes**
- Select:
  - `openid`
  - `profile`
  - `email`
- Click **Update**

**Test Users (Optional for development):**
- Add your test email addresses
- Required if consent screen is "Testing" mode

Click **Save and Continue** through remaining steps.

#### 4. Create OAuth Client ID

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `NUMA OAuth Client`

**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

**For Production (add later):**
```
https://your-domain.com
https://your-domain.com/api/auth/callback/google
```

5. Click **Create**
6. **IMPORTANT:** Copy your **Client ID** and **Client Secret**

#### 5. Update Environment Variables

**Edit `.env`:**
```env
# Google OAuth Configuration for NextAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop1234567890
```

**Verify Other NextAuth Variables:**
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=BHxqRz398J/hewMj3XUmNS1KF1gabpc2/P2Rppgjs6I=
```

#### 6. Update Prisma Schema (Verify)

**Check `prisma/schema.prisma`:**
```prisma
model Account {
  id                String  @id @default(auto()) @map("_id") @db.ObjectId
  userId            String  @db.ObjectId
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
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

If models are missing or different:

```bash
npx prisma db push
```

#### 7. Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

#### 8. Test Google OAuth Login

1. Go to http://localhost:3000/login
2. Look for "Sign in with Google" button
3. Click the button
4. Should redirect to Google login page
5. Select your Google account
6. Authorize the app
7. Should redirect back to your site (logged in)

**Expected Flow:**
```
/login → Google OAuth → /api/auth/callback/google → /profile (or homepage)
```

#### 9. Verify Database Records

After successful login, check MongoDB:

```javascript
// In MongoDB Compass or Atlas UI

// Check User collection
db.users.find({ email: "your-test-email@gmail.com" })

// Check Account collection
db.accounts.find({ provider: "google" })

// Check Session collection
db.sessions.find()
```

---

## 🔍 Troubleshooting

### Firebase Auth Issues

#### Error: "Audience claim mismatch"
**Solution:** Verify `serviceAccountKey.json` has correct project_id

#### Error: "Invalid private key"
**Solution:** Ensure private key includes `\n` characters for line breaks

#### Error: "Service account not found"
**Solution:** Check service account has "Firebase Admin SDK" role in Firebase Console

#### Error: "Permission denied"
**Solution:** 
1. Verify service account has permissions
2. Check Firebase Authentication is enabled
3. Verify user exists in Firebase Console

---

### NextAuth OAuth Issues

#### Error: "Invalid redirect URI"
**Solution:** 
1. Check redirect URI in Google Console matches exactly:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
2. No trailing slash
3. Correct protocol (http vs https)

#### Error: "Access blocked: This app's request is invalid"
**Solution:** 
1. OAuth consent screen not configured
2. Add test users if in "Testing" mode
3. Verify scopes are added

#### Error: "Invalid client secret"
**Solution:** 
1. Copy client secret again from Google Console
2. Verify no extra spaces in `.env`
3. Restart dev server after changing `.env`

#### Error: "Database error"
**Solution:** 
1. Run `npx prisma db push`
2. Verify MongoDB connection
3. Check Prisma schema syntax

#### Error: "Callback URL not found"
**Solution:** 
1. Verify `src/app/api/auth/[...nextauth]/route.ts` exists
2. Check file exports `GET` and `POST` handlers
3. Restart dev server

---

## ✅ Verification Checklist

### Firebase Authentication
- [ ] Service account file has `project_id: "my-numa-jwell"`
- [ ] Dev server fully restarted (not just hot reload)
- [ ] Login at `/login` works
- [ ] API call to protected route succeeds
- [ ] Admin dashboard accessible at `/admin`
- [ ] No "audience claim" errors in console

### NextAuth Google OAuth
- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth client created with correct redirect URI
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- [ ] Prisma schema includes Account, Session, VerificationToken
- [ ] `npx prisma db push` completed
- [ ] Dev server restarted
- [ ] "Sign in with Google" button visible on `/login`
- [ ] Google OAuth flow completes successfully
- [ ] User created in database after login
- [ ] Session persists across page refreshes

---

## 🚀 Post-Fix Actions

### After Firebase Fix
1. Test all protected API routes
2. Test admin dashboard features
3. Verify email notifications work
4. Test order creation flow
5. Update documentation with lessons learned

### After NextAuth Fix
1. Test Google login multiple times
2. Test logout and re-login
3. Verify session expiration works
4. Test with multiple Google accounts
5. Consider adding more OAuth providers (Facebook, Apple)

---

## 📚 Additional Resources

### Firebase
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Service Account Documentation](https://cloud.google.com/iam/docs/service-accounts)
- [Firebase Auth Errors](https://firebase.google.com/docs/auth/admin/errors)

### NextAuth
- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Google Provider Setup](https://authjs.dev/reference/providers/google)
- [Prisma Adapter](https://authjs.dev/reference/adapter/prisma)
- [MongoDB with NextAuth](https://authjs.dev/reference/adapter/mongodb)

### Google Cloud
- [OAuth 2.0 Setup](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Consent Screen](https://support.google.com/cloud/answer/10311615)
- [Authorized Redirect URIs](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)

---

## 🆘 Need Help?

### Common Questions

**Q: Can I use both Firebase Auth and NextAuth?**  
A: Yes! The middleware supports dual auth. Users can login with either method.

**Q: Which auth should I use?**  
A: 
- Firebase: Email/password, phone auth, existing users
- NextAuth: Social login (Google, GitHub, etc.)
- Both work simultaneously

**Q: Do I need to migrate users?**  
A: No. Both auth systems work independently. Users can use either.

**Q: What if I only want one auth system?**  
A: 
- Keep Firebase: Remove NextAuth routes and Google OAuth setup
- Keep NextAuth: Disable Firebase in middleware and remove Firebase config

**Q: Can I add more OAuth providers?**  
A: Yes! NextAuth supports 70+ providers. Add them in `auth.config.ts`:
```typescript
providers: [
  GoogleProvider({ ... }),
  GithubProvider({ ... }),
  FacebookProvider({ ... }),
  // etc.
]
```

---

**Document Version:** 1.0  
**Last Tested:** December 2024  
**Status:** Ready for use
