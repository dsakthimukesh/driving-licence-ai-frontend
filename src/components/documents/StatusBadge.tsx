import React from 'react';
import type { DocumentStatus } from '../../types/document';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: DocumentStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const upperStatus = (status || '').toUpperCase() as DocumentStatus;

  switch (upperStatus) {
    case 'PENDING':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/60 ${className}`}
        >
          <Clock className="h-3 w-3 text-amber-500" />
          <span>Pending</span>
        </span>
      );

    case 'PROCESSING':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 ${className}`}
        >
          <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
          <span>Processing</span>
        </span>
      );

    case 'COMPLETED':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${className}`}
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
          <span>Completed</span>
        </span>
      );

    case 'FAILED':
      return (
        <span
          className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/60 ${className}`}
        >
          <XCircle className="h-3 w-3 text-rose-600" />
          <span>Failed</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 ${className}`}
        >
          <span>{status}</span>
        </span>
      );
  }
};
