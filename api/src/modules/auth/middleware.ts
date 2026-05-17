import { RequestHandler } from 'express';
import { RoleName } from '@prisma/client';
import { verifyAccessToken } from '../../shared/utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors/app-error';
import { RequesterContext } from './types';

export const requireAuth: RequestHandler = (req, _res, next) => {
  const auth = req.header('authorization');
  if (!auth?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Missing Authorization'));
    return;
  }
  
  const token = auth.slice(7).trim();
  if (!token) {
    next(new UnauthorizedError('Empty token'));
    return;
  }

  try {
    const claims = verifyAccessToken(token);
    req.user = { id: claims.sub, email: claims.email, roles: claims.roles };
    next();
  } catch (err) {
    next(err);
  }
};

export const requireRoles = (...allowed: RoleName[]): RequestHandler => (req, _res, next) => {
  if (!req.user) {
    next(new UnauthorizedError());
    return;
  }
  
  // Cast req.user.roles back to RoleName[] since they were stored as string[] in JWT
  const userRoles = req.user.roles as RoleName[];
  
  if (!userRoles.some(r => allowed.includes(r))) {
    next(new ForbiddenError(`Requires role: ${allowed.join(' or ')}`));
    return;
  }
  
  next();
};

export const requireUser = (req: Express.Request): RequesterContext => {
  if (req.user === undefined) throw new UnauthorizedError();
  return { id: req.user.id, roles: req.user.roles as RoleName[] };
};
