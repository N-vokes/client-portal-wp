import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';

interface Toast {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: 'error' | 'success' | 'info') => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-notification animate-slideIn ${
            toast.type === 'error'
              ? 'bg-red-50 border border-red-200'
              : toast.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-sand border border-gold/30'
          } rounded-lg p-4 shadow-md max-w-sm`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg mt-0.5">
              {toast.type === 'error'
                ? '❌'
                : toast.type === 'success'
                ? '✅'
                : 'ℹ️'}
            </span>
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  toast.type === 'error'
                    ? 'text-red-800'
                    : toast.type === 'success'
                    ? 'text-green-800'
                    : 'text-charcoal'
                }`}
              >
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className={`text-lg hover:opacity-70 transition-opacity ${
                toast.type === 'error'
                  ? 'text-red-400'
                  : toast.type === 'success'
                  ? 'text-green-400'
                  : 'text-slate'
              }`}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
