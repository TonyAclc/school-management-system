import { Router } from 'express';
import { gradesController } from './controller';
import { validate } from '../../shared/middleware/validate';
import { requireAuth, requireRoles } from '../auth/middleware';
import { getGradesSchema, bulkUpsertGradesSchema } from './dtos';
import { RoleName } from '@prisma/client';

export const gradesRouter = Router();

gradesRouter.use(requireAuth);

gradesRouter.get(
  '/',
  requireRoles(RoleName.ADMIN, RoleName.TEACHER, RoleName.STAFF, RoleName.STUDENT),
  validate(getGradesSchema),
  gradesController.get
);

gradesRouter.post(
  '/bulk',
  requireRoles(RoleName.ADMIN, RoleName.TEACHER),
  validate(bulkUpsertGradesSchema),
  gradesController.bulkUpsert
);
