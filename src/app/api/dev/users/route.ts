import { NextResponse } from 'next/server';
import { fallbackStorage } from '@/lib/fallbackStorage';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const users = fallbackStorage.getAllUsers();
  
  return NextResponse.json({
    message: 'Fallback storage status',
    userCount: users.length,
    users: users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      authMethod: user.authMethod,
      createdAt: user.createdAt
    }))
  });
}
