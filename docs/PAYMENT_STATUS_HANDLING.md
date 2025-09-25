# Payment Status Handling Documentation

## Overview
The Numa website now supports comprehensive payment status handling for PhonePe and other payment gateway integrations. The system intelligently routes users to appropriate pages based on payment status and provides detailed feedback for each scenario.

## Payment Flow Architecture

### 1. Payment Success Router (`/payment-success`)
**Purpose**: Central hub that receives all payment gateway redirects and routes to appropriate pages.

**Supported Status Values**:
- `success`, `completed`, `captured` → Routes to `/order-success`
- `failed`, `failure`, `declined`, `error` → Routes to `/payment-failed`
- `cancelled`, `canceled`, `cancelled_by_user` → Routes to `/payment-failed` with cancellation message
- `pending`, `processing`, `initiated` → Routes to `/payment-pending`
- Any unknown status → Routes to `/order-success` with status preserved

**Visual Indicators**:
- ✅ Green checkmark for successful payments
- ❌ Red X for failed payments  
- ⚠️ Orange alert for cancelled payments
- ⏱️ Blue clock for pending payments
- ⟳ Spinning loader during redirects

### 2. Order Success Page (`/order-success`)
**Purpose**: Confirms successful payment completion and provides transaction details.

**Features**:
- Dynamic success messages based on payment status
- Transaction details card showing Order ID and Payment ID
- Status badge with color coding
- Continue shopping and home navigation buttons
- Email confirmation notice

**Status Messages**:
- `completed`: "Payment Completed!" - Payment fully processed
- `captured`: "Payment Captured!" - Payment captured, order processing
- Default: "Order Confirmed!" - Standard success message

### 3. Payment Failed Page (`/payment-failed`)
**Purpose**: Handles failed payments with specific error messaging and retry options.

**Enhanced Error Types**:
- `verification_failed`: Payment verification issues
- `payment_failed`: General payment processing failure
- `payment_cancelled`: User cancelled payment 
- `insufficient_funds`: Insufficient account balance
- `card_declined`: Card declined by bank
- `expired_card`: Card has expired
- `network_error`: Connection issues
- `timeout`: Request timeout
- `invalid_details`: Invalid payment information
- `transaction_limit`: Exceeds card limits
- `blocked_card`: Card blocked by bank

**Features**:
- Specific error messages for each failure type  
- Retry payment button
- Alternative payment methods suggestion
- Support contact information
- Refund timeline information

### 4. Payment Pending Page (`/payment-pending`)
**Purpose**: Handles payments that are still being processed.

**Features**:
- Animated processing indicator
- Transaction details display
- Status explanation ("What happens next?")
- Track payment button
- Timeline expectations
- Support contact information

## Implementation Details

### URL Parameters Handled
All pages accept and process these parameters:
- `order_id` / `merchantTransactionId`: Order identifier
- `payment_id` / `transactionId`: Payment transaction ID  
- `status` / `code`: Payment status from gateway
- `error`: Specific error type for failed payments

### PhonePe Integration
The system is optimized for PhonePe's redirect parameters but works with any payment gateway that sends similar URL parameters.

**PhonePe Success URL**: `https://yoursite.com/payment-success`
**PhonePe Failure URL**: `https://yoursite.com/payment-success` (system handles routing)

### Redirect Timing
- Status display: 1.5 seconds
- Redirect transition: 0.5 seconds  
- Total user feedback: 2 seconds before redirect

## User Experience Flow

1. User completes payment on PhonePe/payment gateway
2. Gateway redirects to `/payment-success` with status parameters
3. Payment success page shows appropriate status icon and message
4. After 2 seconds, user is redirected to appropriate destination:
   - Success → Order confirmation with transaction details
   - Failed → Error page with specific messaging and retry options
   - Pending → Status page with processing information
   - Cancelled → Error page with cancellation messaging

## Testing URLs

### Success Flow
```
http://localhost:3000/payment-success?status=success&order_id=ORDER123&payment_id=PAY456
```

### Failed Payment
```
http://localhost:3000/payment-success?status=failed&order_id=ORDER123&payment_id=PAY456
```

### Pending Payment  
```
http://localhost:3000/payment-success?status=pending&order_id=ORDER123&payment_id=PAY456
```

### Cancelled Payment
```
http://localhost:3000/payment-success?status=cancelled&order_id=ORDER123&payment_id=PAY456
```

## Error Handling
- All pages include Suspense wrappers for loading states
- Hydration mismatch prevention with mounted state checks
- Graceful fallbacks for missing parameters
- Default error messages for unknown error types

## Future Enhancements
- Payment status webhook integration
- Real-time status updates for pending payments
- Email notification integration
- SMS status updates
- Payment analytics tracking