import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/models/User';
import { checkAPIRateLimit } from '@/lib/rateLimit';

// Get specific user (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const user = await User.findById(params.id).select('-password').lean();
    
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
        provider: user.provider,
        providerId: user.providerId,
        avatar: user.avatar,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        loginAttempts: user.loginAttempts,
        isLocked: user.lockUntil && user.lockUntil > new Date(),
        lockUntil: user.lockUntil,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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
    
    await dbConnect();

    // Prevent admins from changing their own role
    if (params.id === session.user.id && body.role && body.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Cannot change your own admin role' },
        { status: 400 }
      );
    }

    const allowedUpdates = ['name', 'email', 'role', 'isActive', 'emailVerified'];
    const updates: Record<string, unknown> = {};
    
    Object.keys(body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'email') {
          updates[key] = body[key].toLowerCase();
        } else {
          updates[key] = body[key];
        }
      }
    });

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid updates provided' },
        { status: 400 }
      );
    }

    // Check if email is already taken
    if (updates.email) {
      const existingUser = await User.findOne({ 
        email: updates.email,
        _id: { $ne: params.id }
      });

      if (existingUser) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Email is already taken by another user' 
          },
          { status: 409 }
        );
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      params.id,
      { ...updates, updatedAt: new Date() },
      { new: true, select: '-password' }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        authMethod: updatedUser.authMethod,
        provider: updatedUser.provider,
        isActive: updatedUser.isActive,
        emailVerified: updatedUser.emailVerified,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // Prevent admins from deleting themselves
    if (params.id === session.user.id) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await dbConnect();

    const deletedUser = await User.findByIdAndDelete(params.id);
    
    if (!deletedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
