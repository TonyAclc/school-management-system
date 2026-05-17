import { Router } from 'express';
import { attendanceController } from './controller';
import { validate } from '../../shared/middleware/validate';
import { requireAuth, requireRoles } from '../auth/middleware';
import { getAttendanceSchema, bulkUpsertAttendanceSchema } from './dtos';
import { RoleName } from '@prisma/client';

export const attendanceRouter = Router();

attendanceRouter.use(requireAuth);

attendanceRouter.get(
  '/',
  requireRoles(RoleName.ADMIN, RoleName.TEACHER, RoleName.STAFF),
  validate(getAttendanceSchema),
  attendanceController.get
);

attendanceRouter.post(
  '/bulk',
  requireRoles(RoleName.ADMIN, RoleName.TEACHER),
  validate(bulkUpsertAttendanceSchema),
  attendanceController.bulkUpsert
);
