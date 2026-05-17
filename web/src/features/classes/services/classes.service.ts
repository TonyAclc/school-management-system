import { apiClient } from '../../../lib/api-client';
import { 
  ClassModel, 
  classSchema, 
  PaginatedClassesResponse, 
  paginatedClassesSchema,
  CreateClassFormValues,
  UpdateClassFormValues,
  ListClassesQuery,
  Enrollment,
  enrollmentSchema,
  EnrollStudentFormValues
} from '../schemas';
import { z } from 'zod';

export const classesService = {
  list: (query: ListClassesQuery) => 
    apiClient<PaginatedClassesResponse>({
      path: '/classes',
      method: 'GET',
      query: query as Record<string, string | number | boolean>,
      schema: paginatedClassesSchema,
    }),

  getById: (id: string) =>
    apiClient<ClassModel>({
      path: `/classes/${id}`,
      method: 'GET',
      schema: classSchema,
    }),

  create: (data: CreateClassFormValues) =>
    apiClient<ClassModel>({
      path: '/classes',
      method: 'POST',
      body: data,
      schema: classSchema,
    }),

  update: (id: string, data: UpdateClassFormValues) =>
    apiClient<ClassModel>({
      path: `/classes/${id}`,
      method: 'PATCH',
      body: data,
      schema: classSchema,
    }),

  remove: (id: string) =>
    apiClient<void>({
      path: `/classes/${id}`,
      method: 'DELETE',
      schema: z.void(),
    }),

  getEnrollments: (id: string) =>
    apiClient<Enrollment[]>({
      path: `/classes/${id}/enrollments`,
      method: 'GET',
      schema: z.array(enrollmentSchema),
    }),

  enrollStudent: (id: string, data: EnrollStudentFormValues) =>
    apiClient<Enrollment>({
      path: `/classes/${id}/enrollments`,
      method: 'POST',
      body: data,
      schema: enrollmentSchema,
    }),

  removeEnrollment: (classId: string, studentId: string) =>
    apiClient<void>({
      path: `/classes/${classId}/enrollments/${studentId}`,
      method: 'DELETE',
      schema: z.void(),
    }),
};
