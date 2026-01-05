import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/models/User';
import { validateInput, loginSchema, ldapLoginSchema } from '@/lib/validation';
import { checkLoginRateLimit, updateRateLimit, rateLimitConfigs } from '@/lib/rateLimit';
import { generateCSRFToken, userToSessionUser } from '@/lib/auth';
import { updateSession } from '@/lib/session';
import { authenticateLDAP } from '@/lib/ldap';

export async function POST(request: NextRequest) {
  const response = NextResponse.next();
  
  try {
    // Check rate limiting
    const rateLimitResult = checkLoginRateLimit(request);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many login attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const body = await request.json();
    const authMethod = body.authMethod || 'local';

    // Handle LDAP authentication
    if (authMethod === 'ldap') {
      const validation = validateInput(ldapLoginSchema, body);
      
      if (!validation.isValid) {
        updateRateLimit(request, false, rateLimitConfigs.login);
        return NextResponse.json(
          { 
            success: false, 
            message: 'Validation failed',
            errors: validation.errors 
          },
          { status: 400 }
        );
      }

      const { username, password } = validation.data!;

      // Authenticate via LDAP
      const ldapResult = await authenticateLDAP(username, password);
      
      if (!ldapResult.success) {
        updateRateLimit(request, false, rateLimitConfigs.login);
        return NextResponse.json(
          { 
            success: false, 
            message: ldapResult.error || 'LDAP authentication failed' 
          },
          { status: 401 }
        );
      }

      await dbConnect();

      // Check if user exists in our database or create them
      let user = await User.findOne({ email: ldapResult.user!.email });
      
      if (!user) {
        // Create new LDAP user in our database
        user = await User.create({
          name: ldapResult.user!.name,
          email: ldapResult.user!.email,
          role: ldapResult.user!.role,
          authMethod: 'ldap',
          provider: 'ldap',
          providerId: ldapResult.user!.uid,
          isActive: true,
          emailVerified: true,
          lastLogin: new Date()
        });
      } else {
        // Update existing user
        user.lastLogin = new Date();
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
      }

      // Update session
      const sessionUser = userToSessionUser(user);
      await updateSession(request, response, {
        user: sessionUser,
        isLoggedIn: true,
        loginAttempts: 0
      });

      updateRateLimit(request, true, rateLimitConfigs.login);

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: sessionUser,
        csrfToken: generateCSRFToken()
      });
    }

    // Handle local authentication
    const validation = validateInput(loginSchema, body);
    
    if (!validation.isValid) {
      updateRateLimit(request, false, rateLimitConfigs.login);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data!;

    await dbConnect();

    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      authMethod: 'local'
    });

    if (!user) {
      updateRateLimit(request, false, rateLimitConfigs.login);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.isLocked) {
      updateRateLimit(request, false, rateLimitConfigs.login);
      const lockTimeRemaining = Math.ceil((user.lockUntil!.getTime() - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { 
          success: false, 
          message: `Account is temporarily locked. Try again in ${lockTimeRemaining} minutes.` 
        },
        { status: 423 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      updateRateLimit(request, false, rateLimitConfigs.login);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Account is deactivated. Please contact support.' 
        },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      updateRateLimit(request, false, rateLimitConfigs.login);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Successful login
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();

    // Update session
    const sessionUser = userToSessionUser(user);
    await updateSession(request, response, {
      user: sessionUser,
      isLoggedIn: true,
      loginAttempts: 0
    });

    updateRateLimit(request, true, rateLimitConfigs.login);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: sessionUser,
      csrfToken: generateCSRFToken()
    });

  } catch (error) {
    console.error('Login error:', error);
    updateRateLimit(request, false, rateLimitConfigs.login);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during login. Please try again.' 
      },
      { status: 500 }
    );
  }
}
