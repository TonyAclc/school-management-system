import { z } from 'zod';

export const attendanceStatusSchema = z.enum(['PRESENT', 'LATE', 'ABSENT', 'EXCUSED']);

export const attendanceRecordSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  classId: z.string(),
  date: z.string(),
  status: attendanceStatusSchema,
  notes: z.string().nullable().optional(),
});

export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;

export const getAttendanceQuerySchema = z.object({
  classId: z.string(),
  date: z.string(),
});

export type GetAttendanceQuery = z.infer<typeof getAttendanceQuerySchema>;

export const bulkUpsertAttendanceSchema = z.object({
  classId: z.string(),
  date: z.string(),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: attendanceStatusSchema,
      notes: z.string().optional().nullable(),
    })
  ),
});

export type BulkUpsertAttendanceBody = z.infer<typeof bulkUpsertAttendanceSchema>;
