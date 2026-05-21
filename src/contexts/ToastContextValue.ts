import { createContext } from 'react';

export interface Toast {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: 'error' | 'success' | 'info') => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);
