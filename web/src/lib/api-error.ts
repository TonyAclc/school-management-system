export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

export const errorMessage = (e: unknown): string =>
  isApiError(e) ? e.message : e instanceof Error ? e.message : 'An unexpected error occurred';
