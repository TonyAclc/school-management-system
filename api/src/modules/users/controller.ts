import { RequestHandler } from 'express';
import { usersService } from './service';
import { requireUser } from '../auth/middleware';
import { CreateUserBody, UpdateUserBody, ListUsersQuery, UserIdParams } from './dtos';

export const usersController = {
  list: (async (req, res, next) => {
    try {
      const requester = requireUser(req);
      const result = await usersService.list(req.query as unknown as ListUsersQuery, requester);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  get: (async (req, res, next) => {
    try {
      const requester = requireUser(req);
      const params = req.params as unknown as UserIdParams;
      const user = await usersService.get(params.id, requester);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  create: (async (req, res, next) => {
    try {
      const requester = requireUser(req);
      const user = await usersService.create(req.body as CreateUserBody, requester);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  update: (async (req, res, next) => {
    try {
      const requester = requireUser(req);
      const params = req.params as unknown as UserIdParams;
      const user = await usersService.update(params.id, req.body as UpdateUserBody, requester);
      res.json(user);
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,

  remove: (async (req, res, next) => {
    try {
      const requester = requireUser(req);
      const params = req.params as unknown as UserIdParams;
      await usersService.remove(params.id, requester);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  }) as RequestHandler,
};
