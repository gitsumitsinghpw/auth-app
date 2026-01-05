import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/models/User';
import { validateInput, registrationSchema } from '@/lib/validation';
import { checkRegisterRateLimit, updateRateLimit, rateLimitConfigs } from '@/lib/rateLimit';
import { generateCSRFToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { fallbackStorage } from '@/lib/fallbackStorage';

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitResult = checkRegisterRateLimit(request);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many registration attempts. Please try again later.',
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

    // Validate input
    const validation = validateInput<{
      name: string;
      email: string;
      password: string;
      confirmPassword: string;
    }>(registrationSchema, body);
    
    if (!validation.isValid) {
      // Update rate limit for failed request
      updateRateLimit(request, false, rateLimitConfigs.register);
      
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data!;
    
    // Try to connect to MongoDB, fallback to in-memory if failed
    let useDatabase = false;
    try {
      await dbConnect();
      useDatabase = true;
      console.log('Using MongoDB for user storage');
    } catch (dbError) {
      console.warn('MongoDB not available, using fallback in-memory storage:', dbError);
      useDatabase = false;
    }

    if (useDatabase) {
      // MongoDB approach
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          email: email.toLowerCase() 
        });

        if (existingUser) {
          updateRateLimit(request, false, rateLimitConfigs.register);
          return NextResponse.json(
            { success: false, message: 'An account with this email already exists' },
            { status: 409 }
          );
        }

        // Create new user with hashed password
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
          role: 'user',
          authMethod: 'local',
          isActive: true,
          emailVerified: false
        });

        const csrfToken = generateCSRFToken();
        updateRateLimit(request, true, rateLimitConfigs.register);

        return NextResponse.json(
          { 
            success: true, 
            message: 'Account created successfully',
            user: {
              id: newUser._id.toString(),
              name: newUser.name,
              email: newUser.email,
              role: newUser.role
            },
            csrfToken
          },
          { status: 201 }
        );
      } catch (dbError) {
        console.error('MongoDB operation failed, falling back to in-memory storage:', dbError);
        useDatabase = false;
      }
    }
    
    if (!useDatabase) {
      // Fallback in-memory approach
      const existingUser = fallbackStorage.findByEmail(email, 'local');

      if (existingUser) {
        updateRateLimit(request, false, rateLimitConfigs.register);
        return NextResponse.json(
          { success: false, message: 'An account with this email already exists' },
          { status: 409 }
        );
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newUser = {
        id: userId,
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user',
        authMethod: 'local',
        isActive: true,
        emailVerified: false,
        createdAt: new Date().toISOString()
      };

      fallbackStorage.addUser(newUser);

      const csrfToken = generateCSRFToken();
      updateRateLimit(request, true, rateLimitConfigs.register);

      return NextResponse.json(
        { 
          success: true, 
          message: 'Account created successfully (using fallback storage)',
          user: {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
          },
          csrfToken,
          note: 'Data stored in memory - will be lost on server restart'
        },
        { status: 201 }
      );
    }

  } catch (error) {
    console.error('Registration error details:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    try {
      const rateLimitResult = checkRegisterRateLimit(request);
      if (rateLimitResult.allowed) {
        updateRateLimit(request, false, rateLimitConfigs.register);
      }
    } catch (rateLimitError) {
      console.error('Rate limit error:', rateLimitError);
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during registration. Please try again.',
        ...(process.env.NODE_ENV === 'development' && { 
          debug: error instanceof Error ? error.message : String(error) 
        })
      },
      { status: 500 }
    );
  }
}
