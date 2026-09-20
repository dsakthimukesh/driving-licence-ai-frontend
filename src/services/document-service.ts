import { api } from './api';
import type { ApiError } from '../types/api';
import type {
  DocumentUploadUrlRequest,
  DocumentUploadUrlResponse,
  DocumentConfirmUploadResponse,
  DocumentListResponse,
  DocumentDetailResponse,
  DocumentDownloadUrlResponse,
  DocumentInfo,
  DocumentInfoUpdateRequest,
} from '../types/document';

/**
 * Generates a pre-signed upload URL for direct storage upload (`POST /api/v1/documents/upload-url`).
 */
export async function generateUploadUrlApi(
  data: DocumentUploadUrlRequest
): Promise<DocumentUploadUrlResponse> {
  return api.post<DocumentUploadUrlResponse>('/api/v1/documents/upload-url', data, {
    requiresAuth: true,
  });
}

/**
 * Uploads a file directly to Supabase Storage using the generated pre-signed URL.
 * Uses native `fetch` with HTTP PUT method and file MIME type header.
 * Excludes JWT Authorization Bearer header to avoid signed URL signature mismatch.
 */
export async function uploadFileToStorageApi(
  uploadUrl: string,
  file: File
): Promise<void> {
  try {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const error: ApiError = {
        message: `Storage upload failed (${response.status}). ${errorText || 'Please check your connection and try again.'}`,
        statusCode: response.status,
      };
      throw error;
    }
  } catch (err: any) {
    if (err && typeof err === 'object' && 'message' in err && 'statusCode' in err) {
      throw err;
    }
    const error: ApiError = {
      message: err?.message || 'Direct storage file upload encountered a network error.',
    };
    throw error;
  }
}

/**
 * Confirms that the file upload completed successfully in storage (`POST /api/v1/documents/{id}/confirm-upload`).
 */
export async function confirmUploadApi(
  documentId: string
): Promise<DocumentConfirmUploadResponse> {
  return api.post<DocumentConfirmUploadResponse>(
    `/api/v1/documents/${documentId}/confirm-upload`,
    {},
    { requiresAuth: true }
  );
}

/**
 * Triggers end-to-end OCR and AI processing on the document (`POST /api/v1/documents/{id}/process`).
 */
export async function processDocumentApi(documentId: string): Promise<unknown> {
  return api.post<unknown>(`/api/v1/documents/${documentId}/process`, {}, {
    requiresAuth: true,
  });
}

/**
 * Retrieves a paginated list of user documents (`GET /api/v1/documents`).
 */
export async function getDocumentsApi(
  page: number = 1,
  pageSize: number = 10,
  statusFilter?: string
): Promise<DocumentListResponse> {
  let endpoint = `/api/v1/documents?page=${page}&page_size=${pageSize}`;
  if (statusFilter) {
    endpoint += `&status=${encodeURIComponent(statusFilter)}`;
  }
  return api.get<DocumentListResponse>(endpoint, { requiresAuth: true });
}

/**
 * Fetches metadata details for a specific document (`GET /api/v1/documents/{id}`).
 */
export async function getDocumentDetailsApi(
  documentId: string
): Promise<DocumentDetailResponse> {
  return api.get<DocumentDetailResponse>(`/api/v1/documents/${documentId}`, {
    requiresAuth: true,
  });
}

/**
 * Fetches structured LLM-extracted driving licence information (`GET /api/v1/documents/{id}/info`).
 */
export async function getDocumentInfoApi(
  documentId: string
): Promise<DocumentInfo> {
  return api.get<DocumentInfo>(`/api/v1/documents/${documentId}/info`, {
    requiresAuth: true,
  });
}

/**
 * Updates structured driving licence information (`PUT /api/v1/documents/{id}/info`).
 * Backend records the logged-in user's email ID in `last_modified_by`.
 */
export async function updateDocumentInfoApi(
  documentId: string,
  data: DocumentInfoUpdateRequest
): Promise<DocumentInfo> {
  return api.put<DocumentInfo>(`/api/v1/documents/${documentId}/info`, data, {
    requiresAuth: true,
  });
}

/**
 * Generates a pre-signed temporary download URL (`GET /api/v1/documents/{id}/download-url`).
 */
export async function getDownloadUrlApi(
  documentId: string
): Promise<DocumentDownloadUrlResponse> {
  return api.get<DocumentDownloadUrlResponse>(
    `/api/v1/documents/${documentId}/download-url`,
    { requiresAuth: true }
  );
}

/**
 * Deletes a document record and associated storage file (`DELETE /api/v1/documents/{id}`).
 */
export async function deleteDocumentApi(documentId: string): Promise<void> {
  return api.delete<void>(`/api/v1/documents/${documentId}`, {
    requiresAuth: true,
  });
}
