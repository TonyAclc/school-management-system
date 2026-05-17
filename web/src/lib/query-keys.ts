export const usersKeys = {
  all: ['users'] as const,
  lists: () => [...usersKeys.all, 'list'] as const,
  list: (q: Record<string, unknown>) => [...usersKeys.lists(), q] as const,
  details: () => [...usersKeys.all, 'detail'] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

export const authKeys = {
  me: ['me'] as const,
};
