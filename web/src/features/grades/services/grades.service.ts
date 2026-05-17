import { apiClient } from '../../../lib/api-client';
import { 
  GradeRecord,
  gradeRecordSchema,
  GetGradesQuery,
  BulkUpsertGradesBody,
} from '../schemas';
import { z } from 'zod';

export const gradesService = {
  list: (query: GetGradesQuery) => 
    apiClient<GradeRecord[]>({
      path: '/grades',
      method: 'GET',
      query: query as unknown as Record<string, string>,
      schema: z.array(gradeRecordSchema),
    }),

  bulkUpsert: (data: BulkUpsertGradesBody) =>
    apiClient<GradeRecord[]>({
      path: '/grades/bulk',
      method: 'POST',
      body: data,
      schema: z.array(gradeRecordSchema),
    }),
};
