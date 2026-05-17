import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  push: (toast: Omit<ToastMessage, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
  },
  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (message: string, duration?: number) => useToastStore.getState().push({ variant: 'success', message, duration }),
  error:   (message: string, duration?: number) => useToastStore.getState().push({ variant: 'error',   message, duration }),
  info:    (message: string, duration?: number) => useToastStore.getState().push({ variant: 'info',    message, duration }),
  warning: (message: string, duration?: number) => useToastStore.getState().push({ variant: 'warning', message, duration }),
};
