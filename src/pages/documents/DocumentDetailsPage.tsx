import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { DocumentItem, DocumentInfo } from '../../types/document';
import {
  getDocumentDetailsApi,
  getDocumentInfoApi,
  getDownloadUrlApi,
  processDocumentApi,
} from '../../services/document-service';
import { DocumentMetadataCard } from '../../components/documents/DocumentMetadataCard';
import { ExtractedInformationCard } from '../../components/documents/ExtractedInformationCard';
import { DocumentChat } from '../../components/chat/DocumentChat';
import { Button } from '../../components/ui/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ArrowLeft,
  Download,
  RefreshCw,
  RotateCw,
  Loader2,
  FileQuestion,
} from 'lucide-react';

export const DocumentDetailsPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  // Document state
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);

  // Status & loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Polling interval ref
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Fetches metadata details and extracted licence info for current document ID.
   */
  const fetchDocumentData = useCallback(
    async (showLoadingSpinner = true) => {
      if (!documentId) return;

      if (showLoadingSpinner) setIsLoading(true);
      else setIsRefreshing(true);

      setError(null);

      try {
        // Fetch metadata details
        const docDetails = await getDocumentDetailsApi(documentId);
        setDocument(docDetails);

        // If completed, fetch extracted licence info
        if (docDetails.status === 'COMPLETED') {
          try {
            const info = await getDocumentInfoApi(documentId);
            setDocumentInfo(info);
          } catch {
            // Extracted info record may not exist yet
            setDocumentInfo(null);
          }
        } else {
          setDocumentInfo(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load document details. Please verify document ID.');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [documentId]
  );

  /**
   * Initial data load on mount.
   */
  useEffect(() => {
    fetchDocumentData(true);
  }, [fetchDocumentData]);

  /**
   * Polling effect: If document is currently PENDING or PROCESSING, poll every 3 seconds.
   */
  useEffect(() => {
    if (document && ['PENDING', 'PROCESSING'].includes(document.status)) {
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(() => {
          fetchDocumentData(false);
        }, 3000);
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
  }, [document, fetchDocumentData]);

  /**
   * Downloads document file by generating pre-signed download URL.
   */
  const handleDownload = async () => {
    if (!documentId) return;

    setDownloadError(null);
    setIsDownloading(true);

    try {
      const response = await getDownloadUrlApi(documentId);
      if (response.download_url) {
        // Open signed download URL in new tab or trigger direct download
        window.open(response.download_url, '_blank', 'noopener,noreferrer');
      } else {
        throw new Error('Pre-signed download URL was not returned by server.');
      }
    } catch (err: any) {
      setDownloadError(err.message || 'Failed to generate download URL.');
    } finally {
      setIsDownloading(false);
    }
  };

  /**
   * Triggers OCR re-processing if processing previously failed.
   */
  const handleRetryProcessing = async () => {
    if (!documentId) return;

    setIsRetrying(true);
    setError(null);

    try {
      await processDocumentApi(documentId);
      // Immediately refresh document status
      await fetchDocumentData(false);
    } catch (err: any) {
      setError(err.message || 'Retry processing failed. Please try again later.');
    } finally {
      setIsRetrying(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading document details..." />;
  }

  if (error || !document) {
    return (
      <div className="space-y-6">
        <Link to="/documents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Documents
          </Button>
        </Link>

        <div className="bg-white rounded-xl border border-rose-200 p-12 text-center shadow-xs space-y-4">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <FileQuestion className="h-8 w-8" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">Document Error</h3>
            <p className="text-sm text-rose-700 mt-1">
              {error || 'Document not found or you do not have permission to view it.'}
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="md" onClick={() => navigate('/documents')}>
              Return to Documents List
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/documents">
            <Button variant="outline" size="sm" title="Return to My Documents">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-slate-900 truncate">
            {document.file_name}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="md"
            onClick={() => fetchDocumentData(false)}
            isLoading={isRefreshing}
            title="Refresh document status"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleDownload}
            isLoading={isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            Download File
          </Button>
        </div>
      </div>

      {downloadError && (
        <ErrorAlert
          title="Download Error"
          message={downloadError}
          onDismiss={() => setDownloadError(null)}
        />
      )}

      {/* Document Overview Metadata */}
      <DocumentMetadataCard document={document} />

      {/* Processing State Banners */}
      {['PENDING', 'PROCESSING'].includes(document.status) && (
        <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-6 text-blue-900 space-y-3">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-6 w-6 text-blue-600 animate-spin shrink-0" />
            <div>
              <h4 className="text-base font-semibold">Document Processing in Progress</h4>
              <p className="text-xs text-blue-700 mt-0.5">
                OCR text extraction and LLM driving licence structure recognition are currently running. Status refreshes automatically.
              </p>
            </div>
          </div>
        </div>
      )}

      {document.status === 'FAILED' && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h4 className="text-base font-bold">OCR & AI Processing Failed</h4>
            <p className="text-xs text-rose-700 mt-0.5">
              The system encountered an error processing this document. Please verify image clarity and click retry.
            </p>
          </div>
          <Button
            variant="danger"
            size="md"
            onClick={handleRetryProcessing}
            isLoading={isRetrying}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Retry Processing
          </Button>
        </div>
      )}

      {/* Extracted Information Section (Completed State) */}
      {document.status === 'COMPLETED' && (
        <ExtractedInformationCard
          documentId={document.document_id}
          info={documentInfo}
          onUpdateSuccess={(updatedInfo) => setDocumentInfo(updatedInfo)}
        />
      )}

      {/* AI RAG Question Answering Section */}
      <DocumentChat
        documentId={document.document_id}
        isCompleted={document.status === 'COMPLETED'}
      />
    </div>
  );
};
