import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    await dbConnect();

    // Create a test admin user in MongoDB
    const adminExists = await User.findOne({ email: 'admin@mongodb.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('MongoAdmin123!', 12);
      
      const adminUser = new User({
        email: 'admin@mongodb.com',
        password: hashedPassword,
        name: 'MongoDB Admin',
        role: 'admin',
        authMethod: 'local',
        emailVerified: true,
        isActive: true,
        loginAttempts: 0
      });

      await adminUser.save();
    }

    // Create a test regular user in MongoDB
    const userExists = await User.findOne({ email: 'user@mongodb.com' });
    if (!userExists) {
      const hashedPassword = await bcrypt.hash('MongoUser123!', 12);
      
      const regularUser = new User({
        email: 'user@mongodb.com',
        password: hashedPassword,
        name: 'MongoDB User',
        role: 'user',
        authMethod: 'local',
        emailVerified: true,
        isActive: true,
        loginAttempts: 0
      });

      await regularUser.save();
    }

    // Get all MongoDB users
    const allUsers = await User.find({}, { password: 0 }).lean();

    return NextResponse.json({
      message: 'MongoDB test users created/verified',
      users: allUsers.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        authMethod: user.authMethod,
        emailVerified: user.emailVerified,
        isActive: user.isActive
      })),
      testCredentials: [
        {
          email: 'admin@mongodb.com',
          password: 'MongoAdmin123!',
          role: 'admin',
          source: 'MongoDB'
        },
        {
          email: 'user@mongodb.com',
          password: 'MongoUser123!',
          role: 'user',
          source: 'MongoDB'
        }
      ]
    });

  } catch (error) {
    console.error('MongoDB user creation error:', error);
    return NextResponse.json({
      error: 'Failed to create MongoDB users',
      message: (error as Error).message
    }, { status: 500 });
  }
}

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production' },
      { status: 403 }
    );
  }

  try {
    await dbConnect();
    const allUsers = await User.find({}, { password: 0 }).lean();

    return NextResponse.json({
      mongoUsers: allUsers.map(user => ({
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        authMethod: user.authMethod,
        emailVerified: user.emailVerified,
        isActive: user.isActive
      })),
      testCredentials: [
        {
          email: 'admin@mongodb.com',
          password: 'MongoAdmin123!',
          role: 'admin',
          source: 'MongoDB'
        },
        {
          email: 'user@mongodb.com',
          password: 'MongoUser123!',
          role: 'user',
          source: 'MongoDB'
        }
      ]
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to fetch MongoDB users',
      message: (error as Error).message
    }, { status: 500 });
  }
}
