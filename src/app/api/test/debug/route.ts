import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { fallbackStorage } from '@/lib/fallbackStorage';

export async function GET() {
  try {
    // Clear and reload with a fresh hash
    fallbackStorage.clear();
    
    // Generate a fresh hash every time
    const freshHash = await bcrypt.hash('AdminPass123!', 12);
    const userHash = await bcrypt.hash('UserPass123!', 12);
    
    fallbackStorage.addUser({
      id: 'admin_default',
      name: 'Admin User',
      email: 'admin@example.com',
      password: freshHash,
      role: 'admin',
      authMethod: 'local',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString()
    });

    fallbackStorage.addUser({
      id: 'user_default',
      name: 'Test User',
      email: 'user@example.com',
      password: userHash,
      role: 'user',
      authMethod: 'local',
      isActive: true,
      emailVerified: true,
      createdAt: new Date().toISOString()
    });
    
    const users = fallbackStorage.getAllUsers();
    const testUser = users.find(u => u.email === 'admin@example.com');
    
    if (testUser) {
      // Test the password
      const passwordTest = await bcrypt.compare('AdminPass123!', testUser.password);
      
      return NextResponse.json({
        message: 'Storage reloaded with fresh hashes',
        user: {
          email: testUser.email,
          isActive: testUser.isActive,
          emailVerified: testUser.emailVerified
        },
        passwordTest: passwordTest,
        success: passwordTest === true
      });
    } else {
      return NextResponse.json({
        error: 'User not found after reload'
      });
    }
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      message: (error as Error).message
    }, { status: 500 });
  }
}
