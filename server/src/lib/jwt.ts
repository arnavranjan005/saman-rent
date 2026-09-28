import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env';

export interface AccessPayload {
  sub: string;
  role: Role;
}

const EXPIRES_IN = '30d';

function secret(): string {
  if (!env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  return env.JWT_SECRET;
}

export function signAccessToken(userId: string, role: Role): string {
  return jwt.sign({ sub: userId, role }, secret(), { expiresIn: EXPIRES_IN });
}

export function verifyAccessToken(token: string): AccessPayload {
  const decoded = jwt.verify(token, secret());
  if (typeof decoded === 'string' || !decoded.sub) {
    throw new Error('Invalid token payload');
  }
  return { sub: String(decoded.sub), role: decoded.role as Role };
}
