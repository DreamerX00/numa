import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    accountSettings: {
      language: 'en',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      theme: 'light',
    },
  });
}
