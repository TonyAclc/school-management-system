import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/utils/pagination';

export const createSubjectSchema = {
  body: z.object({
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(100),
    teacherId: z.string().uuid().optional().nullable(),
  }),
};

export const updateSubjectSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    code: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(100).optional(),
    teacherId: z.string().uuid().optional().nullable(),
  }),
};

export const getSubjectSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const listSubjectsSchema = {
  query: paginationQuerySchema.extend({
    search: z.string().optional(),
    sortBy: z.enum(['code', 'name', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

export type CreateSubjectBody = z.infer<typeof createSubjectSchema.body>;
export type UpdateSubjectBody = z.infer<typeof updateSubjectSchema.body>;
export type ListSubjectsQuery = z.infer<typeof listSubjectsSchema.query>;
