/**
 * Zod request body validation middleware.
 * Returns a friendly 400 with structured field errors when validation fails.
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { badRequest } from '../lib/errors';

export function validate(schema: ZodSchema): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = (result.error as ZodError).errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return next(
        badRequest(
          'Please check the highlighted fields and try again.',
          details,
        ),
      );
    }
    // Replace req.body with the parsed+coerced value
    req.body = result.data;
    next();
  };
}
