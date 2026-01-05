import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { getLDAPStatus } from '@/lib/ldap';

export async function GET() {
  const startTime = Date.now();
  
  try {
    const health: Record<string, unknown> = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime(),
      responseTime: 0,
      services: {
        database: { status: 'unknown', responseTime: 0 } as Record<string, unknown>,
        ldap: { status: 'unknown', configured: false } as Record<string, unknown>,
        environment: {
          nodeVersion: process.version,
          nodeEnv: process.env.NODE_ENV,
        }
      }
    };

    // Check database connection
    const dbStartTime = Date.now();
    try {
      await dbConnect();
      (health.services as Record<string, Record<string, unknown>>).database = {
        status: 'healthy',
        responseTime: Date.now() - dbStartTime
      };
    } catch {
      (health.services as Record<string, Record<string, unknown>>).database = {
        status: 'unhealthy',
        responseTime: Date.now() - dbStartTime,
        error: 'Database connection failed'
      };
      health.status = 'degraded';
    }

    // Check LDAP configuration
    const ldapStatus = getLDAPStatus();
    (health.services as Record<string, Record<string, unknown>>).ldap = {
      status: ldapStatus.enabled ? 'configured' : 'disabled',
      configured: ldapStatus.configured,
      error: ldapStatus.error
    };

    health.responseTime = Date.now() - startTime;

    // Determine overall status
    const services = health.services as Record<string, Record<string, unknown>>;
    const dbHealthy = services.database.status === 'healthy';
    
    if (!dbHealthy) {
      health.status = 'unhealthy';
    } else if ((services.database.responseTime as number) > 1000) {
      health.status = 'degraded';
    }

    const statusCode = health.status === 'unhealthy' ? 503 : 200;

    return NextResponse.json(health, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime,
      error: 'Health check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
