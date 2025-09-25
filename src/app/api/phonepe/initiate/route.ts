import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, rateLimitConfigs } from '@/lib/rate-limit';
import { getUserFromRequest } from '@/lib/auth/session';
import { 
  getPhonePeConfig, 
  generateXVerifyHeader, 
  createPaymentPayload, 
  generateMerchantTransactionId,
  validatePhonePeConfig,
  formatAmountToPaise
} from '@/lib/services/phonepe';
import type { CreatePhonePeOrderRequest, CreatePhonePeOrderResponse } from '@/lib/types/phonepe';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiter for payment initiation
const paymentRateLimit = rateLimit(rateLimitConfigs.payment);

// Validation schema for PhonePe payment initiation
const phonepeOrderSchema = z.object({
  // Order-based payment fields
  orderId: z.string().optional(),
  merchantTransactionId: z.string().optional(),
  amount: z.number()
    .min(1, "Amount must be at least ₹1")
    .max(100000, "Amount cannot exceed ₹1,00,000")
    .finite("Amount must be a valid number"),
  currency: z.string()
    .length(3, "Currency must be a 3-character code")
    .regex(/^[A-Z]{3}$/, "Currency must be uppercase letters only")
    .default("INR"),
  mobileNumber: z.string()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number")
    .optional(),
  customerName: z.string().optional(),
  email: z.string().email().optional(),
  callbackUrl: z.string().url().optional(),
  redirectUrl: z.string().url().optional()
});

// POST /api/phonepe/initiate
export async function POST(request: NextRequest) {
  return paymentRateLimit(request, async () => {
    try {
      // Validate PhonePe configuration
      const configValidation = validatePhonePeConfig();
      if (!configValidation.isValid) {
        console.error('PhonePe configuration errors:', configValidation.errors);
        return NextResponse.json(
          { 
            success: false,
            error: "PhonePe configuration error",
            details: configValidation.errors
          }, 
          { status: 500 }
        );
      }

      // Get authenticated user (optional for guest checkout)
      const authResult = await getUserFromRequest(request);
      let userId = 'guest';
      
      if (authResult && authResult.success) {
        userId = authResult.user.uid;
      }

      // Parse and validate request body
      const body = await request.json();
      const validationResult = phonepeOrderSchema.safeParse(body);

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return NextResponse.json(
          { 
            success: false,
            error: "Invalid payment request", 
            details: errors 
          },
          { status: 400 }
        );
      }

      const { 
        orderId, 
        merchantTransactionId: providedTransactionId,
        amount, 
        currency, 
        mobileNumber, 
        customerName,
        email,
        callbackUrl, 
        redirectUrl 
      } = validationResult.data;

      // Get PhonePe configuration
      const config = getPhonePeConfig();

      // Use provided transaction ID or generate a new one
      const merchantTransactionId = providedTransactionId || generateMerchantTransactionId('NUMA');

      // Create payment payload (amount is already in paise from frontend)
      const paymentPayload = {
        merchantId: config.merchantId,
        merchantTransactionId,
        merchantUserId: userId,
        amount: amount, // Amount is already in paise from frontend
        redirectUrl: redirectUrl || config.redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: callbackUrl || config.callbackUrl,
        mobileNumber,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      console.log('PhonePe Payment Payload:', JSON.stringify(paymentPayload, null, 2));

      // Encode payload to base64
      const base64Payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64');

      // Generate X-VERIFY header
      const xVerifyHeader = generateXVerifyHeader(base64Payload, config.saltKey, config.saltIndex);

      // Make API call to PhonePe
      const phonepeResponse = await fetch(`${config.hostUrl}/pg/v1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerifyHeader
        },
        body: JSON.stringify({
          request: base64Payload
        })
      });

      const responseData = await phonepeResponse.json();

      if (!phonepeResponse.ok) {
        console.error('PhonePe API error:', responseData);
        return NextResponse.json(
          { 
            success: false,
            error: "Payment initiation failed",
            details: responseData.message || 'Unknown error'
          },
          { status: 400 }
        );
      }

      // Return success response with payment URL
      const result: CreatePhonePeOrderResponse = {
        success: true,
        paymentUrl: responseData.data?.instrumentResponse?.redirectInfo?.url,
        merchantTransactionId,
        transactionId: responseData.data?.transactionId
      };

      return NextResponse.json(result);

    } catch (error: any) {
      console.error('/api/phonepe/initiate error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: "Internal server error",
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        },
        { status: 500 }
      );
    }
  });
}