import { RequestHandler } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ValidationError } from '../errors/app-error';

export const validate = (schemas: { body?: ZodTypeAny; query?: ZodTypeAny; params?: ZodTypeAny }): RequestHandler =>
  async (req, _res, next) => {
    try {
      if (schemas.body) req.body = await schemas.body.parseAsync(req.body);
      if (schemas.query) {
        const parsed = await schemas.query.parseAsync(req.query);
        Object.defineProperty(req, 'query', { value: parsed, writable: true, enumerable: true, configurable: true });
      }
      if (schemas.params) {
        const parsed = await schemas.params.parseAsync(req.params);
        Object.defineProperty(req, 'params', { value: parsed, writable: true, enumerable: true, configurable: true });
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(new ValidationError('Request validation failed', err.flatten()));
        return;
      }
      next(err);
    }
  };
