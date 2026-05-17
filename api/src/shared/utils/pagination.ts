import { z } from 'zod';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const paginationToSkipTake = (query: PaginationQuery) => {
  return {
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
  };
};

export const buildPaginatedResult = <T>(
  items: T[],
  totalCount: number,
  query: PaginationQuery
): PaginatedResult<T> => {
  return {
    items,
    totalCount,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(totalCount / query.pageSize),
  };
};
