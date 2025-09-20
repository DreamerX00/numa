# 🚨 Google Sign-In Internal Error Fix

## Problem
You're getting `auth/internal-error` when trying to sign in with Google.

## Root Cause
This error typically occurs when:
1. **Google sign-in provider is not enabled** in Firebase Console
2. **OAuth configuration is incomplete**
3. **Authorized domains are not configured**

## ✅ STEP-BY-STEP FIX

### Step 1: Enable Google Sign-In Provider
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **numa-marketplace**
3. Navigate to: **Authentication** → **Sign-in method**
4. Find **Google** in the providers list
5. Click **Google** → **Enable** → **Save**

### Step 2: Configure OAuth Consent Screen
1. The Google provider setup will prompt you to configure OAuth
2. Follow the setup wizard to configure the OAuth consent screen
3. Add your app details and logo if needed

### Step 3: Add Authorized Domains
1. Stay in **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Add these domains:
   - `localhost`
   - `localhost:3000`
   - Your production domain (when deploying)

### Step 4: Verify Configuration
1. Go back to the debug tool: `http://localhost:3000/debug-auth`
2. Click "Test Firebase Config" - should show ✅
3. Click "Test Google Sign-In" - should now work

## 🔍 Additional Debugging

If the error persists, check:

### Firebase Project Settings
- Ensure `NEXT_PUBLIC_FIREBASE_PROJECT_ID=numa-marketplace` matches your actual project ID
- Verify all Firebase config values are from the correct project

### Browser Issues
- Try incognito/private mode
- Clear browser cache and cookies
- Allow popups for localhost

### Network Issues
- Disable any VPN or proxy
- Check firewall settings
- Try a different network

## ⚡ Quick Test
After making these changes:
```bash
# Restart your development server
npm run dev
```

Then test Google sign-in again using the debug tool.

## 📋 Checklist
- [ ] Google provider enabled in Firebase Console
- [ ] OAuth consent screen configured
- [ ] Authorized domains added (localhost)
- [ ] Development server restarted
- [ ] Google sign-in tested successfully

---

**Note**: The `auth/internal-error` is Firebase's generic error when OAuth is not properly configured. Following these steps should resolve the issue completely.