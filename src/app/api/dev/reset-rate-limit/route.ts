import { NextResponse } from 'next/server';

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    // Import the rate limit store and clear it
    const { clearAllRateLimits } = await import('@/lib/rateLimit');
    clearAllRateLimits();

    return NextResponse.json({
      message: 'Rate limit store cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to clear rate limit store' },
      { status: 500 }
    );
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: 'Rate limit reset endpoint',
    usage: 'POST to this endpoint to clear rate limits',
    environment: process.env.NODE_ENV
  });
}
