import { NextResponse } from 'next/server';

// This is a development endpoint to show available LDAP test users
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const testUsers = [
    {
      username: 'john.doe',
      password: 'password123',
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'user'
    },
    {
      username: 'admin',
      password: 'admin123',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin'
    },
    {
      username: 'jane.smith',
      password: 'password456',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      role: 'user'
    }
  ];

  return NextResponse.json({
    message: 'Available LDAP test users',
    ldapUsers: testUsers.map(user => ({
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      note: 'Use these credentials to test LDAP authentication'
    })),
    usage: 'Use username and password with authMethod: "ldap" in the login form'
  });
}
