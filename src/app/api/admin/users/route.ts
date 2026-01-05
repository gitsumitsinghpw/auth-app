import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/models/User';
import { validateInput, adminUserCreationSchema } from '@/lib/validation';
import { checkAPIRateLimit } from '@/lib/rateLimit';

// Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitResult = checkAPIRateLimit(request);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests. Please try again later.' 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const session = await getSession();
    
    if (!session.isLoggedIn || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Build query
    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && ['user', 'admin'].includes(role)) {
      query.role = role;
    }

    // Get users with pagination
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      users: users.map(user => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        authMethod: user.authMethod,
        provider: user.provider,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        loginAttempts: user.loginAttempts,
        isLocked: user.lockUntil && user.lockUntil > new Date(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitResult = checkAPIRateLimit(request);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Too many requests. Please try again later.' 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const session = await getSession();
    
    if (!session.isLoggedIn || session.user?.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = validateInput(adminUserCreationSchema, body);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    const { name, email, role, authMethod, password } = validation.data!;

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User with this email already exists' 
        },
        { status: 409 }
      );
    }

    // Create user data
    const userData: Record<string, unknown> = {
      name: name.trim(),
      email: email.toLowerCase(),
      role,
      authMethod,
      isActive: true,
      emailVerified: authMethod !== 'local' // Auto-verify for non-local auth
    };

    // Add password for local authentication
    if (authMethod === 'local' && password) {
      userData.password = password;
    }

    // Create new user
    const newUser = await User.create(userData);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        authMethod: newUser.authMethod,
        isActive: newUser.isActive,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Create user error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
