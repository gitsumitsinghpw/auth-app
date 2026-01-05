import jwt from 'jsonwebtoken';
import { IUser } from '@/models/User';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  authMethod: 'local' | 'ldap' | 'oauth';
  avatar?: string;
}

export interface SessionData {
  user?: SessionUser;
  isLoggedIn: boolean;
  loginAttempts: number;
  lastAttempt?: number;
}

// Default session data
export const defaultSession: SessionData = {
  isLoggedIn: false,
  loginAttempts: 0,
};

// JWT Token functions
export function generateAccessToken(user: IUser): string {
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    authMethod: user.authMethod,
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '1h',
    issuer: 'secure-auth-app',
    audience: 'secure-auth-users',
  });
}

export function generateRefreshToken(user: IUser): string {
  const payload = {
    id: user._id.toString(),
    tokenVersion: 1, // Can be used to invalidate tokens
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '7d',
    issuer: 'secure-auth-app',
    audience: 'secure-auth-users',
  });
}

export function verifyToken(token: string): jwt.JwtPayload | string {
  return jwt.verify(token, process.env.JWT_SECRET!, {
    issuer: 'secure-auth-app',
    audience: 'secure-auth-users',
  });
}

// Convert user document to session user
export function userToSessionUser(user: IUser): SessionUser {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    authMethod: user.authMethod,
    avatar: user.avatar,
  };
}

// Password validation
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[!@#$%^&*])/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Rate limiting helper
export function isRateLimited(attempts: number, lastAttempt?: number): boolean {
  const maxAttempts = parseInt(process.env.RATE_LIMIT_MAX || '5');
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW || '900000'); // 15 minutes
  
  if (attempts < maxAttempts) {
    return false;
  }
  
  if (!lastAttempt) {
    return false;
  }
  
  const timeSinceLastAttempt = Date.now() - lastAttempt;
  return timeSinceLastAttempt < windowMs;
}

// Generate CSRF token
export function generateCSRFToken(): string {
  return jwt.sign(
    { 
      purpose: 'csrf',
      timestamp: Date.now() 
    },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
}

// Verify CSRF token
export function verifyCSRFToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    return decoded.purpose === 'csrf';
  } catch {
    return false;
  }
}

// Get client IP address from request
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const headers = new Headers(request.headers);
  
  // Check common reverse proxy headers
  let ip = headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           headers.get('x-real-ip') ||
           headers.get('x-client-ip') ||
           headers.get('cf-connecting-ip') || // Cloudflare
           headers.get('true-client-ip') ||   // Cloudflare Enterprise
           'unknown';
           
  // Remove port number if present
  if (ip.includes(':') && !ip.includes('::')) {
    ip = ip.split(':')[0];
  }
  
  return ip === 'unknown' ? '127.0.0.1' : ip;
}
