<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Project: Secure User Authentication Application

This is a production-ready authentication system built with Next.js, TypeScript, MongoDB, and featuring both LDAP and OAuth authentication.

## Technology Stack:
- **Frontend & Backend**: Next.js 16 with App Router
- **Database**: MongoDB with Mongoose
- **Authentication**: Custom LDAP + OAuth (Google/GitHub) + NextAuth
- **Security**: Comprehensive security implementation
- **UI**: Tailwind CSS for modern, responsive design

## Security Features Implemented:
1. Password hashing with bcrypt
2. Rate limiting on login attempts  
3. Input validation using Joi
4. CSRF protection
5. HTTPS awareness
6. Secure cookie flags
7. Environment-based secrets
8. Session invalidation on logout

## Authentication Methods:
- Local authentication with password hashing
- LDAP authentication (mock implementation)
- OAuth with Google and GitHub

## User Roles:
- **User**: Access to user-specific pages
- **Admin**: Access to admin-only pages and user management

## Project Structure:
- `/src/app` - Next.js App Router pages and API routes
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions, database config, auth helpers
- `/src/middleware.ts` - Route protection middleware
- `/src/types` - TypeScript type definitions

## Key Features:
- Role-based access control
- Protected routes and API endpoints
- Session management with iron-session
- Beautiful, modern UI with Tailwind CSS
- Comprehensive error handling
- Production-ready security measures
