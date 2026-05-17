import { RequestHandler } from 'express';
import { logger } from '../utils/logger';

export const httpLogger: RequestHandler = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const msg = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;

    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      requestId: req.id,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };

    if (res.statusCode >= 500) {
      logger.error(logData, msg);
    } else if (res.statusCode >= 400) {
      logger.warn(logData, msg);
    } else {
      logger.info(logData, msg);
    }
  });

  next();
};
