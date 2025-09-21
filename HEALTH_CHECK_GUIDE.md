# 🏥 Health Check System

A comprehensive health monitoring system to verify MongoDB connectivity and overall system status for your Vercel deployment.

## 📋 Endpoints

### 1. Basic Health Check
```
GET /api/health
```

**Response Example:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-22T10:30:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "uptime": 123.45,
  "responseTime": 45,
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 23,
      "connection": "active"
    },
    "environment": {
      "status": "healthy",
      "required": 6,
      "present": 6,
      "missing": []
    },
    "services": {
      "status": "healthy",
      "available": {
        "cloudinary": true,
        "firebase": true,
        "razorpay": true,
        "email": true
      }
    }
  }
}
```

### 2. Detailed Health Check
```
GET /api/health?detailed=true
```

Includes additional information:
- Database collection counts
- Recent user activity
- Environment variable details

### 3. Health Check with Sample Data
```
GET /api/health?detailed=true&data=true
```

Includes sample data from your database to verify read operations.

### 4. Health Dashboard (Web UI)
```
GET /health
```

Visual dashboard for monitoring system health with real-time updates.

## 🎯 Status Codes

| Status | HTTP Code | Description |
|--------|-----------|-------------|
| `healthy` | 200 | All systems operational |
| `degraded` | 200 | System working with warnings |
| `unhealthy` | 503 | Critical issues detected |
| `error` | 500 | Health check system failure |

## 🔍 What Gets Checked

### Database Health
- ✅ MongoDB connection via Prisma
- ✅ Database ping response time
- ✅ Collection accessibility
- ✅ Sample data retrieval
- ✅ Read/write operation tests

### Environment Configuration
- ✅ Required environment variables presence
- ✅ Configuration completeness
- ✅ Missing variable detection

### External Services
- ✅ Cloudinary configuration
- ✅ Firebase setup
- ✅ Razorpay integration
- ✅ Email service configuration

## 🚀 Usage for Vercel Deployment

### During Deployment
Add health check to your deployment pipeline:

```bash
# Deploy to Vercel
vercel --prod

# Wait for deployment
sleep 30

# Test health
curl https://your-domain.vercel.app/api/health
```

### Monitoring Script
```bash
#!/bin/bash
DOMAIN="https://your-domain.vercel.app"

echo "🔍 Testing Vercel + MongoDB Health..."

# Basic health check
echo "📋 Basic Health Check:"
curl -s "$DOMAIN/api/health" | jq '.'

echo -e "\n📊 Detailed Health Check:"
curl -s "$DOMAIN/api/health?detailed=true&data=true" | jq '.'

echo -e "\n🗄️ Database Test:"
curl -s "$DOMAIN/api/test-db" | jq '.'
```

### Expected Results

**✅ Successful Deployment:**
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy", "responseTime": 45 },
    "environment": { "status": "healthy", "missing": [] },
    "services": { "status": "healthy" }
  }
}
```

**❌ Database Connection Failed:**
```json
{
  "status": "unhealthy",
  "checks": {
    "database": { 
      "status": "unhealthy", 
      "error": "MongooseTimeoutError: ..." 
    }
  }
}
```

## 🛠️ Troubleshooting

### Common Issues & Solutions

| Error | Cause | Solution |
|-------|--------|----------|
| `MongooseTimeoutError` | Connection timeout | Check MongoDB Atlas IP whitelist |
| `MongooseAuthenticationError` | Wrong credentials | Verify DATABASE_URL in Vercel |
| `Environment variable not found` | Missing env vars | Set variables in Vercel dashboard |
| `Service unavailable` | External service issue | Check service configurations |

### Debug Steps

1. **Check Health Dashboard:**
   ```
   https://your-domain.vercel.app/health
   ```

2. **Verify Environment Variables:**
   ```bash
   curl "https://your-domain.vercel.app/api/health?detailed=true" | jq '.checks.environment'
   ```

3. **Test Database Specifically:**
   ```bash
   curl "https://your-domain.vercel.app/api/test-db" | jq '.'
   ```

4. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard
   - Navigate to Functions tab
   - Look for `/api/health` logs

## 📱 Integration Examples

### GitHub Actions
```yaml
- name: Health Check
  run: |
    sleep 30  # Wait for deployment
    HEALTH=$(curl -s ${{ env.VERCEL_URL }}/api/health)
    STATUS=$(echo $HEALTH | jq -r '.status')
    if [ "$STATUS" != "healthy" ]; then
      echo "❌ Health check failed"
      echo $HEALTH | jq '.'
      exit 1
    fi
    echo "✅ Health check passed"
```

### Monitoring Alerts
```javascript
// Check health every 5 minutes
setInterval(async () => {
  try {
    const response = await fetch('/api/health');
    const health = await response.json();
    
    if (health.status !== 'healthy') {
      // Send alert to your monitoring system
      sendAlert(`System unhealthy: ${health.status}`);
    }
  } catch (error) {
    sendAlert(`Health check failed: ${error.message}`);
  }
}, 5 * 60 * 1000);
```

## 🔗 Related Endpoints

- `/api/test-db` - Database-specific testing
- `/api/admin/dashboard` - Admin health metrics
- `/health` - Visual health dashboard

## 📊 Response Time Benchmarks

| Check Type | Good | Warning | Critical |
|------------|------|---------|----------|
| Database | < 100ms | 100-500ms | > 500ms |
| Overall | < 200ms | 200-1000ms | > 1000ms |
| Environment | < 10ms | 10-50ms | > 50ms |

Use these endpoints to ensure your MongoDB connection is working properly on Vercel!