import { Router } from 'express';
import { validate } from '../../shared/middleware/validate';
import { requireAuth } from '../auth/middleware';
import { usersController } from './controller';
import {
  listUsersQuerySchema,
  createUserBodySchema,
  updateUserBodySchema,
  userIdParamsSchema,
} from './dtos';

export const usersRouter = Router();

usersRouter.use(requireAuth);

usersRouter.get('/', validate({ query: listUsersQuerySchema }), usersController.list);
usersRouter.post('/', validate({ body: createUserBodySchema }), usersController.create);
usersRouter.get('/:id', validate({ params: userIdParamsSchema }), usersController.get);
usersRouter.patch('/:id', validate({ params: userIdParamsSchema, body: updateUserBodySchema }), usersController.update);
usersRouter.delete('/:id', validate({ params: userIdParamsSchema }), usersController.remove);
