import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    // Create redirect response to login page
    const response = NextResponse.redirect(new URL('/login', request.url));

    // Clear the session
    await clearSession(request, response);

    // Add security headers to clear browser data
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    
    // On error, still redirect to login but log the error
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export async function GET(request: NextRequest) {
  // Allow GET method for logout links - redirect to login page
  return POST(request);
}
