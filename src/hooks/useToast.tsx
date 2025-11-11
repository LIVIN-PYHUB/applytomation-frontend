import { useState, useCallback } from 'react';
import type { Toast, ToastType } from '../components/EnhancedToast';

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Safety check - ensure toasts is always an array
  const safeToasts = Array.isArray(toasts) ? toasts : [];

  const showToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration: number = 4000,
    action?: { label: string; onClick: () => void }
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      message,
      type,
      duration,
      action,
    };

    setToasts((prev) => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number, action?: { label: string; onClick: () => void }) => {
    return showToast(message, 'success', duration, action);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number, action?: { label: string; onClick: () => void }) => {
    return showToast(message, 'error', duration || 6000, action);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number, action?: { label: string; onClick: () => void }) => {
    return showToast(message, 'info', duration, action);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number, action?: { label: string; onClick: () => void }) => {
    return showToast(message, 'warning', duration, action);
  }, [showToast]);

  return {
    toasts: safeToasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning,
  };
}

