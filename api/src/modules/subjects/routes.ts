import { Router } from 'express';
import { subjectsController } from './controller';
import { validate } from '../../shared/middleware/validate';
import { requireAuth, requireRoles } from '../auth/middleware';
import { createSubjectSchema, updateSubjectSchema, getSubjectSchema, listSubjectsSchema } from './dtos';
import { RoleName } from '@prisma/client';

export const subjectsRouter = Router();

subjectsRouter.use(requireAuth);

subjectsRouter.get(
  '/',
  requireRoles(RoleName.ADMIN, RoleName.TEACHER, RoleName.STAFF, RoleName.STUDENT),
  validate(listSubjectsSchema),
  subjectsController.list
);

subjectsRouter.get(
  '/:id',
  requireRoles(RoleName.ADMIN, RoleName.TEACHER, RoleName.STAFF, RoleName.STUDENT),
  validate(getSubjectSchema),
  subjectsController.get
);

subjectsRouter.post(
  '/',
  requireRoles(RoleName.ADMIN),
  validate(createSubjectSchema),
  subjectsController.create
);

subjectsRouter.patch(
  '/:id',
  requireRoles(RoleName.ADMIN),
  validate(updateSubjectSchema),
  subjectsController.update
);

subjectsRouter.delete(
  '/:id',
  requireRoles(RoleName.ADMIN),
  validate(getSubjectSchema),
  subjectsController.remove
);
