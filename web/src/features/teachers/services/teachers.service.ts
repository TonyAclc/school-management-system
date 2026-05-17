import { apiClient } from '../../../lib/api-client';
import { 
  Teacher, 
  teacherSchema, 
  PaginatedTeachersResponse, 
  paginatedTeachersSchema,
  CreateTeacherFormValues,
  UpdateTeacherFormValues,
  ListTeachersQuery
} from '../schemas';
import { z } from 'zod';

export const teachersService = {
  list: (query: ListTeachersQuery) => 
    apiClient<PaginatedTeachersResponse>({
      path: '/teachers',
      method: 'GET',
      query: query as Record<string, string | number | boolean>,
      schema: paginatedTeachersSchema,
    }),

  getById: (id: string) =>
    apiClient<Teacher>({
      path: `/teachers/${id}`,
      method: 'GET',
      schema: teacherSchema,
    }),

  create: (data: CreateTeacherFormValues) =>
    apiClient<Teacher>({
      path: '/teachers',
      method: 'POST',
      body: data,
      schema: teacherSchema,
    }),

  update: (id: string, data: UpdateTeacherFormValues) =>
    apiClient<Teacher>({
      path: `/teachers/${id}`,
      method: 'PATCH',
      body: data,
      schema: teacherSchema,
    }),

  remove: (id: string) =>
    apiClient<void>({
      path: `/teachers/${id}`,
      method: 'DELETE',
      schema: z.void(),
    }),
};
