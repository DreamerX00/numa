# 🔄 **Razorpay → PhonePe Migration Plan**

## 📋 **Migration Overview**
Complete replacement of Razorpay payment system with PhonePe API integration for NUMA website.

---

## 🎯 **PHASE 1: ANALYSIS & PREPARATION**

### **Current Razorpay Implementation (To Replace)**
- **API Endpoints**: 4 Razorpay endpoints
- **Frontend Components**: 2 payment components  
- **Environment Variables**: 4 Razorpay env vars
- **Package Dependencies**: `razorpay: "^2.9.6"`
- **Security Headers**: CSP rules for Razorpay domains

### **PhonePe Integration Requirements**
- **PhonePe Merchant Dashboard**: Account setup required
- **API Documentation**: PhonePe Payments API v4
- **Authentication**: X-VERIFY header with SHA256 hash
- **Environment**: Sandbox vs Production endpoints
- **Webhook**: Payment status callbacks

---

## 🔧 **PHASE 2: ENVIRONMENT SETUP**

### **New Environment Variables**
```bash
# PhonePe Configuration
PHONEPE_MERCHANT_ID=your_merchant_id
PHONEPE_SALT_KEY=your_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_HOST_URL=https://api-preprod.phonepe.com/apis/pg-sandbox  # Sandbox
# PHONEPE_HOST_URL=https://api.phonepe.com/apis/hermes          # Production
PHONEPE_REDIRECT_URL=https://yourdomain.com/payment-success
PHONEPE_CALLBACK_URL=https://yourdomain.com/api/phonepe/webhook
```

### **Package Dependencies Update**
```json
// Remove
"razorpay": "^2.9.6"

// Add
"crypto": "latest"  // For SHA256 hashing
"axios": "^1.12.2"  // Already exists - for API calls
```

---

## 🏗️ **PHASE 3: API ENDPOINTS MIGRATION**

### **1. Payment Initiation API**
- **Replace**: `/api/razorpay/order` 
- **With**: `/api/phonepe/initiate`
- **Purpose**: Create PhonePe payment request
- **Method**: POST to `/pg/v1/pay`

### **2. Payment Status Check API**
- **Replace**: `/api/razorpay/verify`
- **With**: `/api/phonepe/status`  
- **Purpose**: Check payment status
- **Method**: GET to `/pg/v1/status/{merchantId}/{transactionId}`

### **3. Webhook Handler**
- **Replace**: `/api/razorpay/webhook`
- **With**: `/api/phonepe/callback`
- **Purpose**: Handle PhonePe payment callbacks
- **Verification**: X-VERIFY header validation

### **4. Quick Payment (Optional)**
- **Replace**: `/api/razorpay/quick-buy`
- **With**: `/api/phonepe/quick-pay`
- **Purpose**: Simplified payment flow

---

## 🎨 **PHASE 4: FRONTEND COMPONENTS UPDATE**

### **1. Payment Button Component**
- **File**: `src/components/CheckoutButton.tsx`
- **Changes**: 
  - Remove Razorpay script loading
  - Update to PhonePe redirect flow
  - Change payment initiation logic

### **2. Checkout Payment Step**
- **File**: `src/components/checkout/PaymentStep.tsx`
- **Changes**:
  - Replace Razorpay modal with PhonePe redirect
  - Update payment flow handling
  - Modify success/failure handling

---

## 🔐 **PHASE 5: SECURITY & CONFIGURATION**

### **Security Headers Update**
- **File**: `src/lib/security-headers.ts`
- **Remove**: Razorpay domains
- **Add**: PhonePe domains
```typescript
"connect-src 'self' https://api.phonepe.com https://api-preprod.phonepe.com"
```

### **Type Definitions**
- **File**: `src/lib/types/phonepe.ts` (New)
- **Purpose**: PhonePe API interfaces and types

---

## 📊 **PHASE 6: DATABASE UPDATES**

### **Order Schema Updates**
- **Remove**: `razorpayOrderId` field
- **Add**: `phonePeTransactionId` field
- **Add**: `phonePeMerchantTransactionId` field

### **Payment Method Updates**
- **Update**: Payment method enum from 'razorpay' to 'phonepe'
- **Files**: Shipping configurations, order processing

---

## 🧪 **PHASE 7: TESTING STRATEGY**

### **API Testing**
- [ ] Payment initiation flow
- [ ] Status check functionality  
- [ ] Webhook signature verification
- [ ] Error handling scenarios

### **Frontend Testing**
- [ ] Payment button functionality
- [ ] Checkout flow integration
- [ ] Mobile responsiveness
- [ ] Success/failure redirects

---

## 📋 **MIGRATION CHECKLIST**

### **Pre-Migration**
- [ ] PhonePe merchant account setup
- [ ] API credentials obtained
- [ ] Sandbox testing environment ready

### **Code Changes**
- [ ] Remove Razorpay package dependency
- [ ] Update environment variables
- [ ] Replace API endpoints (4 files)
- [ ] Update frontend components (2 files)
- [ ] Modify security headers
- [ ] Create PhonePe type definitions
- [ ] Update database schema

### **Post-Migration**
- [ ] Test all payment flows
- [ ] Verify webhook handling
- [ ] Update documentation
- [ ] Production deployment
- [ ] Monitor payment processing

---

## ⚠️ **IMPORTANT CONSIDERATIONS**

### **PhonePe vs Razorpay Differences**
1. **Payment Flow**: PhonePe uses redirect-based flow vs Razorpay's modal
2. **Authentication**: SHA256 hash verification vs API key authentication  
3. **Webhooks**: Different signature verification method
4. **Mobile Integration**: PhonePe has strong UPI/mobile focus
5. **API Structure**: Different request/response formats

### **Business Impact**
- **Payment Methods**: PhonePe supports UPI, cards, wallets
- **User Experience**: Redirect flow vs modal overlay
- **Transaction Fees**: Different fee structures
- **Settlement**: Different settlement cycles

---

## 🚀 **NEXT STEPS**

1. **Confirm PhonePe Account Setup**
2. **Review PhonePe API Documentation**
3. **Start with Environment Variables**
4. **Begin API Endpoint Migration**
5. **Update Frontend Components**
6. **Test Integration Thoroughly**

Would you like me to start implementing any specific phase of this migration plan?