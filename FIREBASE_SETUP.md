# Firebase Admin SDK Setup Instructions

## Problem
The authentication is failing because Firebase Admin SDK is not properly configured. You're seeing this error:
```
/api/auth/login error Error: Missing Firebase Admin env vars
```

## Solution Options

### Option 1: Service Account JSON File (Recommended for Development)

1. **Generate Service Account Key:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `numa-marketplace`
   - Go to Project Settings (gear icon) → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file

2. **Add the file to your project:**
   - Rename the downloaded file to `serviceAccountKey.json`
   - Place it in the project root: `d:\Numa Website\numa\serviceAccountKey.json`
   - Make sure it's in your `.gitignore` file (already added)

3. **Restart your server:**
   ```bash
   npm run dev
   ```

### Option 2: Environment Variables (Production/Hosting)

If you prefer using environment variables, extract these values from your service account JSON and add them to `.env`:

```env
FIREBASE_PROJECT_ID=numa-marketplace
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@numa-marketplace.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

## Verification

After setup, you should see one of these messages in your terminal:
- `Firebase Admin initialized with service account file`
- `Firebase Admin initialized with environment variables`

## Security Notes

- ⚠️ **NEVER** commit `serviceAccountKey.json` to version control
- ⚠️ **NEVER** share your private key publicly
- ✅ The file is already added to `.gitignore`
- ✅ Environment variables are safe for production deployment

## Quick Test

1. Try logging in again at: http://localhost:3001/login
2. The authentication should now work properly
3. You should be redirected to your profile page successfully

---

**Current Firebase Project ID:** `numa-marketplace`
**Template file created:** `serviceAccountKey.json.template`