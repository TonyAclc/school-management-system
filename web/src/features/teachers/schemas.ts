import { z } from 'zod';
import { PublicUser } from '../auth/schemas';

export const teacherSchema = z.object({
  id: z.string().uuid(),
  employeeNumber: z.string(),
  department: z.string().nullable().optional(),
  userId: z.string().uuid(),
  createdAt: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string().nullable(),
    isActive: z.boolean(),
  }),
});

export type Teacher = z.infer<typeof teacherSchema>;

export const createTeacherFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  employeeNumber: z.string().min(1, 'Employee number is required'),
  department: z.string().optional(),
});

export const updateTeacherFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  employeeNumber: z.string().min(1, 'Employee number is required'),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateTeacherFormValues = z.infer<typeof createTeacherFormSchema>;
export type UpdateTeacherFormValues = z.infer<typeof updateTeacherFormSchema>;

export const paginatedTeachersSchema = z.object({
  items: z.array(teacherSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export type PaginatedTeachersResponse = z.infer<typeof paginatedTeachersSchema>;

export interface ListTeachersQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: 'firstName' | 'lastName' | 'employeeNumber' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
