import { z } from 'zod';
import { PublicUser } from '../auth/schemas';

export const studentSchema = z.object({
  id: z.string().uuid(),
  studentNumber: z.string(),
  guardianName: z.string().nullable().optional(),
  guardianPhone: z.string().nullable().optional(),
  guardianEmail: z.string().email().nullable().optional(),
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

export type Student = z.infer<typeof studentSchema>;

export const createStudentFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  studentNumber: z.string().min(1, 'Student number is required'),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
});

export const updateStudentFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  studentNumber: z.string().min(1, 'Student number is required'),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type CreateStudentFormValues = z.infer<typeof createStudentFormSchema>;
export type UpdateStudentFormValues = z.infer<typeof updateStudentFormSchema>;

export const paginatedStudentsSchema = z.object({
  items: z.array(studentSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export type PaginatedStudentsResponse = z.infer<typeof paginatedStudentsSchema>;

export interface ListStudentsQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: 'firstName' | 'lastName' | 'studentNumber' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
