import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getPhonePeConfig, 
  generateStatusXVerifyHeader,
  validatePhonePeConfig 
} from '@/lib/services/phonepe';
import type { PhonePeStatusResponse } from '@/lib/types/phonepe';

// Force dynamic rendering for Next.js 15 compatibility
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema for status check
const statusCheckSchema = z.object({
  merchantTransactionId: z.string().min(1, "Merchant transaction ID is required")
});

// GET /api/phonepe/status?merchantTransactionId=NUMA_123456
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const merchantTransactionId = searchParams.get('merchantTransactionId');

    // Validate input
    const validationResult = statusCheckSchema.safeParse({ merchantTransactionId });
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid merchant transaction ID" 
        },
        { status: 400 }
      );
    }

    // Get PhonePe configuration
    const config = getPhonePeConfig();

    // Generate X-VERIFY header for status check
    const xVerifyHeader = generateStatusXVerifyHeader(
      config.merchantId, 
      merchantTransactionId!, 
      config.saltKey, 
      config.saltIndex
    );

    // Make API call to PhonePe status endpoint
    const statusUrl = `${config.hostUrl}/pg/v1/status/${config.merchantId}/${merchantTransactionId}`;
    
    const phonepeResponse = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerifyHeader,
        'X-MERCHANT-ID': config.merchantId
      }
    });

    const responseData: PhonePeStatusResponse = await phonepeResponse.json();

    if (!phonepeResponse.ok) {
      console.error('PhonePe status check error:', responseData);
      return NextResponse.json(
        { 
          success: false,
          error: "Status check failed",
          details: responseData.message || 'Unknown error'
        },
        { status: 400 }
      );
    }

    // Return status response
    return NextResponse.json({
      success: responseData.success,
      data: {
        merchantTransactionId: responseData.data.merchantTransactionId,
        transactionId: responseData.data.transactionId,
        amount: responseData.data.amount / 100, // Convert from paise to rupees
        state: responseData.data.state,
        responseCode: responseData.data.responseCode,
        paymentInstrument: responseData.data.paymentInstrument
      },
      message: responseData.message
    });

  } catch (error: any) {
    console.error('/api/phonepe/status error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// POST /api/phonepe/status - Alternative method with body
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = statusCheckSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid merchant transaction ID" 
        },
        { status: 400 }
      );
    }

    // Redirect to GET method logic
    const { merchantTransactionId } = validationResult.data;
    const statusUrl = new URL('/api/phonepe/status', request.url);
    statusUrl.searchParams.set('merchantTransactionId', merchantTransactionId);
    
    return fetch(statusUrl.toString(), {
      method: 'GET',
      headers: request.headers
    });

  } catch (error: any) {
    console.error('/api/phonepe/status POST error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error" 
      },
      { status: 500 }
    );
  }
}