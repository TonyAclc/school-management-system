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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  handler: (_, __, next) => next(new TooManyRequestsError()),
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  handler: (_, __, next) => next(new TooManyRequestsError()),
});

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  handler: (_, __, next) => next(new TooManyRequestsError()),
});

authRouter.post('/register', registerLimiter, validate({ body: registerBodySchema }), authController.register);
authRouter.post('/login', loginLimiter, validate({ body: loginBodySchema }), authController.login);
authRouter.post('/refresh', refreshLimiter, validate({ body: refreshBodySchema }), authController.refresh);
authRouter.post('/logout', validate({ body: logoutBodySchema }), authController.logout);

authRouter.get('/me', requireAuth, authController.me);
