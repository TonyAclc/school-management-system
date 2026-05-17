import { create } from 'zustand';

export type RoleName = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'STAFF';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: RoleName[];
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;
  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearSession: () => void;
  setStatus: (status: AuthStatus) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  status: 'loading',
  user: null,
  accessToken: null,
  setSession: (user, accessToken) => set({ status: 'authenticated', user, accessToken }),
  setAccessToken: accessToken => set({ accessToken }),
  clearSession: () => set({ status: 'unauthenticated', user: null, accessToken: null }),
  setStatus: status => set({ status }),
}));
