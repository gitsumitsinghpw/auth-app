import { NextRequest, NextResponse } from 'next/server';
import { clearAllRateLimits, clearRateLimit } from '@/lib/rateLimit';
import { getClientIP } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, message: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    if (body.action === 'clear-all') {
      clearAllRateLimits();
      return NextResponse.json({
        success: true,
        message: 'All rate limits cleared'
      });
    }
    
    if (body.action === 'clear-ip') {
      const clientIP = getClientIP(request);
      clearRateLimit(`register:${clientIP}`);
      clearRateLimit(`login:${clientIP}`);
      return NextResponse.json({
        success: true,
        message: `Rate limits cleared for IP: ${clientIP}`
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid action. Use "clear-all" or "clear-ip"' },
      { status: 400 }
    );
    
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error clearing rate limits' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, message: 'Not available in production' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Rate limit clear API is available',
    usage: {
      'POST /api/dev/clear-rate-limits': {
        'clear-all': 'Clears all rate limits',
        'clear-ip': 'Clears rate limits for current IP'
      }
    }
  });
}
