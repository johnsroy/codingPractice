/**
 * Structured HTTP errors for Mentora API.
 * All errors inherit HttpError, which carries a status code + friendly message.
 * The centralized error handler in src/index.ts serialises these into the
 * ApiError shape from @mentora/shared.
 */

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
    // Restore prototype chain for instanceof checks across transpiler boundaries
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/** 400 — the request body or params are invalid. */
export function badRequest(message = 'The request is invalid.', details?: unknown): HttpError {
  return new HttpError(400, message, details);
}

/** 401 — not authenticated. */
export function unauthorized(message = 'Please sign in to continue.'): HttpError {
  return new HttpError(401, message);
}

/** 403 — authenticated but not allowed. */
export function forbidden(message = 'You do not have permission to do that.'): HttpError {
  return new HttpError(403, message);
}

/** 404 — resource does not exist. */
export function notFound(resource = 'Resource'): HttpError {
  return new HttpError(404, `${resource} not found.`);
}

/** 409 — conflict (e.g. duplicate enrollment). */
export function conflict(message = 'This action conflicts with existing data.'): HttpError {
  return new HttpError(409, message);
}

/** 422 — unprocessable entity. */
export function unprocessable(message: string, details?: unknown): HttpError {
  return new HttpError(422, message, details);
}
