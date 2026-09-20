import type { ApiError } from '../types/api';

/**
 * Determines the API base URL.
 * In local development (`import.meta.env.DEV`), defaults to empty string to route requests
 * through the Vite dev server proxy (`/api`), resolving browser CORS errors without backend changes.
 */
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (!envUrl) return '';
  
  // In development, if configured to local backend directly, fallback to proxy to avoid CORS preflight errors
  if (import.meta.env.DEV && (envUrl.includes('localhost:8000') || envUrl.includes('127.0.0.1:8000'))) {
    return '';
  }
  return envUrl;
};

const BASE_URL = getBaseUrl();

/**
 * Token retriever callback for attaching JWT access token to requests.
 */
let getTokenCallback: (() => string | null) | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

/**
 * Configures global callbacks for API token retrieval and 401 unauthorized handling.
 */
export function configureApiClient(config: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  getTokenCallback = config.getToken;
  onUnauthorizedCallback = config.onUnauthorized;
}

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

/**
 * Core native `fetch` helper function.
 * Manages request headers, authentication tokens, JSON parsing, and HTTP error normalization.
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...customConfig } = options;

  // Build clean request URL without duplicate slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${BASE_URL}${cleanEndpoint}`;

  // Prepare standard headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Attach Authorization Bearer token if required
  if (requiresAuth && getTokenCallback) {
    const token = getTokenCallback();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(url, {
      ...customConfig,
      headers: requestHeaders,
    });

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    // Parse response body safely
    let responseData: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    // Handle non-OK HTTP status codes
    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;

      // Extract error message from FastAPI response body ({ detail: "..." })
      if (responseData && typeof responseData === 'object') {
        if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          // FastAPI Pydantic validation errors array
          errorMessage = responseData.detail
            .map((err: any) => err.msg || err.message || JSON.stringify(err))
            .join(', ');
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      } else if (typeof responseData === 'string' && responseData.length > 0) {
        errorMessage = responseData;
      }

      const error: ApiError = {
        message: errorMessage,
        statusCode: response.status,
        details: responseData,
      };

      throw error;
    }

    return responseData as T;
  } catch (err: any) {
    // Re-throw formatted ApiError if already constructed
    if (err && typeof err === 'object' && 'message' in err && 'statusCode' in err) {
      throw err;
    }

    // Catch network / offline / CORS errors
    const error: ApiError = {
      message: err?.message || 'Network request failed. Please verify backend server is running.',
    };
    throw error;
  }
}

/**
 * Standard HTTP Helper methods (GET, POST, PUT, DELETE)
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
