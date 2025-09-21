# 🚀 Vercel MongoDB Connection Issue Troubleshooting

## Current Status ✅
- ✅ MongoDB Atlas IP Whitelist: `0.0.0.0/0` (configured)
- ✅ Local connection: Working
- ❌ Vercel connection: Not working

## 🔍 Next Steps to Debug

### 1. **Enhanced Connection String for Serverless**

Replace your current `DATABASE_URL` in Vercel with this optimized version:

```
mongodb+srv://NUMA-admin:Tanisha%40123@numa-cluster.opyvpbu.mongodb.net/numa?retryWrites=true&w=majority&appName=NUMA-cluster&maxPoolSize=10&serverSelectionTimeoutMS=5000&connectTimeoutMS=10000&socketTimeoutMS=45000&family=4&maxIdleTimeMS=30000&minPoolSize=5&heartbeatFrequencyMS=10000
```

**Key additions:**
- `serverSelectionTimeoutMS=5000` - Faster server selection
- `connectTimeoutMS=10000` - 10s connection timeout
- `socketTimeoutMS=45000` - Socket timeout for long operations
- `maxPoolSize=10` - Limit connection pool for serverless
- `maxIdleTimeMS=30000` - Close idle connections faster
- `minPoolSize=5` - Minimum connections
- `heartbeatFrequencyMS=10000` - Check server health every 10s

### 2. **Environment Variables Checklist**

Ensure these are set in **Vercel Dashboard → Project Settings → Environment Variables**:

**Critical Variables:**
```
DATABASE_URL=mongodb+srv://... (with optimized parameters above)
NODE_ENV=production
NEXTAUTH_SECRET=your-random-secret-string
```

**Firebase Variables:**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCsx3K1k6iL0lU_Z5ckK4WdES93qBsyqOU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=numa-marketplace.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=numa-marketplace
FIREBASE_PROJECT_ID=numa-marketplace
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@numa-marketplace.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

### 3. **MongoDB Atlas Health Check**

1. Go to MongoDB Atlas Dashboard
2. Check if cluster is **Active** (not paused)
3. Go to **Database Access** → Verify user `NUMA-admin` exists and has correct permissions
4. Go to **Monitoring** → Check recent connection attempts

### 4. **Deploy and Test**

After setting environment variables, deploy and test:
```
https://your-vercel-domain.vercel.app/api/test-db
```

### 5. **Common Issues & Solutions**

| Issue | Solution |
|-------|----------|
| Connection timeout | Use optimized connection string above |
| Auth failed | Check MongoDB user credentials |
| Database not found | Verify database name is `numa` |
| Serverless cold start | Add connection pooling parameters |
| Environment vars missing | Double-check all vars in Vercel dashboard |

### 6. **Debugging Steps**

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Functions tab
   - Check logs for error messages

2. **Test with simple query:**
   - Use `/api/test-db` endpoint
   - Check response for specific error messages

3. **MongoDB Atlas Monitoring:**
   - Check connection attempts in Atlas dashboard
   - Look for failed authentication or connection errors

### 7. **Alternative Connection String (if above fails)**

Try this minimal version:
```
mongodb+srv://NUMA-admin:Tanisha%40123@numa-cluster.opyvpbu.mongodb.net/numa?retryWrites=true&w=majority
```

## 🚨 Critical Actions

1. **Update Vercel Environment Variables** with optimized `DATABASE_URL`
2. **Redeploy** your application
3. **Test** the `/api/test-db` endpoint
4. **Check Vercel function logs** for specific errors
5. **Monitor MongoDB Atlas** for connection attempts

## 📞 If Still Failing

Share the error message from:
1. Vercel function logs
2. `/api/test-db` endpoint response
3. MongoDB Atlas monitoring logs

This will help identify the specific root cause.