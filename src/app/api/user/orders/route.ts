import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    orders: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
  });
}
