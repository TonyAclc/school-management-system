import { z } from 'zod';
import { Teacher } from '../teachers/schemas';

export const subjectSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  teacherId: z.string().uuid().nullable(),
  createdAt: z.string(),
  teacher: z.object({
    id: z.string(),
    employeeNumber: z.string(),
    user: z.object({
      firstName: z.string(),
      lastName: z.string(),
    }),
  }).nullable().optional(),
});

export type Subject = z.infer<typeof subjectSchema>;

export const createSubjectFormSchema = z.object({
  code: z.string().min(1, 'Subject code is required'),
  name: z.string().min(1, 'Subject name is required'),
  teacherId: z.string().optional().nullable(),
});

export const updateSubjectFormSchema = z.object({
  code: z.string().min(1, 'Subject code is required'),
  name: z.string().min(1, 'Subject name is required'),
  teacherId: z.string().optional().nullable(),
});

export type CreateSubjectFormValues = z.infer<typeof createSubjectFormSchema>;
export type UpdateSubjectFormValues = z.infer<typeof updateSubjectFormSchema>;

export const paginatedSubjectsSchema = z.object({
  items: z.array(subjectSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export type PaginatedSubjectsResponse = z.infer<typeof paginatedSubjectsSchema>;

export interface ListSubjectsQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: 'code' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
