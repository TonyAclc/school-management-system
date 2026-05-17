import { z } from 'zod';

export const gradeRecordSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  subjectId: z.string(),
  academicYear: z.string(),
  term: z.string(),
  score: z.union([z.number(), z.string()]).transform(v => typeof v === 'string' ? parseFloat(v) : v),
  maxScore: z.union([z.number(), z.string()]).transform(v => typeof v === 'string' ? parseFloat(v) : v),
  student: z.object({
    id: z.string(),
    studentNumber: z.string(),
    user: z.object({
      firstName: z.string(),
      lastName: z.string(),
    }),
  }).optional(),
  subject: z.object({
    id: z.string(),
    code: z.string(),
    name: z.string(),
  }).optional(),
});

export type GradeRecord = z.infer<typeof gradeRecordSchema>;

export const getGradesQuerySchema = z.object({
  subjectId: z.string().optional(),
  studentId: z.string().optional(),
  academicYear: z.string().optional(),
  term: z.string().optional(),
});

export type GetGradesQuery = z.infer<typeof getGradesQuerySchema>;

export const bulkUpsertGradesSchema = z.object({
  subjectId: z.string(),
  academicYear: z.string(),
  term: z.string(),
  maxScore: z.number().default(100),
  records: z.array(
    z.object({
      studentId: z.string(),
      score: z.number(),
    })
  ),
});

export type BulkUpsertGradesBody = z.infer<typeof bulkUpsertGradesSchema>;
