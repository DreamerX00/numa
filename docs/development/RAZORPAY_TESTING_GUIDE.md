# Razorpay Integration Testing Guide

This guide will help you test the complete Razorpay payment integration on your NUMA website.

## Prerequisites

1. **Environment Variables** - Ensure these are set in your `.env` file:
   ```bash
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxx
   RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
   ```

2. **Test Mode** - Always use test API keys during development
3. **HTTPS** - Webhooks require HTTPS (use ngrok for local testing)

## Test Payment Flow

### Step 1: Cart to Payment
1. Add products to cart on `/cart`
2. Click "Proceed to Pay"
3. Verify Razorpay checkout opens with:
   - Correct amount
   - Order details
   - NUMA branding

### Step 2: Test Cards
Use these Razorpay test cards:

**Successful Payment:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Expiry: Any future date

**Failed Payment:**
- Card: 4000 0000 0000 0002
- CVV: Any 3 digits  
- Expiry: Any future date

### Step 3: Verify Database Updates
After successful payment, check:
1. Order status changed to `CONFIRMED`
2. Payment status changed to `PAID`
3. Inventory decremented
4. Cart items cleared
5. Payment ID recorded

### Step 4: Test Webhook (Local Development)

1. **Install ngrok:**
   ```bash
   # Download from https://ngrok.com/
   ngrok http 3000
   ```

2. **Configure webhook URL in Razorpay Dashboard:**
   - URL: `https://your-ngrok-url.ngrok.io/api/razorpay/webhook`
   - Events: `payment.captured`, `payment.failed`

3. **Test webhook:**
   - Make a payment
   - Check webhook logs in Razorpay dashboard
   - Verify order status updates

## API Endpoint Testing

### 1. Create Order
```bash
curl -X POST http://localhost:3000/api/orders/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-firebase-token" \
  -d '{
    "cartItems": [
      {
        "productId": "product-id",
        "quantity": 1,
        "price": 29900
      }
    ]
  }'
```

### 2. Create Razorpay Order
```bash
curl -X POST http://localhost:3000/api/razorpay/order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-firebase-token" \
  -d '{
    "amount": 29900,
    "currency": "INR",
    "receipt": "test-receipt-123"
  }'
```

### 3. Verify Payment
```bash
curl -X POST http://localhost:3000/api/razorpay/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-firebase-token" \
  -d '{
    "razorpay_order_id": "order_test_id",
    "razorpay_payment_id": "pay_test_id",
    "razorpay_signature": "test_signature"
  }'
```

## Error Scenarios to Test

1. **Insufficient Stock:**
   - Add more items to cart than available inventory
   - Verify error message

2. **Invalid Payment:**
   - Use invalid card details
   - Verify payment failure handling

3. **Network Issues:**
   - Simulate network interruption during payment
   - Verify order state consistency

4. **Signature Verification:**
   - Test with invalid signature
   - Verify security validation

## Production Checklist

Before going live:

1. ✅ Replace test keys with live keys
2. ✅ Configure production webhook URL
3. ✅ Test with real bank cards (small amounts)
4. ✅ Verify email notifications work
5. ✅ Test refund process
6. ✅ Verify settlement configuration
7. ✅ Set up monitoring and alerts
8. ✅ Test failure scenarios

## Monitoring

Monitor these metrics:
- Payment success rate
- Order completion rate
- Webhook delivery success
- API response times
- Error rates

## Support

If you encounter issues:
1. Check Razorpay dashboard logs
2. Review webhook delivery logs
3. Check browser console for client-side errors
4. Verify API response codes
5. Contact Razorpay support if needed

## Security Notes

- Never expose secret keys in client-side code
- Always verify payment signatures
- Use HTTPS in production
- Implement proper rate limiting
- Log security events