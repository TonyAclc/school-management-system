import { QueryClient } from '@tanstack/react-query';
import { isApiError } from './api-error';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: (count, err) => {
        if (isApiError(err) && err.statusCode >= 400 && err.statusCode < 500) return false;
        return count < 2;
      },
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 8000),
    },
    mutations: { retry: false },
  },
});
