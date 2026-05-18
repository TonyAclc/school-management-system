import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../shared/middleware/validate';
import { TooManyRequestsError } from '../../shared/errors/app-error';
import { requireAuth } from './middleware';
import { authController } from './controller';
import {
  registerBodySchema,
  loginBodySchema,
  refreshBodySchema,
  logoutBodySchema,
} from './dtos';

export const authRouter = Router();

const getMessage = (req: any, options: any) => {
  const msLeft = req.rateLimit?.resetTime ? req.rateLimit.resetTime.getTime() - Date.now() : options.windowMs;
  const mins = Math.max(1, Math.ceil(msLeft / 60000));
  return `Too many requests. Please wait ${mins} minute${mins === 1 ? '' : 's'} before trying again.`;
};

const loginLimiter = rateLimit({
  windowMs: 3 * 60 * 1000,
  limit: 5,
  handler: (req, res, next, options) => next(new TooManyRequestsError(getMessage(req, options))),
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  handler: (req, res, next, options) => next(new TooManyRequestsError(getMessage(req, options))),
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  handler: (req, res, next, options) => next(new TooManyRequestsError(getMessage(req, options))),
});

authRouter.post('/register', registerLimiter, validate({ body: registerBodySchema }), authController.register);
authRouter.post('/login', loginLimiter, validate({ body: loginBodySchema }), authController.login);
authRouter.post('/refresh', refreshLimiter, validate({ body: refreshBodySchema }), authController.refresh);
authRouter.post('/logout', validate({ body: logoutBodySchema }), authController.logout);

authRouter.get('/me', requireAuth, authController.me);
