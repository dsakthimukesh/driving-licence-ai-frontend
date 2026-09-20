import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DocumentItem } from '../../types/document';
import { getDocumentsApi, deleteDocumentApi } from '../../services/document-service';
import { StatusBadge } from '../../components/documents/StatusBadge';
import { DocumentUpload } from '../../components/documents/DocumentUpload';
import { Button } from '../../components/ui/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  Eye,
  Search,
  FileCheck,
  Calendar,
  Layers,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();

  // Documents list state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Polling ref to safely manage interval cleanup
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Fetches document list from `GET /api/v1/documents`.
   */
  const fetchDocuments = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setIsLoading(true);
    else setIsRefreshing(true);

    setError(null);

    try {
      const response = await getDocumentsApi(1, 50);
      setDocuments(response.items || []);
      setTotalItems(response.total_items || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch documents. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Initial data load on mount.
   */
  useEffect(() => {
    fetchDocuments(true);
  }, [fetchDocuments]);

  /**
   * Polling effect: Automatically refreshes document status every 4s
   * if any document is currently in 'PENDING' or 'PROCESSING' state.
   */
  useEffect(() => {
    const hasActiveProcessing = documents.some((doc) =>
      ['PENDING', 'PROCESSING'].includes(doc.status?.toUpperCase())
    );

    if (hasActiveProcessing) {
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(() => {
          fetchDocuments(false);
        }, 4000);
      }
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [documents, fetchDocuments]);

  /**
   * Document deletion handler.
   */
  const handleDeleteDocument = async (documentId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(documentId);
    try {
      await deleteDocumentApi(documentId);
      // Remove from local list state
      setDocuments((prev) => prev.filter((doc) => doc.document_id !== documentId));
      setTotalItems((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      alert(`Failed to delete document: ${err.message || 'Unknown error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Client-side filtered list based on search query.
   */
  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      doc.file_name.toLowerCase().includes(query) ||
      doc.document_id.toLowerCase().includes(query) ||
      doc.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Documents</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage driving licence uploads, monitor OCR status, and view details.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => fetchDocuments(false)}
            isLoading={isRefreshing}
            title="Refresh document list"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setShowUploadModal((prev) => !prev)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Inline Upload Drawer / Panel */}
      {showUploadModal && (
        <div className="transition-all duration-200">
          <DocumentUpload
            onUploadSuccess={() => {
              setShowUploadModal(false);
              fetchDocuments(false);
            }}
            onCancel={() => setShowUploadModal(false)}
          />
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <ErrorAlert
          title="Error Loading Documents"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-3">
        <Search className="h-5 w-5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by filename, document ID, or status..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded-md"
          >
            Clear
          </button>
        )}
      </div>

      {/* Main Documents Table / Loading State */}
      {isLoading ? (
        <LoadingSpinner message="Fetching documents library..." />
      ) : filteredDocuments.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-slate-900">
              {searchQuery ? 'No matching documents found' : 'No documents uploaded yet'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery
                ? 'Try adjusting your search query.'
                : 'Upload a driving licence document (PDF, PNG, JPG) to start OCR and AI processing.'}
            </p>
          </div>
          {!searchQuery && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setShowUploadModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Your First Document
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Table Layout */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Document Name</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created Date</th>
                  <th className="py-3.5 px-6">Document ID</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.document_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900 flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <FileCheck className="h-5 w-5" />
                      </div>
                      <span className="truncate max-w-xs">{doc.file_name}</span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-xs whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {new Date(doc.created_date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono text-xs truncate max-w-[140px]">
                      {doc.document_id}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/documents/${doc.document_id}`)}
                        title="View document details"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
                      </Button>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteDocument(doc.document_id, doc.file_name)}
                        isLoading={deletingId === doc.document_id}
                        title="Delete document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 flex justify-between items-center">
            <span>
              Showing {filteredDocuments.length} of {totalItems} total documents
            </span>
            <div className="flex items-center space-x-1">
              <Layers className="h-3.5 w-3.5" />
              <span>Page 1</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
