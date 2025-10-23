import { NextResponse } from 'next/server';
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

export async function GET() {
  const startTime = Date.now();
  
  // Simple health check - no detailed information exposed
  // For detailed checks, use admin dashboard or server logs
  
  try {
    if (process.env.NODE_ENV === 'development') console.log('🔍 Starting health check...');
    
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

    // 1. Database Connection Check (basic ping only)
    if (process.env.NODE_ENV === 'development') console.log('🗄️ Testing database connection...');
    const dbStart = Date.now();
    
    try {
      // Test basic connection with MongoDB ping
      await prisma.$runCommandRaw({ ping: 1 });
      const dbResponseTime = Date.now() - dbStart;
      
      healthStatus.checks.database = {
        status: 'healthy',
        responseTime: dbResponseTime,
        connection: 'active'
      };
      
      if (process.env.NODE_ENV === 'development') console.log(`✅ Database ping successful in ${dbResponseTime}ms`);
      
    } catch (dbError: unknown) {
      console.error('❌ Database connection failed:', dbError);
      
      healthStatus.checks.database = {
        status: 'unhealthy',
        responseTime: Date.now() - dbStart,
        connection: 'failed'
      };
      
      healthStatus.status = 'unhealthy';
    }

    // 2. Environment Variables Check (basic check only - no details exposed)
    if (process.env.NODE_ENV === 'development') console.log('🔧 Checking environment configuration...');
    
    const criticalEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXT_PUBLIC_FIREBASE_API_KEY'
    ];
    
    const missingCritical = criticalEnvVars.filter(envVar => !process.env[envVar]);
    
    healthStatus.checks.environment = {
      status: missingCritical.length === 0 ? 'healthy' : 'unhealthy'
    };

    // 3. Services Check (minimal info)
    if (process.env.NODE_ENV === 'development') console.log('🔗 Checking external services...');
    
    const hasCloudinary = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const hasFirebase = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const hasPayment = !!process.env.PHONEPE_MERCHANT_ID;
    
    healthStatus.checks.services = {
      status: (hasCloudinary && hasFirebase && hasPayment) ? 'healthy' : 'degraded'
    };

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
        check => check.status === 'degraded'
      );
      healthStatus.status = hasWarnings ? 'degraded' : 'healthy';
    }

    if (process.env.NODE_ENV === 'development') console.log(`🎯 Health check completed in ${totalResponseTime}ms - Status: ${healthStatus.status}`);

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
    
    const totalResponseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      responseTime: totalResponseTime,
      message: 'Health check system failure'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
}
