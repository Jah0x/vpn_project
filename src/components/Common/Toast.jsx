import React from 'react';
import { X } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

const typeStyles = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-gray-700',
};

const Toast = () => {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center text-white px-4 py-3 rounded shadow-lg ${
            typeStyles[toast.type] || typeStyles.info
          }`}
        >
          <span className="flex-1 mr-4">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
