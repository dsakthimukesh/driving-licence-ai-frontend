import React, { useState, useRef } from 'react';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../../types/document';
import {
  generateUploadUrlApi,
  uploadFileToStorageApi,
  confirmUploadApi,
  processDocumentApi,
} from '../../services/document-service';
import { Button } from '../ui/Button';
import { ErrorAlert } from '../common/ErrorAlert';
import {
  FileUp,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  X,
} from 'lucide-react';

export type UploadStage =
  | 'IDLE'
  | 'PREPARING'
  | 'UPLOADING'
  | 'CONFIRMING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

interface DocumentUploadProps {
  onUploadSuccess?: (documentId: string) => void;
  onCancel?: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadSuccess,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Flow State
  const [stage, setStage] = useState<UploadStage>('IDLE');
  const [stageMessage, setStageMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Formats raw byte size into human readable KB / MB format.
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  /**
   * Client-side file validation (MIME type, extension, size).
   */
  const validateFile = (file: File): string | null => {
    if (!file) return 'No file selected.';

    // Check size limit (10MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File size exceeds the 10 MB limit (${formatFileSize(file.size)}). Please select a smaller file.`;
    }

    // Check MIME type or file extension
    const mime = file.type.toLowerCase();
    const ext = file.name.split('.').pop()?.toLowerCase();
    const isAllowedMime = ALLOWED_MIME_TYPES.includes(mime);
    const isAllowedExt = ['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '');

    if (!isAllowedMime && !isAllowedExt) {
      return 'Unsupported file format. Allowed formats: PDF, JPG, JPEG, and PNG.';
    }

    return null;
  };

  /**
   * File selection handler from input or drag-and-drop.
   */
  const handleFileSelect = (file: File) => {
    setErrorMessage(null);
    const validationError = validateFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setStage('IDLE');
  };

  /**
   * Handles file input change event.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  /**
   * Drag & Drop event handlers.
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  /**
   * Clears selected file and resets state.
   */
  const handleReset = () => {
    setSelectedFile(null);
    setStage('IDLE');
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Executes the multi-stage document upload & processing pipeline.
   */
  const startUploadPipeline = async () => {
    if (!selectedFile) return;

    setErrorMessage(null);
    let docId: string | null = null;

    try {
      // Stage 1: Generate pre-signed upload URL
      setStage('PREPARING');
      setStageMessage('Requesting pre-signed upload URL from backend...');
      
      const uploadUrlResponse = await generateUploadUrlApi({
        file_name: selectedFile.name,
        mime_type: selectedFile.type || 'application/octet-stream',
        file_size_bytes: selectedFile.size,
      });

      docId = uploadUrlResponse.document_id;

      // Stage 2: Direct upload to Supabase Storage using pre-signed URL
      setStage('UPLOADING');
      setStageMessage('Uploading document directly to storage...');
      await uploadFileToStorageApi(uploadUrlResponse.upload_url, selectedFile);

      // Stage 3: Confirm upload with FastAPI backend
      setStage('CONFIRMING');
      setStageMessage('Verifying document upload in storage...');
      await confirmUploadApi(docId);

      // Stage 4: Trigger OCR & AI processing
      setStage('PROCESSING');
      setStageMessage('Processing document with OCR & AI extraction...');
      await processDocumentApi(docId);

      // Stage 5: Completed successfully
      setStage('COMPLETED');
      setStageMessage('Document successfully processed!');

      if (onUploadSuccess) {
        onUploadSuccess(docId);
      }
    } catch (err: any) {
      setStage('FAILED');
      setErrorMessage(err.message || 'An unexpected error occurred during document upload.');
    }
  };

  const isUploading = ['PREPARING', 'UPLOADING', 'CONFIRMING', 'PROCESSING'].includes(stage);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileUp className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">Upload Driving Licence Document</h3>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {errorMessage && (
        <ErrorAlert
          title="Upload Failed"
          message={errorMessage}
          onDismiss={() => setErrorMessage(null)}
        />
      )}

      {/* Stage: COMPLETED */}
      {stage === 'COMPLETED' ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-emerald-900">Upload & Processing Complete!</h4>
            <p className="text-xs text-emerald-700 mt-1">
              Your document <span className="font-semibold">{selectedFile?.name}</span> has been uploaded and processed.
            </p>
          </div>
          <div className="flex justify-center space-x-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Upload Another Document
            </Button>
          </div>
        </div>
      ) : isUploading ? (
        /* Stage: Active Uploading & Processing Progress */
        <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="relative h-9 w-9 shrink-0">
              <div className="absolute inset-0 rounded-full border-2 border-blue-200"></div>
              <div className="absolute inset-0 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 capitalize">
                {stage.toLowerCase()}...
              </h4>
              <p className="text-xs text-blue-700">{stageMessage}</p>
            </div>
          </div>

          {/* Progress Bar Indicator */}
          <div className="w-full bg-blue-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width:
                  stage === 'PREPARING'
                    ? '20%'
                    : stage === 'UPLOADING'
                    ? '55%'
                    : stage === 'CONFIRMING'
                    ? '80%'
                    : '95%',
              }}
            ></div>
          </div>
        </div>
      ) : (
        /* Stage: IDLE or FAILED File Dropzone */
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
            onChange={handleInputChange}
            className="hidden"
            id="document-file-input"
          />

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors duration-150 ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/60'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <div className="mx-auto h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <FileUp className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click to browse or drag & drop driving licence file
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF, PNG, JPG, JPEG (Maximum file size: 10 MB)
              </p>
            </div>
          ) : (
            /* File Preview Details */
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3 truncate">
                <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  {selectedFile.type.includes('pdf') ? (
                    <FileText className="h-5 w-5" />
                  ) : (
                    <ImageIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Document'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors ml-2"
                title="Remove selected file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            {stage === 'FAILED' && (
              <Button variant="outline" size="md" onClick={startUploadPipeline}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Upload
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              disabled={!selectedFile || isUploading}
              onClick={startUploadPipeline}
              isLoading={isUploading}
            >
              <FileUp className="h-4 w-4 mr-2" />
              Upload & Process
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
