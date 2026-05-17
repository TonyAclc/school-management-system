import { apiClient } from '../../../lib/api-client';
import { 
  Student, 
  studentSchema, 
  PaginatedStudentsResponse, 
  paginatedStudentsSchema,
  CreateStudentFormValues,
  UpdateStudentFormValues,
  ListStudentsQuery
} from '../schemas';
import { z } from 'zod';

export const studentsService = {
  list: (query: ListStudentsQuery) => 
    apiClient<PaginatedStudentsResponse>({
      path: '/students',
      method: 'GET',
      query: query as Record<string, string | number | boolean>,
      schema: paginatedStudentsSchema,
    }),

  getById: (id: string) =>
    apiClient<Student>({
      path: `/students/${id}`,
      method: 'GET',
      schema: studentSchema,
    }),

  create: (data: CreateStudentFormValues) =>
    apiClient<Student>({
      path: '/students',
      method: 'POST',
      body: data,
      schema: studentSchema,
    }),

  update: (id: string, data: UpdateStudentFormValues) =>
    apiClient<Student>({
      path: `/students/${id}`,
      method: 'PATCH',
      body: data,
      schema: studentSchema,
    }),

  remove: (id: string) =>
    apiClient<void>({
      path: `/students/${id}`,
      method: 'DELETE',
      schema: z.void(),
    }),
};
