# Google and GitHub OAuth Setup Guide

## 🎉 Current Setup Status

✅ **NextAuth Configuration**: Already configured in `/src/lib/nextauth.ts`
✅ **OAuth Providers**: Google and GitHub providers are set up
✅ **API Route**: NextAuth API route exists at `/src/app/api/auth/[...nextauth]/route.ts`
✅ **Database Integration**: OAuth users are saved to MongoDB
✅ **Session Provider**: AuthProvider wrapper created and added to layout
✅ **Error Handling**: Custom error pages for OAuth failures
✅ **User Interface**: OAuth buttons are already in the login page
✅ **Role-based Redirects**: Admin users go to `/admin`, regular users to `/dashboard`

## 🔧 Setup Steps Required

### 1. Environment Variables
Create a `.env.local` file with your OAuth credentials:

```bash
# Copy from .env.example and fill in your values
cp .env.example .env.local
```

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to your `.env.local`:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

### 3. GitHub OAuth Setup
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - Application name: "Your App Name"
   - Homepage URL: `http://localhost:3000` (development)
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Client Secret to your `.env.local`:
   ```
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

### 4. NextAuth Secret
Generate a secure random string for NEXTAUTH_SECRET:
```bash
# Use this command or any secure random generator
openssl rand -base64 32
```

Add to `.env.local`:
```
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
```

## 🚀 How OAuth Works in Your App

### User Flow
1. User clicks "Continue with Google" or "Continue with GitHub" on login page
2. User is redirected to OAuth provider for authentication
3. After successful authentication, user is redirected back to your app
4. NextAuth creates/updates user in MongoDB database
5. User is redirected to dashboard (regular users) or admin panel (admin users)

### Database Integration
- OAuth users are automatically saved to MongoDB with:
  - `authMethod: 'oauth'`
  - `provider: 'google' | 'github'`
  - `providerId: account.providerAccountId`
  - User profile information (name, email, avatar)

### Security Features
- ✅ Secure JWT tokens
- ✅ CSRF protection
- ✅ Account linking prevention
- ✅ Rate limiting (inherited from your existing setup)
- ✅ Role-based access control

## 🎯 Features Already Implemented

### Login Page (`/src/app/login/page.tsx`)
- OAuth buttons with proper styling
- Error handling for failed OAuth attempts
- Redirect handling based on user role

### NextAuth Configuration (`/src/lib/nextauth.ts`)
- Google and GitHub providers configured
- Database callbacks for user creation/updates
- JWT and session management
- Custom redirect logic

### Error Handling (`/src/app/auth/error/page.tsx`)
- User-friendly error messages
- Proper error codes and descriptions
- Retry and alternative authentication options

## 🧪 Testing OAuth

### Test Users
Once configured, you can test with:
- Any valid Google account
- Any valid GitHub account

First-time OAuth users will be:
- Automatically registered in your database
- Assigned 'user' role by default
- Redirected to `/dashboard`

### Admin Access
To make an OAuth user an admin:
1. Let them sign in once via OAuth
2. Update their role in MongoDB: `{ role: 'admin' }`
3. They'll be redirected to `/admin` on next login

## 📝 Environment Variables Summary

```bash
# Required for OAuth
NEXTAUTH_SECRET=your-32-character-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Already configured
MONGODB_URI=mongodb://localhost:27017/auth-app
IRON_PASSWORD=your-iron-session-password
```

## ✨ Ready to Use!

Once you set up the OAuth credentials in your environment variables, your Google and GitHub authentication will work immediately. The system is fully integrated with your existing:

- User management system
- Role-based access control
- Admin dashboard
- Rate limiting
- Session management

No additional code changes needed - just add your OAuth app credentials! 🎉
