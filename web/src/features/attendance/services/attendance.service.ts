import { apiClient } from '../../../lib/api-client';
import {
  AttendanceRecord,
  attendanceRecordSchema,
  GetAttendanceQuery,
  BulkUpsertAttendanceBody,
} from '../schemas';
import { z } from 'zod';

export const attendanceService = {
  getByClassAndDate: (query: GetAttendanceQuery) =>
    apiClient<AttendanceRecord[]>({
      path: '/attendance',
      method: 'GET',
      query: query as unknown as Record<string, string>,
      schema: z.array(attendanceRecordSchema),
    }),

  bulkUpsert: (data: BulkUpsertAttendanceBody) =>
    apiClient<AttendanceRecord[]>({
      path: '/attendance/bulk',
      method: 'POST',
      body: data,
      schema: z.array(attendanceRecordSchema),
    }),
};
