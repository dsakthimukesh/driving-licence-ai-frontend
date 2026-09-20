import React from 'react';
import type { DocumentItem } from '../../types/document';
import { StatusBadge } from './StatusBadge';
import { FileText, Calendar, HardDrive, Folder, Key } from 'lucide-react';

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
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">{document.file_name}</h3>
            <p className="text-xs text-slate-500">Document Overview & Storage Metadata</p>
          </div>
        </div>
        <StatusBadge status={document.status} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> Created Date
          </span>
          <span className="text-slate-800 font-semibold mt-1 block">
            {formatDate(document.created_date)}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <HardDrive className="h-3.5 w-3.5" /> Storage Bucket
          </span>
          <span className="text-slate-800 font-semibold mt-1 block truncate">
            {document.bucket_name || 'documents'}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Folder className="h-3.5 w-3.5" /> Object Storage Path
          </span>
          <span className="text-slate-800 font-mono text-[11px] mt-1 block truncate" title={document.storage_path}>
            {document.storage_path}
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Key className="h-3.5 w-3.5" /> Document UUID
          </span>
          <span className="text-slate-800 font-mono text-[11px] mt-1 block truncate" title={document.document_id}>
            {document.document_id}
          </span>
        </div>
      </div>
    </div>
  );
};
