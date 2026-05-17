import { z } from 'zod';
import { apiClient } from '../../../lib/api-client';
import { authStorage } from '../../../lib/auth-storage';
import { useAuthStore } from '../../../store/auth-store';
import { tokenPairSchema, publicUserSchema, TokenPair, LoginFormValues, RegisterFormValues } from '../schemas';

const persistSession = (pair: TokenPair) => {
  authStorage.setRefreshToken(pair.refreshToken);
  useAuthStore.getState().setSession(pair.user, pair.accessToken);
};

export const authService = {
  login: async (input: LoginFormValues) => {
    const pair = await apiClient({
      path: '/auth/login',
      method: 'POST',
      body: input,
      schema: tokenPairSchema,
      skipAuth: true,
    });
    persistSession(pair);
    return pair;
  },
  
  register: async (input: Omit<RegisterFormValues, 'confirmPassword'>) => {
    const pair = await apiClient({
      path: '/auth/register',
      method: 'POST',
      body: input,
      schema: tokenPairSchema,
      skipAuth: true,
    });
    persistSession(pair);
    return pair;
  },
  
  logout: async () => {
    const token = authStorage.getRefreshToken();
    try {
      if (token) {
        await apiClient({
          path: '/auth/logout',
          method: 'POST',
          body: { refreshToken: token },
          schema: z.any(),
          skipAuth: true,
        });
      }
    } finally {
      authStorage.clearRefreshToken();
      useAuthStore.getState().clearSession();
    }
  },
  
  me: async () => {
    return apiClient({
      path: '/auth/me',
      method: 'GET',
      schema: publicUserSchema,
    });
  },
};
