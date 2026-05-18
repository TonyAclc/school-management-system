import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import { prisma } from './db/prisma';
import { requestId } from './shared/middleware/request-id';
import { httpLogger } from './shared/middleware/http-logger';
import { notFoundHandler } from './shared/middleware/not-found';
import { errorHandler } from './shared/middleware/error-handler';
import { TooManyRequestsError } from './shared/errors/app-error';

// Import routers later
import { authRouter } from './modules/auth/routes';
import { usersRouter } from './modules/users/routes';
import { studentsRouter } from './modules/students/routes';
import { teachersRouter } from './modules/teachers/routes';
import { subjectsRouter } from './modules/subjects/routes';
import { classesRouter } from './modules/classes/routes';
import { attendanceRouter } from './modules/attendance/routes';
import { gradesRouter } from './modules/grades/routes';

export const createApp = (): Application => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // 1. Security headers
  app.use(helmet());

  // 2. CORS
  app.use(cors({ origin: env.CORS_ORIGINS, credentials: true }));

  // 3. Body parsers
  app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
  app.use(express.urlencoded({ extended: false, limit: env.JSON_BODY_LIMIT }));

  // 4. Compression
  app.use(compression());

  // 5. Request ID
  app.use(requestId);

  // 6. Structured access log
  app.use(httpLogger);

  // 7. Global rate limit
  app.use(rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      const msLeft = (req as any).rateLimit?.resetTime ? (req as any).rateLimit.resetTime.getTime() - Date.now() : options.windowMs;
      const mins = Math.max(1, Math.ceil(msLeft / 60000));
      next(new TooManyRequestsError(`Too many requests. Please wait ${mins} minute${mins === 1 ? '' : 's'} before trying again.`));
    }
  }));

  // 8. Health endpoints
  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.get('/health/ready', async (_req: Request, res: Response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ready', db: 'ok' });
    } catch {
      res.status(503).json({ status: 'not_ready', db: 'failed' });
    }
  });

  // 7. Mount routes
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/students', studentsRouter);
  app.use('/api/v1/teachers', teachersRouter);
  app.use('/api/v1/subjects', subjectsRouter);
  app.use('/api/v1/classes', classesRouter);
  app.use('/api/v1/attendance', attendanceRouter);
  app.use('/api/v1/grades', gradesRouter);

  // 8. Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
