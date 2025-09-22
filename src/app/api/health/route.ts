import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface HealthCheck {
  status: string;
  responseTime?: number;
  connection?: string;
  ping?: unknown;
  collections?: Record<string, number>;
  lastActivity?: unknown;
  error?: string;
  errorCode?: string;
  required?: number;
  present?: number;
  missing?: string[];
  details?: unknown;
  available?: Record<string, boolean>;
  sampleData?: unknown;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  environment: string | undefined;
  version: string;
  uptime: number;
  responseTime?: number;
  checks: {
    database: HealthCheck;
    environment: HealthCheck;
    services: HealthCheck;
  };
  error?: string;
  message?: string;
  troubleshooting?: {
    steps: string[];
  };
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  // Get query parameters for detailed checks
  const { searchParams } = new URL(request.url);
  const detailed = searchParams.get('detailed') === 'true';
  const includeData = searchParams.get('data') === 'true';
  
  try {
    console.log('🔍 Starting health check...');
    
    const healthStatus: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: { status: 'unknown', responseTime: 0 },
        environment: { status: 'unknown' },
        services: { status: 'unknown' }
      }
    };

    // 1. Database Connection Check
    console.log('🗄️ Testing database connection...');
    const dbStart = Date.now();
    
    try {
      // Test basic connection with MongoDB ping
      const pingResult = await prisma.$runCommandRaw({ ping: 1 });
      const dbResponseTime = Date.now() - dbStart;
      
      healthStatus.checks.database = {
        status: 'healthy',
        responseTime: dbResponseTime,
        connection: 'active',
        ping: pingResult
      };
      
      console.log(`✅ Database ping successful in ${dbResponseTime}ms`);
      
      // Additional database checks if detailed=true
      if (detailed) {
        console.log('📊 Running detailed database checks...');
        
        // Test actual data operations
        const [userCount, productCount, categoryCount] = await Promise.all([
          prisma.user.count(),
          prisma.product.count(),
          prisma.category.count()
        ]);
        
        healthStatus.checks.database.collections = {
          users: userCount,
          products: productCount,
          categories: categoryCount
        };
        
        // Test a simple query
        const recentUser = await prisma.user.findFirst({
          orderBy: { createdAt: 'desc' },
          select: { id: true, email: true, createdAt: true }
        });
        
        healthStatus.checks.database.lastActivity = {
          recentUser: recentUser ? {
            id: recentUser.id,
            email: recentUser.email.replace(/(.{2}).*@/, '$1***@'),
            createdAt: recentUser.createdAt
          } : null
        };
      }
      
    } catch (dbError: unknown) {
      console.error('❌ Database connection failed:', dbError);
      
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      const errorCode = dbError instanceof Error && 'code' in dbError ? (dbError as Error & { code: string }).code : undefined;
      
      healthStatus.checks.database = {
        status: 'unhealthy',
        responseTime: Date.now() - dbStart,
        error: errorMessage,
        errorCode: errorCode,
        connection: 'failed'
      };
      
      healthStatus.status = 'unhealthy';
    }

    // 2. Environment Variables Check
    console.log('🔧 Checking environment configuration...');
    
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'RAZORPAY_WEBHOOK_SECRET',
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET',
      'NEXT_PUBLIC_APP_URL'
    ];
    
    const envStatus = requiredEnvVars.map(envVar => ({
      name: envVar,
      present: !!process.env[envVar],
      value: process.env[envVar] ? 
        (envVar.includes('SECRET') || envVar.includes('KEY') ? 
          '***HIDDEN***' : 
          process.env[envVar]?.substring(0, 20) + '...'
        ) : undefined
    }));
    
    const missingEnvVars = envStatus.filter(env => !env.present);
    
    healthStatus.checks.environment = {
      status: missingEnvVars.length === 0 ? 'healthy' : 'warning',
      required: envStatus.length,
      present: envStatus.length - missingEnvVars.length,
      missing: missingEnvVars.map(env => env.name),
      ...(detailed && { details: envStatus })
    };

    // 3. Services Check
    console.log('🔗 Checking external services...');
    
    const serviceChecks = {
      cloudinary: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      firebase: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      razorpay: !!process.env.RAZORPAY_KEY_ID,
      email: !!process.env.SMTP_HOST || !!process.env.RESEND_API_KEY
    };
    
    healthStatus.checks.services = {
      status: Object.values(serviceChecks).every(Boolean) ? 'healthy' : 'warning',
      available: serviceChecks
    };

    // 4. Sample Data Check (if requested)
    if (includeData && healthStatus.checks.database.status === 'healthy') {
      console.log('📦 Fetching sample data...');
      
      try {
        const sampleCategories = await prisma.category.findMany({
          take: 3,
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: { products: true }
            }
          }
        });
        
        healthStatus.checks.database.sampleData = sampleCategories;
      } catch (sampleError) {
        console.warn('⚠️ Could not fetch sample data:', sampleError);
      }
    }

    // Calculate total response time
    const totalResponseTime = Date.now() - startTime;
    healthStatus.responseTime = totalResponseTime;

    // Determine overall status
    const hasUnhealthyChecks = Object.values(healthStatus.checks).some(
      check => check.status === 'unhealthy'
    );
    
    if (hasUnhealthyChecks) {
      healthStatus.status = 'unhealthy';
    } else {
      const hasWarnings = Object.values(healthStatus.checks).some(
        check => check.status === 'warning'
      );
      healthStatus.status = hasWarnings ? 'degraded' : 'healthy';
    }

    console.log(`🎯 Health check completed in ${totalResponseTime}ms - Status: ${healthStatus.status}`);

    // Return appropriate HTTP status code
    const httpStatus = healthStatus.status === 'healthy' ? 200 : 
                      healthStatus.status === 'degraded' ? 200 : 503;

    return NextResponse.json(healthStatus, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error: unknown) {
    console.error('💥 Health check failed:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const totalResponseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      responseTime: totalResponseTime,
      error: errorMessage,
      message: 'Health check system failure',
      troubleshooting: {
        steps: [
          'Check server logs for detailed error information',
          'Verify environment variables are properly set',
          'Ensure database connection string is correct',
          'Check if all required services are accessible'
        ]
      }
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}