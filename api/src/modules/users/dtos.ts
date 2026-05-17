import { z } from 'zod';
import { RoleName } from '@prisma/client';
import { paginationQuerySchema } from '../../shared/utils/pagination';

export const listUsersQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().min(1).max(100).optional(),
  role: z.nativeEnum(RoleName).optional(),
  isActive: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt', 'lastLoginAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const nameSchema = z.string().trim().min(1).max(100);
const phoneSchema = z.string().trim().max(32);
const emailSchema = z.string().trim().email().max(254).toLowerCase();

export const createUserBodySchema = z.object({
  email: emailSchema,
  password: z.string().min(8).max(128),
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema.optional(),
  roles: z.array(z.nativeEnum(RoleName)).min(1),
  isActive: z.boolean().default(true),
}).strict();

export const updateUserBodySchema = z.object({
  email: emailSchema.optional(),
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  phone: phoneSchema.nullable().optional(),
  isActive: z.boolean().optional(),
  roles: z.array(z.nativeEnum(RoleName)).min(1).optional(),
}).strict().refine(d => Object.keys(d).length > 0, { message: 'At least one field required' });

export const userIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export type UserIdParams = z.infer<typeof userIdParamsSchema>;
