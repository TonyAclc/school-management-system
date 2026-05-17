import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/utils/pagination';

export const createTeacherSchema = {
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(128),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    phone: z.string().max(32).optional(),
    employeeNumber: z.string().min(1).max(50),
    department: z.string().max(100).optional(),
  }),
};

export const updateTeacherSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    email: z.string().email().optional(),
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    phone: z.string().max(32).optional().nullable(),
    employeeNumber: z.string().min(1).max(50).optional(),
    department: z.string().max(100).optional().nullable(),
    isActive: z.boolean().optional(),
  }),
};

export const getTeacherSchema = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export const listTeachersSchema = {
  query: paginationQuerySchema.extend({
    search: z.string().optional(),
    sortBy: z.enum(['firstName', 'lastName', 'employeeNumber', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
};

export type CreateTeacherBody = z.infer<typeof createTeacherSchema.body>;
export type UpdateTeacherBody = z.infer<typeof updateTeacherSchema.body>;
export type ListTeachersQuery = z.infer<typeof listTeachersSchema.query>;
