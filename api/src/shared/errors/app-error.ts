export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string,
    public readonly details: unknown = null,
    public readonly isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(msg = 'Validation failed', details: unknown = null) {
    super(msg, 400, 'VALIDATION_ERROR', details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(msg = 'Unauthorized') {
    super(msg, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(msg = 'Forbidden') {
    super(msg, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(msg = 'Resource conflict', details: unknown = null) {
    super(msg, 409, 'CONFLICT', details);
  }
}

export class TooManyRequestsError extends AppError {
  constructor(msg = 'Too many requests') {
    super(msg, 429, 'RATE_LIMITED');
  }
}

export class InternalError extends AppError {
  constructor(msg = 'Internal server error', details: unknown = null) {
    super(msg, 500, 'INTERNAL_ERROR', details, false);
  }
}
