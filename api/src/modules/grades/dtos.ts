import { z } from 'zod';

export const getGradesSchema = {
  query: z.object({
    subjectId: z.string().uuid().optional(),
    studentId: z.string().uuid().optional(),
    academicYear: z.string().optional(),
    term: z.string().optional(),
  }),
};

export const bulkUpsertGradesSchema = {
  body: z.object({
    subjectId: z.string().uuid(),
    academicYear: z.string().min(1).max(20),
    term: z.string().min(1).max(20),
    maxScore: z.number().min(0).max(1000).default(100),
    records: z.array(
      z.object({
        studentId: z.string().uuid(),
        score: z.number().min(0).max(1000),
      })
    ).min(1, 'At least one grade record is required'),
  }),
};

export type GetGradesQuery = z.infer<typeof getGradesSchema.query>;
export type BulkUpsertGradesBody = z.infer<typeof bulkUpsertGradesSchema.body>;
