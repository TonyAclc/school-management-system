import { Router } from 'express';
import { teachersController } from './controller';
import { validate } from '../../shared/middleware/validate';
import { requireAuth, requireRoles } from '../auth/middleware';
import { createTeacherSchema, updateTeacherSchema, getTeacherSchema, listTeachersSchema } from './dtos';
import { RoleName } from '@prisma/client';

export const teachersRouter = Router();

teachersRouter.use(requireAuth);

teachersRouter.get(
  '/',
  requireRoles(RoleName.ADMIN, RoleName.STAFF),
  validate(listTeachersSchema),
  teachersController.list
);

teachersRouter.get(
  '/:id',
  requireRoles(RoleName.ADMIN, RoleName.STAFF),
  validate(getTeacherSchema),
  teachersController.get
);

teachersRouter.post(
  '/',
  requireRoles(RoleName.ADMIN),
  validate(createTeacherSchema),
  teachersController.create
);

teachersRouter.patch(
  '/:id',
  requireRoles(RoleName.ADMIN),
  validate(updateTeacherSchema),
  teachersController.update
);

teachersRouter.delete(
  '/:id',
  requireRoles(RoleName.ADMIN),
  validate(getTeacherSchema),
  teachersController.remove
);
