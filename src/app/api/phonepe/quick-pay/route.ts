import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { 
  getPhonePeConfig, 
  generateXVerifyHeader, 
  createPaymentPayload, 
  generateMerchantTransactionId,
  validatePhonePeConfig
} from '@/lib/services/phonepe';
import type { CreatePhonePeOrderResponse } from '@/lib/types/phonepe';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Rate limiter for demo/quick payment endpoints
const quickPaymentRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxAttempts: 5, // 5 attempts per minute for demo
});

// Validation schema for quick payments
const quickPaySchema = z.object({
  amount: z.number()
    .min(1, "Amount must be at least ₹1")
    .max(10000, "Amount cannot exceed ₹10,000")
    .finite("Amount must be a valid number"),
  currency: z.string()
    .length(3, "Currency must be a 3-character code")
    .regex(/^[A-Z]{3}$/, "Currency must be uppercase letters only")
    .optional()
    .default("INR"),
  mobileNumber: z.string()
    .regex(/^[6-9]\d{9}$/, "Invalid mobile number")
    .optional(),
});

// POST /api/phonepe/quick-pay
export async function POST(req: NextRequest) {
  return quickPaymentRateLimit(req, async () => {
    try {
      // Validate PhonePe configuration
      const configValidation = validatePhonePeConfig();
      if (!configValidation.isValid) {
        console.error('PhonePe configuration errors:', configValidation.errors);
        return NextResponse.json(
          { 
            success: false,
            error: "PhonePe configuration error"
          }, 
          { status: 500 }
        );
      }

      // Parse and validate request body
      const body = await req.json();
      const validationResult = quickPaySchema.safeParse(body);
      
      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(err => 
          `${err.path.join('.')}: ${err.message}`
        );
        return NextResponse.json(
          { 
            success: false,
            error: "Invalid input", 
            details: errors 
          },
          { status: 400 }
        );
      }

      const { amount, mobileNumber } = validationResult.data;

      // Get PhonePe configuration
      const config = getPhonePeConfig();

      // Generate unique transaction ID for quick payment
      const merchantTransactionId = generateMerchantTransactionId('QUICK');
      const merchantUserId = `quick_user_${Date.now()}`;

      // Create payment payload
      const paymentPayload = createPaymentPayload(
        config.merchantId,
        merchantTransactionId,
        merchantUserId,
        amount,
        config.redirectUrl,
        config.callbackUrl,
        mobileNumber
      );

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

      if (!phonepeResponse.ok || !responseData.success) {
        console.error('PhonePe quick payment error:', responseData);
        return NextResponse.json(
          { 
            success: false,
            error: "Quick payment initiation failed",
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

    } catch (error: unknown) {
      console.error('/api/phonepe/quick-pay error:', error);
      return NextResponse.json(
        { 
          success: false,
          error: "Internal server error",
          details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        },
        { status: 500 }
      );
    }
  });
}