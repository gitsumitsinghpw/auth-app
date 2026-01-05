import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { SessionData } from '@/lib/auth';
import { loginSchema, ldapLoginSchema } from '@/lib/validation';
import { authenticateLDAP } from '@/lib/ldap';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Determine auth method and validate accordingly
    const authMethod = body.authMethod || 'local';
    let validationResult;
    let credentials: { email?: string; username?: string; password: string };

    if (authMethod === 'ldap') {
      // Validate LDAP credentials
      validationResult = ldapLoginSchema.validate(body);
      if (validationResult.error) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Validation error',
            errors: validationResult.error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message
            }))
          },
          { status: 400 }
        );
      }
      credentials = { username: validationResult.value.username, password: validationResult.value.password };
    } else {
      // Validate local credentials
      validationResult = loginSchema.validate(body);
      if (validationResult.error) {
        return NextResponse.json(
          { 
            success: false,
            message: 'Validation error',
            errors: validationResult.error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message
            }))
          },
          { status: 400 }
        );
      }
      credentials = { email: validationResult.value.email, password: validationResult.value.password };
    }

    let user = null;

    if (authMethod === 'ldap') {
      // LDAP Authentication
      try {
        const ldapUser = await authenticateLDAP(credentials.username!, credentials.password);
        if (ldapUser && ldapUser.success) {
          user = {
            id: ldapUser.user?.uid || crypto.randomUUID(),
            email: ldapUser.user?.email || credentials.username,
            name: ldapUser.user?.name || 'LDAP User',
            role: (ldapUser.user?.role || 'user') as 'user' | 'admin',
            isActive: true,
            isVerified: true,
            authMethod: 'ldap' as const
          };
        }
      } catch (ldapError) {
        console.error('LDAP authentication error:', ldapError);
      }
    }

    // Local authentication - MongoDB only
    if (!user) {
      try {
        await dbConnect();
        const mongoUser = await User.findOne({ 
          email: credentials.email?.toLowerCase(), 
          isActive: true,
          authMethod: 'local' 
        });
        
        if (mongoUser && await mongoUser.comparePassword(credentials.password)) {
          user = {
            id: mongoUser._id.toString(),
            email: mongoUser.email,
            name: mongoUser.name,
            role: mongoUser.role as 'user' | 'admin',
            isActive: mongoUser.isActive,
            isVerified: mongoUser.emailVerified,
            authMethod: 'local' as const
          };
          
          // Update last login
          mongoUser.lastLogin = new Date();
          mongoUser.resetLoginAttempts();
          await mongoUser.save();
        } else if (mongoUser) {
          // User found but password incorrect - increment login attempts
          mongoUser.incLoginAttempts();
          await mongoUser.save();
        }
      } catch (mongoError) {
        console.error('MongoDB authentication error:', mongoError);
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { success: false, message: 'Please verify your email before logging in' },
        { status: 403 }
      );
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    // Update session
    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    session.isLoggedIn = true;
    session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as 'user' | 'admin',
      authMethod: user.authMethod as 'local' | 'ldap' | 'oauth'
    };
    await session.save();

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
