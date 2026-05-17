import { Router } from 'express';
import { studentsController } from './controller';
import { validate } from '../../shared/middleware/validate';
import { requireAuth, requireRoles } from '../auth/middleware';
import { createStudentSchema, updateStudentSchema, getStudentSchema, listStudentsSchema } from './dtos';
import { RoleName } from '@prisma/client';

export const studentsRouter = Router();

studentsRouter.use(requireAuth);

studentsRouter.get(
  '/',
  requireRoles(RoleName.ADMIN, RoleName.TEACHER, RoleName.STAFF),
  validate(listStudentsSchema),
  studentsController.list
);

studentsRouter.get(
  '/:id',
  requireRoles(RoleName.ADMIN, RoleName.TEACHER, RoleName.STAFF),
  validate(getStudentSchema),
  studentsController.get
);

studentsRouter.post(
  '/',
  requireRoles(RoleName.ADMIN),
  validate(createStudentSchema),
  studentsController.create
);

studentsRouter.patch(
  '/:id',
  requireRoles(RoleName.ADMIN),
  validate(updateStudentSchema),
  studentsController.update
);

studentsRouter.delete(
  '/:id',
  requireRoles(RoleName.ADMIN),
  validate(getStudentSchema),
  studentsController.remove
);
