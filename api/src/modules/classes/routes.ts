import { Router } from 'express';
import { classesController } from './controller';
import { validate } from '../../shared/middleware/validate';
import { requireAuth, requireRoles } from '../auth/middleware';
import { 
  createClassSchema, 
  updateClassSchema, 
  getClassSchema, 
  listClassesSchema,
  enrollStudentSchema,
  removeEnrollmentSchema
} from './dtos';
import { RoleName } from '@prisma/client';

export const classesRouter = Router();

classesRouter.use(requireAuth);

classesRouter.get(
  '/',
  requireRoles(RoleName.ADMIN, RoleName.TEACHER, RoleName.STAFF),
  validate(listClassesSchema),
  classesController.list
);

classesRouter.get(
  '/:id',
  requireRoles(RoleName.ADMIN, RoleName.TEACHER, RoleName.STAFF),
  validate(getClassSchema),
  classesController.get
);

classesRouter.post(
  '/',
  requireRoles(RoleName.ADMIN),
  validate(createClassSchema),
  classesController.create
);

classesRouter.patch(
  '/:id',
  requireRoles(RoleName.ADMIN),
  validate(updateClassSchema),
  classesController.update
);

classesRouter.delete(
  '/:id',
  requireRoles(RoleName.ADMIN),
  validate(getClassSchema),
  classesController.remove
);

// Enrollment routes
classesRouter.get(
  '/:id/enrollments',
  requireRoles(RoleName.ADMIN, RoleName.TEACHER, RoleName.STAFF),
  validate(getClassSchema),
  classesController.getEnrollments
);

classesRouter.post(
  '/:id/enrollments',
  requireRoles(RoleName.ADMIN),
  validate(enrollStudentSchema),
  classesController.enrollStudent
);

classesRouter.delete(
  '/:id/enrollments/:studentId',
  requireRoles(RoleName.ADMIN),
  validate(removeEnrollmentSchema),
  classesController.removeEnrollment
);
