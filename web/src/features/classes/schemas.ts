import { z } from 'zod';
import { Teacher } from '../teachers/schemas';
import { Student } from '../students/schemas';

export const classSchema = z.object({
  id: z.string().uuid(),
  gradeLevel: z.string(),
  academicYear: z.string(),
  homeroomTeacherId: z.string().uuid().nullable(),
  createdAt: z.string(),
  homeroomTeacher: z.object({
    id: z.string(),
    employeeNumber: z.string(),
    user: z.object({
      firstName: z.string(),
      lastName: z.string(),
    }),
  }).nullable().optional(),
  _count: z.object({
    enrollments: z.number()
  }).optional(),
});

export type ClassModel = z.infer<typeof classSchema>;

export const createClassFormSchema = z.object({
  gradeLevel: z.string().min(1, 'Grade Level is required'),
  academicYear: z.string().min(1, 'Academic Year is required'),
  homeroomTeacherId: z.string().optional().nullable(),
});

export const updateClassFormSchema = z.object({
  gradeLevel: z.string().min(1, 'Grade Level is required'),
  academicYear: z.string().min(1, 'Academic Year is required'),
  homeroomTeacherId: z.string().optional().nullable(),
});

export type CreateClassFormValues = z.infer<typeof createClassFormSchema>;
export type UpdateClassFormValues = z.infer<typeof updateClassFormSchema>;

export const paginatedClassesSchema = z.object({
  items: z.array(classSchema),
  totalCount: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

export type PaginatedClassesResponse = z.infer<typeof paginatedClassesSchema>;

export interface ListClassesQuery {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: 'gradeLevel' | 'academicYear' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Enrollments
export const enrollmentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  classId: z.string(),
  academicYear: z.string(),
  student: z.object({
    id: z.string(),
    studentNumber: z.string(),
    user: z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string(),
    }),
  }).optional(),
});

export type Enrollment = z.infer<typeof enrollmentSchema>;

export const enrollStudentFormSchema = z.object({
  studentId: z.string().min(1, 'Student must be selected'),
  academicYear: z.string().min(1, 'Academic year is required'),
});

export type EnrollStudentFormValues = z.infer<typeof enrollStudentFormSchema>;
