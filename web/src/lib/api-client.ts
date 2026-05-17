import { ZodType } from 'zod';
import { env } from '../config/env';
import { ApiError } from './api-error';
import { useAuthStore } from '../store/auth-store';
import { authStorage } from './auth-storage';

export interface RequestConfig<T> {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  schema: ZodType<T>;
  skipAuth?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

const performRefresh = async (): Promise<string | null> => {
  const token = authStorage.getRefreshToken();
  if (!token) return null;

  try {
    const res = await fetch(`${env.VITE_API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token }),
    });

    if (!res.ok) throw new Error('Refresh failed');
    
    const data = await res.json();
    authStorage.setRefreshToken(data.refreshToken);
    useAuthStore.getState().setSession(data.user, data.accessToken);
    return data.accessToken;
  } catch {
    return null;
  }
};

export const refreshAccessToken = (): Promise<string | null> => {
  if (refreshPromise !== null) return refreshPromise;
  refreshPromise = performRefresh().finally(() => { refreshPromise = null; });
  return refreshPromise;
};

export const apiClient = async <T>(config: RequestConfig<T>): Promise<T> => {
  const { path, method = 'GET', body, query, schema, skipAuth } = config;

  const url = new URL(`${env.VITE_API_BASE_URL}${path}`, window.location.origin);
  
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    ...config.headers,
  };

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const makeRequest = async (tokenOverride?: string) => {
    if (!skipAuth) {
      const token = tokenOverride ?? useAuthStore.getState().accessToken;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      signal: config.signal,
    });

    return res;
  };

  let res = await makeRequest();

  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await makeRequest(newToken);
    } else {
      authStorage.clearRefreshToken();
      useAuthStore.getState().clearSession();
      throw new ApiError(401, 'UNAUTHORIZED', 'Session expired');
    }
  }

  if (!res.ok) {
    let errorData;
    try {
      errorData = await res.json();
    } catch {
      throw new ApiError(res.status, 'UNKNOWN_ERROR', 'An unexpected error occurred');
    }

    throw new ApiError(
      res.status,
      errorData?.error?.code || 'UNKNOWN_ERROR',
      errorData?.error?.message || 'An unexpected error occurred',
      errorData?.error?.details,
      errorData?.error?.requestId
    );
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return schema.parse(undefined);
  }

  const data = await res.json();
  return schema.parse(data);
};
