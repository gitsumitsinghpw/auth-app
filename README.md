# Secure User Authentication Application

A comprehensive Next.js application with MongoDB, LDAP, and OAuth authentication featuring enterprise-grade security measures and role-based access control.

## 🚀 Features

### Authentication Methods
- **Local Authentication**: Email/password with secure bcrypt hashing
- **LDAP Integration**: Mock LDAP authentication for enterprise environments
- **OAuth Providers**: Google and GitHub sign-in via NextAuth.js

### Security Features ✅
1. **Password Hashing**: bcrypt with salt rounds for secure password storage
2. **Rate Limiting**: Protection against brute force attacks with configurable limits
3. **Input Validation**: Comprehensive validation using Joi schema validation
4. **CSRF Protection**: Cross-site request forgery protection with secure tokens
5. **HTTPS Awareness**: Secure cookie settings and HTTPS-only configurations
6. **Secure Cookies**: HttpOnly, Secure, and SameSite cookie configurations
7. **Environment Secrets**: All sensitive data stored in environment variables
8. **Session Invalidation**: Proper session cleanup and logout functionality

### User Management
- **Role-Based Access Control**: User and Admin roles with protected routes
- **Account Locking**: Automatic account lockout after failed login attempts
- **User Profile Management**: Edit profile information and change passwords
- **Admin Panel**: Comprehensive user management interface

### Pages & Routes
- **Public Pages**: Home page (accessible to all)
- **Protected User Pages**: Dashboard, Profile (requires login)
- **Admin-Only Pages**: Admin dashboard, User management (requires admin role)

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js, Custom JWT implementation
- **Session Management**: iron-session for secure server-side sessions
- **Security**: bcryptjs, joi validation, custom rate limiting
- **Development**: ESLint, TypeScript, Hot reloading

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/              # Admin-only pages
│   │   ├── page.tsx        # Admin dashboard
│   │   └── users/          # User management
│   ├── dashboard/          # User dashboard
│   ├── login/              # Login page
│   ├── profile/            # User profile
│   ├── register/           # Registration page
│   └── api/                # API routes
│       ├── auth/           # Authentication endpoints
│       ├── user/           # User profile endpoints
│       ├── admin/          # Admin management endpoints
│       └── health/         # System health check
├── lib/                    # Utility libraries
│   ├── auth.ts             # Authentication utilities
│   ├── mongodb.ts          # Database connection
│   ├── session.ts          # Session management
│   ├── validation.ts       # Input validation schemas
│   ├── rateLimit.ts        # Rate limiting implementation
│   ├── ldap.ts             # LDAP integration
│   └── nextauth.ts         # NextAuth configuration
├── models/                 # Database models
│   └── User.ts             # User schema with security features
├── middleware.ts           # Route protection middleware
└── types/                  # TypeScript type definitions
    └── auth.ts             # Authentication types
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Git

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/auth-app

# Authentication
NEXTAUTH_SECRET=your-nextauth-secret-key-here
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=your-jwt-secret-key-here

# Session Management
IRON_PASSWORD=your-iron-session-password-32-chars-min

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# LDAP Configuration (Optional)
LDAP_SERVER_URL=ldap://your-ldap-server:389
LDAP_BIND_DN=cn=admin,dc=company,dc=com
LDAP_BIND_PASSWORD=your-ldap-password
LDAP_SEARCH_BASE=ou=users,dc=company,dc=com
```

### Installation Steps

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   - Copy `.env.example` to `.env.local`
   - Update the values with your configuration

3. **Start MongoDB**:
   - Ensure MongoDB is running locally or update MONGODB_URI

4. **Run the application**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Open http://localhost:3000 in your browser

## 🔐 Security Implementation Details

### Password Security
- **bcrypt hashing** with configurable salt rounds
- **Password strength validation** (minimum 8 characters)
- **Secure password comparison** using bcrypt.compare()

### Session Security
- **iron-session** for encrypted session cookies
- **HttpOnly cookies** to prevent XSS attacks  
- **Secure flag** for HTTPS-only cookies
- **SameSite=lax** for CSRF protection

### Rate Limiting
- **Login attempts**: 5 attempts per 15 minutes per IP
- **Registration**: 3 attempts per 15 minutes per IP
- **Account lockout**: After 5 failed attempts for 30 minutes

### Input Validation
- **Server-side validation** using Joi schemas
- **Type-safe** inputs with TypeScript
- **Sanitization** of user inputs

### Route Protection
- **Middleware-based** route protection
- **Role-based access control** (RBAC)
- **Session validation** on protected routes

## 🚦 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Admin Management
- `GET /api/admin/users` - List all users (admin only)
- `PATCH /api/admin/users/:id` - Update user (admin only)

### System
- `GET /api/health` - System health check

## 👥 User Roles & Permissions

### User Role
- Access to dashboard
- View and edit own profile
- Standard authentication features

### Admin Role  
- All user permissions
- Access to admin panel
- User management capabilities
- System health monitoring
- Role assignment

## 🧪 Testing the Application

### Test User Accounts
Create test accounts through:
1. **Registration form** at `/register`
2. **OAuth providers** (Google/GitHub)  
3. **Admin user creation** (via admin panel)

### Test Scenarios
1. **Authentication Flow**:
   - Register new account
   - Login with credentials
   - Test OAuth login

2. **Security Features**:
   - Try multiple failed logins (account lockout)
   - Test password strength validation
   - Verify session persistence

3. **Role-Based Access**:
   - Access admin pages as user (should redirect)
   - Access user dashboard as admin
   - Test route protection

## 🔍 Monitoring & Health

### Health Check Endpoint
- **URL**: `/api/health`  
- **Returns**: System status, database connectivity, authentication services status

### Security Monitoring
- Failed login attempt tracking
- Account lockout notifications
- Session management monitoring

## 🚀 Deployment

### Production Checklist
- [ ] Set production environment variables
- [ ] Configure HTTPS certificates
- [ ] Set up production MongoDB
- [ ] Configure OAuth app credentials
- [ ] Set up LDAP connection (if needed)
- [ ] Enable rate limiting
- [ ] Configure session security settings

### Environment-Specific Settings
- **Development**: Relaxed HTTPS requirements
- **Production**: Strict security headers, HTTPS-only cookies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Check the documentation above
- Review the code comments
- Test the application locally
- Verify environment configuration

---

**Note**: This is a demonstration application implementing enterprise-grade authentication patterns. For production use, ensure all security configurations match your requirements and compliance standards.
