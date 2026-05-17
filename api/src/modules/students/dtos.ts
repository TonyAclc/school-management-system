import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/utils/pagination';

export const createStudentSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    phone: z.string().max(32).optional(),
    studentNumber: z.string().min(1).max(50),
    guardianName: z.string().max(100).optional(),
    guardianPhone: z.string().max(32).optional(),
    guardianEmail: z.string().email().max(254).optional(),
  }),
};

export const updateStudentSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    email: z.string().email().optional(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    phone: z.string().max(32).optional().nullable(),
    studentNumber: z.string().min(1).max(50).optional(),
    guardianName: z.string().max(100).optional().nullable(),
    guardianPhone: z.string().max(32).optional().nullable(),
    guardianEmail: z.string().email().max(254).optional().nullable(),
    isActive: z.boolean().optional(),
  }),
};

export const getStudentSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const listStudentsSchema = {
  query: paginationQuerySchema.extend({
    search: z.string().optional(),
    sortBy: z.enum(['firstName', 'lastName', 'studentNumber', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

export type CreateStudentBody = z.infer<typeof createStudentSchema.body>;
export type UpdateStudentBody = z.infer<typeof updateStudentSchema.body>;
export type ListStudentsQuery = z.infer<typeof listStudentsSchema.query>;
