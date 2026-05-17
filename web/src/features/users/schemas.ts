import { z } from 'zod';
import { RoleName } from '../../store/auth-store';
import { publicUserSchema } from '../auth/schemas';

export const listUsersQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.custom<RoleName>().optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const createFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  roles: z.array(z.custom<RoleName>()).min(1),
  isActive: z.boolean().default(true),
});

export const updateFormSchema = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().nullable().optional(),
  roles: z.array(z.custom<RoleName>()).min(1).optional(),
  isActive: z.boolean().optional(),
});

export const paginatedUsersResponseSchema = z.object({
  items: z.array(publicUserSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type CreateUserFormValues = z.infer<typeof createFormSchema>;
export type UpdateUserFormValues = z.infer<typeof updateFormSchema>;
export type PaginatedUsersResponse = z.infer<typeof paginatedUsersResponseSchema>;
