import { getIronSession, SessionOptions } from 'iron-session';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SessionData, defaultSession } from './auth';

// Session configuration
export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieName: 'secure-auth-session',
  ttl: 60 * 60 * 24 * 7, // 7 days
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  },
};

// Get session for Server Components
export async function getSession(): Promise<SessionData> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    
    if (!session.isLoggedIn) {
      return defaultSession;
    }
    
    return session;
  } catch (error) {
    console.error('Session error:', error);
    return defaultSession;
  }
}

// Get session for middleware (works with requests)
export async function getSessionFromRequest(req: NextRequest): Promise<SessionData> {
  try {
    // Create a dummy response for session reading
    const dummyResponse = new NextResponse();
    const session = await getIronSession<SessionData>(req, dummyResponse, sessionOptions);
    
    if (!session.isLoggedIn) {
      return defaultSession;
    }
    
    return session;
  } catch (error) {
    console.error('Middleware session error:', error);
    return defaultSession;
  }
}

// Update session for API routes
export async function updateSession(req: NextRequest, res: NextResponse, data: Partial<SessionData>): Promise<void> {
  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    
    Object.assign(session, data);
    await session.save();
  } catch (error) {
    console.error('Session update error:', error);
    throw new Error('Failed to update session');
  }
}

// Clear session for API routes
export async function clearSession(req: NextRequest, res: NextResponse): Promise<void> {
  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    session.destroy();
  } catch (error) {
    console.error('Session clear error:', error);
    throw new Error('Failed to clear session');
  }
}
