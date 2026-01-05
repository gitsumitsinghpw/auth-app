import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const adminHash = await bcrypt.hash('AdminPass123!', 12);
  const userHash = await bcrypt.hash('UserPass123!', 12);
  
  return NextResponse.json({
    adminPassword: 'AdminPass123!',
    adminHash,
    userPassword: 'UserPass123!', 
    userHash,
    note: 'Use these hashes to update fallback storage'
  });
}
