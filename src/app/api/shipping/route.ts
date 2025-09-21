import { NextRequest, NextResponse } from 'next/server';
import { defaultShippingConfig, calculateShippingCost } from '@/lib/config/shipping';

export async function GET() {
  try {
    // TODO: Fetch from database when admin panel is implemented
    return NextResponse.json({
      success: true,
      data: defaultShippingConfig
    });
  } catch (error) {
    console.error('Failed to fetch shipping config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipping configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { orderTotal } = await req.json();
    
    if (!orderTotal || typeof orderTotal !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Invalid order total' },
        { status: 400 }
      );
    }

    const shippingCost = calculateShippingCost(orderTotal);
    
    return NextResponse.json({
      success: true,
      data: {
        orderTotal,
        shippingCost,
        qualifiesForFreeShipping: shippingCost === 0,
        config: defaultShippingConfig
      }
    });
  } catch (error) {
    console.error('Failed to calculate shipping:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate shipping cost' },
      { status: 500 }
    );
  }
}