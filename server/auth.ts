import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// Secure Session Secrets (configurable via environment)
export function getSessionSecret(): string {
  const secret = (process.env.ADMIN_SECRET_KEY || process.env.SESSION_SECRET || '').trim();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SERVER CONFIGURATION ERROR: ADMIN_SECRET_KEY or SESSION_SECRET must be configured in environment variables.');
    }
    return 'fincred-development-session-secret-key-32-chars-min';
  }
  return secret;
}

export interface TokenPayload {
  sub: 'admin' | 'customer';
  userId?: string;
  customerId?: string;
  mobileNumber?: string;
  username?: string;
  role: 'admin' | 'customer';
  iat: number;
  exp: number;
}

/**
 * Sign a payload into a secure HMAC-SHA256 token
 */
export function signToken(payload: Omit<TokenPayload, 'iat' | 'exp'>, expiresInSeconds = 24 * 60 * 60): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: TokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  };

  const secret = getSessionSecret();
  const payloadB64 = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode an HMAC-SHA256 token
 */
export function verifyToken(token: string): TokenPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  try {
    const secret = getSessionSecret();
    const [payloadB64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payloadB64)
      .digest('base64url');

    // Timing safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSig);
    if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    const payload: TokenPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }
    return payload;
  } catch {
    return null;
  }
}

/**
 * Sign an admin session token (valid for 24 hours)
 */
export function signAdminToken(username: string): string {
  return signToken({ sub: 'admin', username, role: 'admin' }, 24 * 60 * 60);
}

/**
 * Sign a customer session token (valid for 30 days)
 */
export function signCustomerToken(customerId: string, mobileNumber: string): string {
  return signToken({ sub: 'customer', customerId, mobileNumber, role: 'customer' }, 30 * 24 * 60 * 60);
}

/**
 * Timing-safe string comparison
 */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Generate cryptographically secure 6-digit numeric OTP
 */
export function generateSecureOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * In-memory sliding-window rate limiter
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale rate limits
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000).unref?.();

export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
  code?: string;
  keyGenerator?: (req: Request) => string;
}) {
  const {
    windowMs,
    max,
    message = 'Too many requests. Please try again later.',
    code = 'RATE_LIMIT_EXCEEDED',
    keyGenerator = (req: Request) => {
      const forwarded = req.headers['x-forwarded-for'];
      const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0] : req.socket.remoteAddress) || '127.0.0.1';
      return `${req.path}:${ip}`;
    }
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || record.resetAt <= now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).setHeader('Content-Type', 'application/json').json({
        success: false,
        error: {
          code,
          message,
          retryAfterSeconds
        }
      });
    }

    record.count += 1;
    next();
  };
}
