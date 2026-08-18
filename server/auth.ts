import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import type { AdminUser } from '../src/types.js';

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'aura_jewelry_super_secret_jwt_key_2026';
const SESSION_COOKIE_NAME = 'aura_admin_session';

// In-memory rate limiting map for login attempts
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function generateSessionToken(user: AdminUser): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

export function verifySessionToken(token: string): AdminUser | null {
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(payloadStr)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    if (payload.expiresAt < Date.now()) return null;

    return {
      id: payload.userId,
      email: payload.email,
      name: 'Atelier Director',
      role: payload.role || 'ADMIN'
    };
  } catch (err) {
    return null;
  }
}

export function checkLoginRateLimit(ip: string): { allowed: boolean; remainingSec?: number } {
  const record = loginAttempts.get(ip);
  const now = Date.now();

  if (record && record.lockedUntil > now) {
    return {
      allowed: false,
      remainingSec: Math.ceil((record.lockedUntil - now) / 1000)
    };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, lockedUntil: 0 };
  record.count += 1;

  if (record.count >= 5) {
    // Lock for 15 minutes after 5 failures
    record.lockedUntil = now + 15 * 60 * 1000;
  }
  loginAttempts.set(ip, record);
}

export function resetLoginAttempts(ip: string) {
  loginAttempts.delete(ip);
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminUser;
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  // Check cookie or Authorization header
  let token = req.cookies?.[SESSION_COOKIE_NAME];

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in to access admin capabilities.'
    });
  }

  const user = verifySessionToken(token);
  if (!user) {
    return res.status(401).json({
      error: 'Invalid or expired session. Please sign in again.'
    });
  }

  req.admin = user;
  next();
}

export { SESSION_COOKIE_NAME };
