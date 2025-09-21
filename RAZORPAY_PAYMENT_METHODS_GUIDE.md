# 🎯 Enable All Razorpay Payment Methods (UPI, Cards, Wallets, etc.)

## ✅ Code Configuration (Already Implemented)

Your Razorpay integration now includes explicit configuration to enable all payment methods:

### Payment Methods Enabled:
- ✅ **UPI** (PhonePe, Google Pay, Paytm, BHIM, etc.)
- ✅ **Credit/Debit Cards** (Visa, Mastercard, RuPay, American Express)
- ✅ **Net Banking** (All major banks)
- ✅ **Digital Wallets** (PhonePe, Amazon Pay, Mobikwik, etc.)
- ✅ **Buy Now Pay Later** (Simpl, LazyPay, etc.)
- ✅ **EMI Options** (Credit card EMI)

## 🔧 Razorpay Dashboard Configuration

To ensure all payment methods are available, follow these steps:

### 1. Login to Razorpay Dashboard
- Visit: https://dashboard.razorpay.com/
- Login with your credentials

### 2. Payment Methods Configuration
Navigate to **Settings** → **Payment Methods**

#### Enable UPI:
- ✅ Check **UPI** in payment methods
- ✅ Enable all UPI apps (Google Pay, PhonePe, Paytm, BHIM, etc.)

#### Enable Cards:
- ✅ Check **Credit Cards**
- ✅ Check **Debit Cards** 
- ✅ Enable all card networks (Visa, Mastercard, RuPay, Amex)

#### Enable Net Banking:
- ✅ Check **Net Banking**
- ✅ Select all major banks (SBI, HDFC, ICICI, Axis, etc.)

#### Enable Wallets:
- ✅ Check **Wallets**
- ✅ Enable PhonePe, Amazon Pay, Mobikwik, JioMoney, etc.

#### Enable Buy Now Pay Later:
- ✅ Check **Pay Later**
- ✅ Enable Simpl, LazyPay, Flexmoney, etc.

### 3. Test vs Live Mode

#### In Test Mode:
- Some payment methods might have limited options
- UPI test flow uses dummy UPI IDs
- Card payments use test card numbers

#### For Full Payment Options:
1. **Submit KYC documents** (PAN, Bank details, Address proof)
2. **Complete account verification**
3. **Switch to Live Mode** after approval
4. **Use Live API keys** in production

### 4. Account Verification Status

Check your account status in Dashboard:
- **Unverified**: Limited payment methods
- **Under Review**: Some methods available
- **Activated**: All approved methods available

## 🧪 Testing Different Payment Methods

### Test UPI (Test Mode):
- UPI ID: `success@razorpay`
- UPI ID: `failure@razorpay`

### Test Cards:
```
Success Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

Failure Card: 4000 0000 0000 0002
```

### Test Net Banking:
- Select any bank from dropdown
- Use test credentials provided

## 📱 User Experience

With the updated configuration, users will see:

1. **Primary Payment Section**:
   - UPI (with QR code and UPI ID input)
   - Cards (Credit/Debit)

2. **More Payment Options**:
   - Net Banking (Bank dropdown)
   - Wallets (PhonePe, Amazon Pay, etc.)
   - Pay Later options

3. **Smart Defaults**:
   - UPI prioritized for mobile users
   - Cards for desktop users
   - Regional preferences based on location

## 🔍 Troubleshooting

### If UPI is still not visible:

1. **Check Razorpay Account Status**:
   - Login to dashboard
   - Verify account activation status
   - Complete pending verification steps

2. **Contact Razorpay Support**:
   - Email: support@razorpay.com
   - Phone: +91-80-6648-9999
   - Chat: Available in dashboard

3. **API Key Verification**:
   - Ensure using correct Test/Live keys
   - Check key permissions in dashboard

### If specific payment methods are missing:

1. **Payment Method Activation**:
   - Some methods require separate approval
   - Business type restrictions may apply
   - Regional availability differences

2. **Technical Integration**:
   - Clear browser cache
   - Test in incognito mode
   - Check network connectivity

## 🚀 Going Live

To enable all payment methods in production:

1. **Complete Business Verification**:
   - Submit required documents
   - Verify bank account
   - Complete KYC process

2. **Payment Method Approval**:
   - Request activation for specific methods
   - Meet eligibility criteria
   - Complete integration testing

3. **Switch to Live Keys**:
   - Replace test keys with live keys
   - Update webhook URLs
   - Test with real small amounts

## 📞 Support

If you're still not seeing all payment options:

- **Razorpay Support**: support@razorpay.com
- **Integration Guide**: https://razorpay.com/docs/
- **Dashboard Help**: Available in Razorpay Dashboard

---

**Note**: In test mode, some payment methods might appear limited. For the full range of payment options, complete account verification and switch to live mode.