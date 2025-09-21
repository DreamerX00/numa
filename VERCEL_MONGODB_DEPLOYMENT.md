# 🚀 Vercel + MongoDB Atlas Deployment Guide

## 🔍 Common Issues and Solutions

### 1. **MongoDB Atlas IP Whitelist (Most Common)**

**Problem**: Vercel serverless functions run from dynamic IP addresses that change frequently.

**Solution**: Allow all IPs in MongoDB Atlas (for production, consider more secure alternatives)

1. Go to MongoDB Atlas Dashboard
2. Navigate to **Network Access**
3. Click **Add IP Address**
4. Choose **Allow Access from Anywhere** (0.0.0.0/0)
5. Or add these Vercel IP ranges:
   ```
   76.76.19.0/24
   76.76.21.0/24
   ```

### 2. **Connection String Issues**

**Problem**: Special characters in password not properly encoded.

**Current Connection String:**
```
mongodb+srv://NUMA-admin:Tanisha%40123@numa-cluster.opyvpbu.mongodb.net/numa?retryWrites=true&w=majority&appName=NUMA-cluster
```

**Verification**: Your password encoding looks correct (`%40` for `@`)

### 3. **Serverless Function Timeout**

**Problem**: MongoDB connections can timeout in serverless environment.

**Solution**: Optimize Prisma connection handling.

### 4. **Environment Variables**

**Problem**: Environment variables not properly set in Vercel.

**Verification Needed**: Check if all env vars are set in Vercel dashboard.

## 🛠️ Debugging Steps

### Step 1: Check MongoDB Atlas Network Access

1. Login to MongoDB Atlas
2. Go to **Network Access**
3. Ensure `0.0.0.0/0` is whitelisted OR add Vercel IPs

### Step 2: Test Connection in Vercel

Add a test API route to debug connection:

```typescript
// pages/api/test-db.ts (or app/api/test-db/route.ts)
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1`;
    
    return Response.json({ 
      success: true, 
      message: 'Database connected successfully',
      result 
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return Response.json({ 
      success: false, 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}
```

### Step 3: Check Vercel Environment Variables

Ensure these are set in Vercel Dashboard:
- `DATABASE_URL`
- All Firebase config variables
- Razorpay keys

### Step 4: Optimize Prisma for Serverless

Update your Prisma client configuration:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

## 🔧 Advanced Solutions

### Connection Pooling for Serverless

Add these parameters to your MongoDB connection string:

```
mongodb+srv://NUMA-admin:Tanisha%40123@numa-cluster.opyvpbu.mongodb.net/numa?retryWrites=true&w=majority&appName=NUMA-cluster&maxPoolSize=10&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&family=4
```

### Vercel-Specific Configuration

Create `vercel.json` in your project root:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "MONGODB_TIMEOUT": "10000"
  }
}
```

## 🚨 Security Recommendations

### For Production

Instead of allowing all IPs (0.0.0.0/0), consider:

1. **VPC Peering** (MongoDB Atlas M10+ clusters)
2. **Private Endpoints** (Atlas M10+ clusters)
3. **Specific IP ranges** for your hosting provider

### Environment Variables Security

- Never commit `.env` files
- Use Vercel's environment variable encryption
- Rotate API keys regularly

## 🧪 Testing Checklist

- [ ] MongoDB Atlas allows Vercel IPs
- [ ] Environment variables set in Vercel
- [ ] Test API route returns data
- [ ] Database operations work in production
- [ ] Connection pooling configured
- [ ] Timeout settings optimized

## 📞 Need Help?

If issues persist:
1. Check Vercel function logs
2. Check MongoDB Atlas connection logs
3. Test with a simple database query
4. Verify network access settings
