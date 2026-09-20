import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Error',
  message,
  onDismiss,
  className = '',
}) => {
  if (!message) return null;

  return (
    <div
      className={`rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-xs flex items-start justify-between ${className}`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <AlertCircle className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
        <div>
          {title && <h4 className="text-sm font-semibold text-rose-900">{title}</h4>}
          <p className="text-sm text-rose-700 mt-0.5">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-500 hover:text-rose-700 transition-colors p-1 rounded-md"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
