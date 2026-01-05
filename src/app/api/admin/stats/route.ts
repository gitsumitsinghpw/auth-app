import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/models/User';
import { checkAPIRateLimit } from '@/lib/rateLimit';

// Get admin dashboard statistics
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

    // Get various statistics from MongoDB
    const [
      totalUsers,
      activeUsers,
      adminUsers,
      lockedUsers,
      verifiedUsers,
      recentUsers,
      usersByAuthMethod
    ] = await Promise.all([
      // Total users count
      User.countDocuments({}),
      
      // Active users (isActive: true)
      User.countDocuments({ isActive: true }),
      
      // Admin users
      User.countDocuments({ role: 'admin' }),
      
      // Locked users (lockUntil exists and is in the future)
      User.countDocuments({ 
        lockUntil: { $exists: true, $gt: new Date() }
      }),
      
      // Verified users
      User.countDocuments({ emailVerified: true }),
      
      // Users created in last 30 days
      User.countDocuments({ 
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Users by authentication method
      User.aggregate([
        {
          $group: {
            _id: '$authMethod',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    // Format auth method statistics
    const authMethodStats = usersByAuthMethod.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Note: LDAP users are not stored in MongoDB, so they won't appear in these stats
    // This is expected behavior since LDAP users exist only in sessions
    
    return NextResponse.json({
      success: true,
      statistics: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        adminUsers,
        regularUsers: totalUsers - adminUsers,
        lockedUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        recentUsers, // Users created in last 30 days
        authMethods: {
          local: authMethodStats.local || 0,
          oauth: authMethodStats.oauth || 0,
          // LDAP users are session-only and not counted in MongoDB stats
          ldapNote: 'LDAP users are not stored in database and not included in these counts'
        }
      },
      note: 'Statistics are based on users stored in MongoDB database only. LDAP users exist only in sessions and are not included.'
    });

  } catch (error) {
    console.error('Admin statistics error:', error);
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
