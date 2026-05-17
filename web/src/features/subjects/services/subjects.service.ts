import { apiClient } from '../../../lib/api-client';
import { 
  Subject, 
  subjectSchema, 
  PaginatedSubjectsResponse, 
  paginatedSubjectsSchema,
  CreateSubjectFormValues,
  UpdateSubjectFormValues,
  ListSubjectsQuery
} from '../schemas';
import { z } from 'zod';

export const subjectsService = {
  list: (query: ListSubjectsQuery) => 
    apiClient<PaginatedSubjectsResponse>({
      path: '/subjects',
      method: 'GET',
      query: query as Record<string, string | number | boolean>,
      schema: paginatedSubjectsSchema,
    }),

  getById: (id: string) =>
    apiClient<Subject>({
      path: `/subjects/${id}`,
      method: 'GET',
      schema: subjectSchema,
    }),

  create: (data: CreateSubjectFormValues) =>
    apiClient<Subject>({
      path: '/subjects',
      method: 'POST',
      body: data,
      schema: subjectSchema,
    }),

  update: (id: string, data: UpdateSubjectFormValues) =>
    apiClient<Subject>({
      path: `/subjects/${id}`,
      method: 'PATCH',
      body: data,
      schema: subjectSchema,
    }),

  remove: (id: string) =>
    apiClient<void>({
      path: `/subjects/${id}`,
      method: 'DELETE',
      schema: z.void(),
    }),
};
