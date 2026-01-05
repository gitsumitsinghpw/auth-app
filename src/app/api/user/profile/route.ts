import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/models/User';
import { validateInput, profileUpdateSchema } from '@/lib/validation';
import { checkAPIRateLimit } from '@/lib/rateLimit';

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
    
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        authMethod: user.authMethod,
        avatar: user.avatar,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = validateInput(profileUpdateSchema, body);
    
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

    const { name, email } = validation.data!;

    await dbConnect();

    // Check if email is already taken by another user
    if (email.toLowerCase() !== session.user.email.toLowerCase()) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(),
        _id: { $ne: session.user.id }
      });

      if (existingUser) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Email is already taken by another account' 
          },
          { status: 409 }
        );
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        name: name.trim(),
        email: email.toLowerCase(),
        updatedAt: new Date()
      },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        authMethod: updatedUser.authMethod,
        avatar: updatedUser.avatar,
        emailVerified: updatedUser.emailVerified,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
