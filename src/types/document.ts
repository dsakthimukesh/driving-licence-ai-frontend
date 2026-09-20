/**
 * Allowed document workflow statuses.
 */
export type DocumentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

/**
 * Metadata model for an individual document matching backend schemas.
 */
export interface DocumentItem {
  document_id: string;
  file_name: string;
  bucket_name: string;
  storage_path: string;
  status: DocumentStatus;
  created_date: string;
  last_modified_date: string;
}

/**
 * Structured Driving Licence Information schema matching FastAPI `DocumentInfoResponse`.
 */
export interface DocumentInfo {
  document_info_id: string;
  document_id: string;
  licence_number: string | null;
  full_name: string | null;
  parent_name: string | null;
  date_of_birth: string | null;
  blood_group: string | null;
  address: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  vehicle_authorization: string | null;
  issuing_authority: string | null;
  restrictions: string | null;
  other_information: string | null;
  created_date: string;
  last_modified_by?: string | null;
  last_modified_date: string;
}

/**
 * Payload required to update extracted driving licence information (`PUT /api/v1/documents/{id}/info`).
 */
export interface DocumentInfoUpdateRequest {
  licence_number?: string | null;
  full_name?: string | null;
  parent_name?: string | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  address?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  vehicle_authorization?: string | null;
  issuing_authority?: string | null;
  restrictions?: string | null;
  other_information?: string | null;
}

/**
 * Request payload schema for POST /api/v1/documents/upload-url.
 */
export interface DocumentUploadUrlRequest {
  file_name: string;
  mime_type: string;
  file_size_bytes: number;
}

/**
 * Response payload schema for POST /api/v1/documents/upload-url.
 */
export interface DocumentUploadUrlResponse {
  document_id: string;
  bucket_name: string;
  storage_path: string;
  upload_url: string;
  status: DocumentStatus;
  expires_in: number;
  message: string;
}

/**
 * Response payload schema for POST /api/v1/documents/{document_id}/confirm-upload.
 */
export interface DocumentConfirmUploadResponse {
  document_id: string;
  status: DocumentStatus;
  message: string;
}

/**
 * Paginated response schema for GET /api/v1/documents.
 */
export interface DocumentListResponse {
  items: DocumentItem[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

/**
 * Response payload schema for GET /api/v1/documents/{document_id}.
 */
export type DocumentDetailResponse = DocumentItem;

/**
 * Response payload schema for GET /api/v1/documents/{document_id}/download-url.
 */
export interface DocumentDownloadUrlResponse {
  document_id: string;
  file_name: string;
  download_url: string;
  expires_in: number;
}

/**
 * Constants for file validation
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
