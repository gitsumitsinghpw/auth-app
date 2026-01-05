import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    
    return NextResponse.json({
      success: true,
      session: session,
      isLoggedIn: session.isLoggedIn,
      user: session.user || null
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error retrieving session',
        error: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
