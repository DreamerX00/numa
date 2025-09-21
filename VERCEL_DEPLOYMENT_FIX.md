# 🚨 Vercel MongoDB Deployment Fix

Based on the health check results, here are the critical fixes needed:

## ❌ **Issues Identified:**

1. **Missing Environment Variable**: `NEXTAUTH_SECRET`
2. **Prisma Engine Compatibility**: Wrong binary for Vercel runtime

## ✅ **Fix #1: Add Missing Environment Variable**

### In Vercel Dashboard:

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add the missing variable:

```
Variable Name: NEXTAUTH_SECRET
Value: [Generate a secure secret - see below]
Environment: Production (and Preview if needed)
```

### Generate NEXTAUTH_SECRET:

**Option A - Using OpenSSL (if available):**
```bash
openssl rand -base64 32
```

**Option B - Using Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option C - Manual Generation:**
Use any of these example secrets (generate your own for production):
```
dGhpc2lzYXNlY3VyZXNlY3JldGZvcm5leHRhdXRo
YW5vdGhlcnNlY3VyZXJhbmRvbXN0cmluZ2ZvcmF1dGg=
c3VwZXJzZWN1cmVyYW5kb21zdHJpbmdmb3JhdXRoZW50aWNhdGlvbg==
```

## ✅ **Fix #2: Prisma Engine Binary (Already Fixed)**

I've updated your `prisma/schema.prisma` to include the correct binary target:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}
```

This ensures Prisma works on both your local machine and Vercel's runtime.

## 🚀 **Complete Deployment Steps:**

### 1. **Set Environment Variables in Vercel:**

Go to Vercel Dashboard and add these variables:

```bash
# Required (Missing)
NEXTAUTH_SECRET=your-generated-secret-here

# Verify these are also set (should already be present)
DATABASE_URL=mongodb+srv://NUMA-admin:Tanisha%40123@numa-cluster.opyvpbu.mongodb.net/numa?retryWrites=true&w=majority&appName=NUMA-cluster&maxPoolSize=10&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&socketTimeoutMS=45000&family=4&maxIdleTimeMS=30000&minPoolSize=5&heartbeatFrequencyMS=10000

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCsx3K1k6iL0lU_Z5ckK4WdES93qBsyqOU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=numa-marketplace.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=numa-marketplace
FIREBASE_PROJECT_ID=numa-marketplace
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@numa-marketplace.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"

RAZORPAY_KEY_ID=rzp_test_RJoMigbCl9BBBA
RAZORPAY_KEY_SECRET=xzlko0wp4NA1LvXdB97lW9qg
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_RJoMigbCl9BBBA

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dkdu1rzki
CLOUDINARY_API_KEY=923573536679437
CLOUDINARY_API_SECRET=DC9W2GZSb2zdcgL6MJ-FpX3Dzi4
```

### 2. **Regenerate Prisma Client:**

```bash
# Generate new Prisma client with correct binary targets
npx prisma generate

# Build with updated configuration
npm run build
```

### 3. **Deploy to Vercel:**

```bash
# Deploy with updated configuration
vercel --prod
```

### 4. **Test After Deployment:**

```bash
# Wait 30 seconds for deployment to complete
sleep 30

# Test health check
curl https://your-domain.vercel.app/api/health?detailed=true

# Expected result should show:
# "status": "healthy"
# "database": { "status": "healthy" }
# "environment": { "missing": [] }
```

## 🎯 **Expected Results After Fix:**

**✅ Successful Health Check:**
```json
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 45,
      "connection": "active"
    },
    "environment": {
      "status": "healthy",
      "required": 6,
      "present": 6,
      "missing": []
    },
    "services": {
      "status": "healthy"
    }
  }
}
```

## 🔧 **If Issues Persist:**

### Check Vercel Function Logs:
1. Go to Vercel Dashboard
2. Navigate to **Functions** tab
3. Look for `/api/health` function logs
4. Check for any remaining errors

### Alternative Binary Targets:
If the issue persists, try these additional binary targets in `schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x", "linux-musl", "debian-openssl-1.1.x"]
}
```

### Test Locally First:
```bash
# Ensure it works locally with new configuration
npm run build
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health
```

## 📋 **Checklist:**

- [ ] Add `NEXTAUTH_SECRET` to Vercel environment variables
- [ ] Verify all other environment variables are set
- [ ] Prisma schema updated with correct binary targets
- [ ] Regenerate Prisma client: `npx prisma generate`
- [ ] Build project: `npm run build`
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Test health check: `/api/health`
- [ ] Verify MongoDB connection: `/api/test-db`

After completing these steps, your MongoDB connection should work properly on Vercel!