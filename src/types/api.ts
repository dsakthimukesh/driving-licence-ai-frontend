/**
 * Standard API error structure returned by FastAPI backend or thrown by API client.
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

/**
 * Generic API response wrapper for typed standard payloads.
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}
