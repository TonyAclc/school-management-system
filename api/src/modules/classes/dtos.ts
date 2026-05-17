import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/utils/pagination';

export const createClassSchema = {
  body: z.object({
    gradeLevel: z.string().min(1).max(50),
    academicYear: z.string().min(1).max(20),
    homeroomTeacherId: z.string().uuid().optional().nullable(),
  }),
};

export const updateClassSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    gradeLevel: z.string().min(1).max(50).optional(),
    academicYear: z.string().min(1).max(20).optional(),
    homeroomTeacherId: z.string().uuid().optional().nullable(),
  }),
};

export const getClassSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const listClassesSchema = {
  query: paginationQuerySchema.extend({
    search: z.string().optional(),
    sortBy: z.enum(['gradeLevel', 'academicYear', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

export const enrollStudentSchema = {
  params: z.object({
    id: z.string().uuid(), // Class ID
  }),
  body: z.object({
    studentId: z.string().uuid(),
    academicYear: z.string().min(1).max(20),
  }),
};

export const removeEnrollmentSchema = {
  params: z.object({
    id: z.string().uuid(), // Class ID
    studentId: z.string().uuid(),
  }),
};

export type CreateClassBody = z.infer<typeof createClassSchema.body>;
export type UpdateClassBody = z.infer<typeof updateClassSchema.body>;
export type ListClassesQuery = z.infer<typeof listClassesSchema.query>;
export type EnrollStudentBody = z.infer<typeof enrollStudentSchema.body>;
