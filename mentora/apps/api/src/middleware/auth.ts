/**
 * Authentication middleware.
 *
 * `authenticate` — verifies a Bearer JWT from the Authorization header,
 *   attaches the decoded payload to req.user.
 *
 * `requireRole` — gates a route to one or more roles.
 */

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { unauthorized, forbidden } from '../lib/errors';
import type { Role } from '@mentora/shared';

export interface JwtPayload {
  sub: string; // user id
  role: Role;
  email: string;
  iat?: number;
  exp?: number;
}

// Augment Express Request so TypeScript knows about req.user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Verifies the JWT Bearer token in the Authorization header.
 * Sets req.user on success; calls next(unauthorized()) on failure.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(unauthorized('No access token provided. Please sign in.'));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = payload;
    next();
  } catch {
    next(unauthorized('Your session has expired. Please sign in again.'));
  }
}

/**
 * Gate a route to specific roles. Must be called AFTER `authenticate`.
 * Usage: router.get('/admin-stuff', authenticate, requireRole('ADMIN'), handler)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(forbidden(`Only ${roles.join(' or ')} accounts can access this.`));
    }
    next();
  };
}
