import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { dbConnect } from '@/lib/mongodb';
import { User } from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) return false;
      
      try {
        await dbConnect();
        
        // Check if user exists
        let existingUser = await User.findOne({ 
          $or: [
            { email: user.email },
            { providerId: account.providerAccountId, provider: account.provider }
          ]
        });

        if (existingUser) {
          // Update existing user
          existingUser.lastLogin = new Date();
          existingUser.avatar = user.image || existingUser.avatar;
          existingUser.name = user.name || existingUser.name;
          
          // Reset login attempts on successful OAuth login
          existingUser.loginAttempts = 0;
          existingUser.lockUntil = undefined;
          
          await existingUser.save();
        } else {
          // Create new user
          existingUser = await User.create({
            email: user.email,
            name: user.name,
            role: 'user', // Default role for OAuth users
            authMethod: 'oauth',
            provider: account.provider,
            providerId: account.providerAccountId,
            avatar: user.image,
            emailVerified: Boolean((profile as Record<string, unknown>).email_verified) || false,
            isActive: true,
            lastLogin: new Date(),
          });
        }

        // Add user ID to the user object for session
        (user as Record<string, unknown>).id = existingUser._id.toString();
        (user as Record<string, unknown>).role = existingUser.role;
        
        return true;
      } catch (error) {
        console.error('OAuth sign in error:', error);
        return false;
      }
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as Record<string, unknown>).role as 'user' | 'admin';
        token.authMethod = 'oauth';
      }
      
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.authMethod = token.authMethod;
      }
      
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },

  pages: {
    signIn: '/login',
    error: '/auth/error',
  },

  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
