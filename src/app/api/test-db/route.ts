import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📍 Environment:', process.env.NODE_ENV);
    console.log('🌐 Database URL exists:', !!process.env.DATABASE_URL);
    
    // Test 1: Simple database connection
    console.log('⚡ Testing Prisma connection...');
    const connectionTest = await prisma.$runCommandRaw({ ping: 1 });
    console.log('✅ Prisma connection successful:', connectionTest);
    
    // Test 2: Count documents in a collection
    console.log('📊 Testing collection access...');
    const categoryCount = await prisma.category.count();
    console.log('📈 Categories found:', categoryCount);
    
    // Test 3: Fetch sample data
    console.log('🔍 Testing data retrieval...');
    const sampleCategories = await prisma.category.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        _count: {
          select: { products: true }
        }
      }
    });
    console.log('📦 Sample categories:', sampleCategories);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful! 🎉',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      tests: {
        connection: '✅ Success',
        categoryCount: categoryCount,
        sampleData: sampleCategories
      }
    }, { status: 200 });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorCode = error instanceof Error && 'code' in error ? (error as Error & { code: string }).code : undefined;
    const errorName = error instanceof Error ? error.name : 'Unknown';
    
    console.error('❌ Database connection failed:', error);
    console.error('📊 Error details:', {
      message: errorMessage,
      code: errorCode,
      name: errorName,
      stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed 💥',
      error: errorMessage,
      errorCode: errorCode,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      troubleshooting: {
        commonIssues: [
          '🔒 MongoDB Atlas IP whitelist not configured for Vercel',
          '🔑 DATABASE_URL environment variable not set in Vercel',
          '⏱️ Connection timeout (check network access)',
          '🔐 Authentication credentials invalid'
        ],
        nextSteps: [
          '1. Check MongoDB Atlas Network Access settings',
          '2. Verify environment variables in Vercel dashboard',
          '3. Ensure database name and credentials are correct',
          '4. Check Vercel function logs for detailed errors'
        ]
      }
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Test creating a simple log entry
    console.log('🧪 Testing write operation...');
    
    // You can extend this to test write operations
    return NextResponse.json({
      success: true,
      message: 'Write test endpoint ready',
      receivedData: body
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Write test failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Write test failed',
      error: errorMessage
    }, { status: 500 });
  }
}