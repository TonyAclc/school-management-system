import { z } from 'zod';
import { apiClient } from '../../../lib/api-client';
import { publicUserSchema, PublicUser } from '../../auth/schemas';
import {
  ListUsersQuery,
  CreateUserFormValues,
  UpdateUserFormValues,
  paginatedUsersResponseSchema,
  PaginatedUsersResponse,
} from '../schemas';

export const usersService = {
  list: async (query: ListUsersQuery): Promise<PaginatedUsersResponse> => {
    return apiClient({
      path: '/users',
      method: 'GET',
      query: query as Record<string, any>,
      schema: paginatedUsersResponseSchema,
    });
  },

  get: async (id: string): Promise<PublicUser> => {
    return apiClient({
      path: `/users/${id}`,
      method: 'GET',
      schema: publicUserSchema,
    });
  },

  create: async (input: CreateUserFormValues): Promise<PublicUser> => {
    return apiClient({
      path: '/users',
      method: 'POST',
      body: input,
      schema: publicUserSchema,
    });
  },

  update: async (id: string, patch: UpdateUserFormValues): Promise<PublicUser> => {
    return apiClient({
      path: `/users/${id}`,
      method: 'PATCH',
      body: patch,
      schema: publicUserSchema,
    });
  },

  remove: async (id: string): Promise<void> => {
    await apiClient({
      path: `/users/${id}`,
      method: 'DELETE',
      schema: z.any(),
    });
  },
};
