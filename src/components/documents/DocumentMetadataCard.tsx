import React from 'react';
import type { DocumentItem } from '../../types/document';
import { StatusBadge } from './StatusBadge';
import { FileText, Calendar } from 'lucide-react';

interface DocumentMetadataCardProps {
  document: DocumentItem;
}

export const DocumentMetadataCard: React.FC<DocumentMetadataCardProps> = ({ document }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{document.file_name}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Uploaded on {formatDate(document.created_date)}</span>
            </p>
          </div>
        </div>
        <StatusBadge status={document.status} />
      </div>
    </div>
  );
};
