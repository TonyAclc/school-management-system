import { RequestHandler } from 'express';
import { authService } from './service';
import { RegisterBody, LoginBody, RefreshBody, LogoutBody } from './dtos';
import { requireUser } from './middleware';

export const authController = {
  register: (async (req, res, next) => {
    try {
      const pair = await authService.register(req.body as RegisterBody);
      res.json(pair);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  login: (async (req, res, next) => {
    try {
      const pair = await authService.login(req.body as LoginBody);
      res.json(pair);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  refresh: (async (req, res, next) => {
    try {
      const pair = await authService.refresh(req.body as RefreshBody);
      res.json(pair);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  logout: (async (req, res, next) => {
    try {
      await authService.logout(req.body as LogoutBody);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  me: (async (req, res, next) => {
    try {
      const requester = requireUser(req);
      const user = await authService.me(requester.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
