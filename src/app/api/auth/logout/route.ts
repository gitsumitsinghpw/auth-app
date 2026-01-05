import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Clear the session
    await clearSession(request, response);

    // Add security headers
    response.headers.set('Clear-Site-Data', '"cache", "cookies", "storage"');
    
    return response;
    
  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during logout' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Allow GET method for logout links
  return POST(request);
}
