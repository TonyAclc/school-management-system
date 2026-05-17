import { z } from 'zod';
import { AttendanceStatus } from '@prisma/client';

export const getAttendanceSchema = {
  query: z.object({
    classId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  }),
};

export const bulkUpsertAttendanceSchema = {
  body: z.object({
    classId: z.string().uuid(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    records: z.array(
      z.object({
        studentId: z.string().uuid(),
        status: z.nativeEnum(AttendanceStatus),
        notes: z.string().optional().nullable(),
      })
    ).min(1, 'At least one attendance record is required'),
  }),
};

export type GetAttendanceQuery = z.infer<typeof getAttendanceSchema.query>;
export type BulkUpsertAttendanceBody = z.infer<typeof bulkUpsertAttendanceSchema.body>;
