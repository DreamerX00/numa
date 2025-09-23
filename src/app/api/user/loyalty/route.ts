import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    loyaltyProgram: {
      points: 0,
      tier: 'Bronze',
      nextTierPoints: 1000,
    },
  });
}
