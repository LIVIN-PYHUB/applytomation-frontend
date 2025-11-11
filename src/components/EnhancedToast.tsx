import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface EnhancedToastProps {
  toast: Toast;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export default function EnhancedToast({ toast, onClose, position = 'top-right' }: EnhancedToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(toast.id);
    }, 300); // Animation duration
  };

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.duration, toast.id]);

  const getIcon = () => {
    const iconClass = "w-5 h-5";
    switch (toast.type) {
      case 'success':
        return <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center border border-green-200"><CheckCircle className={`${iconClass} text-green-700`} /></div>;
      case 'error':
        return <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center border border-red-200"><XCircle className={`${iconClass} text-red-700`} /></div>;
      case 'warning':
        return <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center border border-yellow-200"><AlertTriangle className={`${iconClass} text-yellow-700`} /></div>;
      case 'info':
        return <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center border border-blue-200"><Info className={`${iconClass} text-blue-700`} /></div>;
      default:
        return <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200"><Info className={`${iconClass} text-gray-700`} /></div>;
    }
  };

  const getStyles = () => {
    const baseStyles = 'flex items-start gap-4 px-6 py-5 rounded-2xl shadow-xl border min-w-[340px] max-w-[480px] transform transition-all duration-300';
    
    switch (toast.type) {
      case 'success':
        return `${baseStyles} bg-green-50/95 border-green-200 text-gray-900 shadow-green-100`;
      case 'error':
        return `${baseStyles} bg-red-50/95 border-red-200 text-gray-900 shadow-red-100`;
      case 'warning':
        return `${baseStyles} bg-yellow-50/95 border-yellow-200 text-gray-900 shadow-yellow-100`;
      case 'info':
        return `${baseStyles} bg-blue-50/95 border-blue-200 text-gray-900 shadow-blue-100`;
      default:
        return `${baseStyles} bg-gray-50/95 border-gray-200 text-gray-900 shadow-gray-100`;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div
      className={`relative ${
        isExiting
          ? 'animate-slide-out opacity-0 scale-95'
          : 'opacity-100 scale-100'
      }`}
    >
      <div className={getStyles()}>
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-relaxed break-words text-gray-800">{toast.message}</p>
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick();
                handleClose();
              }}
              className="mt-3 text-xs font-semibold text-blue-600 hover:text-blue-700 underline hover:no-underline transition-colors"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg p-1.5 transition-colors ml-2"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Toast Container for managing multiple toasts
interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
  maxToasts?: number;
}

export function ToastContainer({ toasts = [], onClose, position = 'top-right', maxToasts = 5 }: ToastContainerProps) {
  if (!toasts || toasts.length === 0) {
    return null;
  }

  const visibleToasts = toasts.slice(0, maxToasts);

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  try {
    return (
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <div className={`absolute ${getPositionClasses()} flex flex-col gap-5 pointer-events-auto`}>
          {visibleToasts.map((toast, index) => {
            if (!toast || !toast.id) return null;
            return (
              <div
                key={toast.id}
                className="relative animate-slide-in"
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                <EnhancedToast toast={toast} onClose={onClose} position={position} />
              </div>
            );
          })}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering ToastContainer:', error);
    return null;
  }
}

