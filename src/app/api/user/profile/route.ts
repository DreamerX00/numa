import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    user: {
      id: 'temp-id',
      email: 'user@example.com',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        firstName: 'Guest',
        lastName: 'User',
        displayName: 'Guest User',
        phone: '',
        dateOfBirth: '',
        gender: '',
      },
    },
  });
}
