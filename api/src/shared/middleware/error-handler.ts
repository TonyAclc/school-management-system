import { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { AppError, ConflictError, InternalError, NotFoundError, ValidationError } from '../errors/app-error';
import { logger } from '../utils/logger';
import { env } from '../../config/env';

const normalizePrismaError = (err: Prisma.PrismaClientKnownRequestError): AppError => {
  switch (err.code) {
    case 'P2002': {
      const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : (err.meta?.target || 'value');
      return new ConflictError(`This ${target} is already in use`, { target: err.meta?.target });
    }
    case 'P2003':
      return new ConflictError('Foreign key constraint violation');
    case 'P2025':
      return new NotFoundError('Resource');
    default:
      return new InternalError('Database error', { prismaCode: err.code });
  }
};

const normalize = (err: unknown): AppError => {
  if (err instanceof AppError) return err;
  if (err instanceof ZodError) return new ValidationError('Validation failed', err.flatten());
  if (err instanceof Prisma.PrismaClientKnownRequestError) return normalizePrismaError(err);
  if (err instanceof Prisma.PrismaClientValidationError) return new ValidationError('DB query validation failed');
  if (err instanceof Error) return new InternalError(err.message);
  return new InternalError('Unknown error');
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const n = normalize(err);
  const is5xx = n.statusCode >= 500;
  const isProd = env.NODE_ENV === 'production';

  const logCtx = { err, requestId: req.id, statusCode: n.statusCode, code: n.code };
  if (is5xx || !n.isOperational) {
    logger.error(logCtx, n.message);
  } else {
    logger.warn(logCtx, n.message);
  }

  const body: Record<string, unknown> = {
    error: {
      code: n.code,
      message: is5xx && isProd ? 'Internal server error' : n.message,
      requestId: req.id,
      ...(n.details && !(is5xx && isProd) ? { details: n.details } : {}),
      ...(!isProd && n.stack ? { stack: n.stack } : {}),
    },
  };

  res.status(n.statusCode).json(body);
};
