import { NextRequest } from 'next/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstAttempt: number;
}

// In-memory rate limit store (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalAttempts: number;
}

// Default configurations for different endpoints
export const rateLimitConfigs = {
  login: {
    maxAttempts: process.env.NODE_ENV === 'development' ? 1000 : 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipSuccessfulRequests: true
  },
  register: {
    maxAttempts: process.env.NODE_ENV === 'development' ? 1000 : 10,
    windowMs: 15 * 60 * 1000, // 15 minutes (more lenient for development)
    skipSuccessfulRequests: true
  },
  passwordReset: {
    maxAttempts: process.env.NODE_ENV === 'development' ? 1000 : 5,
    windowMs: 30 * 60 * 1000, // 30 minutes
    skipSuccessfulRequests: true
  },
  api: {
    maxAttempts: process.env.NODE_ENV === 'development' ? 10000 : 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipSuccessfulRequests: false
  },
  default: {
    maxAttempts: process.env.NODE_ENV === 'development' ? 10000 : 20,
    windowMs: 15 * 60 * 1000, // 15 minutes
    skipSuccessfulRequests: false
  }
} as const;

// Generate rate limit key
function generateKey(request: NextRequest, identifier?: string): string {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const userAgentHash = simpleHash(userAgent);
  
  if (identifier) {
    return `${identifier}:${ip}:${userAgentHash}`;
  }
  
  return `${ip}:${userAgentHash}`;
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback to localhost for development
  return '127.0.0.1';
}

// Simple hash function for user agent
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).slice(0, 8);
}

// Check rate limit
export function checkRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): RateLimitResult {
  // In development mode, be more lenient with rate limiting
  if (process.env.NODE_ENV === 'development') {
    config = {
      ...config,
      maxAttempts: Math.max(config.maxAttempts * 2, 20), // Double the limit or min 20
      windowMs: config.windowMs / 2 // Halve the window time
    };
  }

  const key = generateKey(request, identifier);
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) { // 1% chance
    cleanupExpiredEntries();
  }
  
  if (!entry) {
    // First request from this key
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      firstAttempt: now
    });
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
      totalAttempts: 1
    };
  }
  
  if (now > entry.resetTime) {
    // Window has expired, reset counter
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
      firstAttempt: now
    });
    
    return {
      allowed: true,
      remaining: config.maxAttempts - 1,
      resetTime: now + config.windowMs,
      totalAttempts: 1
    };
  }
  
  // Within the window
  entry.count++;
  const allowed = entry.count <= config.maxAttempts;
  const remaining = Math.max(0, config.maxAttempts - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    totalAttempts: entry.count
  };
}

// Update rate limit (for skipping successful requests)
export function updateRateLimit(
  request: NextRequest,
  success: boolean,
  config: RateLimitConfig,
  identifier?: string
): void {
  if ((success && config.skipSuccessfulRequests) || 
      (!success && config.skipFailedRequests)) {
    const key = generateKey(request, identifier);
    const entry = rateLimitStore.get(key);
    
    if (entry && entry.count > 0) {
      entry.count--;
    }
  }
}

// Reset rate limit for a specific key
export function resetRateLimit(request: NextRequest, identifier?: string): void {
  const key = generateKey(request, identifier);
  rateLimitStore.delete(key);
}

// Clean up expired entries
function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Get rate limit info without incrementing
export function getRateLimitInfo(
  request: NextRequest,
  config: RateLimitConfig,
  identifier?: string
): RateLimitResult {
  const key = generateKey(request, identifier);
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    return {
      allowed: true,
      remaining: config.maxAttempts,
      resetTime: now + config.windowMs,
      totalAttempts: 0
    };
  }
  
  const allowed = entry.count < config.maxAttempts;
  const remaining = Math.max(0, config.maxAttempts - entry.count);
  
  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    totalAttempts: entry.count
  };
}

// Rate limit middleware for specific endpoints
export function createRateLimitChecker(configName: keyof typeof rateLimitConfigs) {
  return (request: NextRequest, identifier?: string) => {
    const config = rateLimitConfigs[configName];
    return checkRateLimit(request, config, identifier);
  };
}

// Login rate limiter
export const checkLoginRateLimit = createRateLimitChecker('login');

// Registration rate limiter  
export const checkRegisterRateLimit = createRateLimitChecker('register');

// Password reset rate limiter
export const checkPasswordResetRateLimit = createRateLimitChecker('passwordReset');

// API rate limiter
export const checkAPIRateLimit = createRateLimitChecker('api');

// Default rate limiter
export const checkDefaultRateLimit = createRateLimitChecker('default');

// Get rate limit headers for responses
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': rateLimitConfigs.default.maxAttempts.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
    'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
  };
}

// Development helper to clear rate limits
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

// Development helper to clear all rate limits
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}
