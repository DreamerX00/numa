import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    notifications: {
      email: { orderUpdates: true, promotions: false },
      sms: { orderUpdates: true },
      push: { orderUpdates: true },
    },
  });
}
