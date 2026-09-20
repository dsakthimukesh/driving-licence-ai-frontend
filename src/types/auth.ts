/**
 * User profile matching FastAPI `UserInfo` / `UserMeResponse` schema.
 */
export interface User {
  user_id: string;
  name: string;
  email: string;
}

/**
 * Payload required for user registration (`POST /api/v1/auth/register`).
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

/**
 * Response payload returned after registration (`POST /api/v1/auth/register`).
 */
export interface RegisterResponse {
  user_id: string;
  name: string;
  email: string;
  message: string;
}

/**
 * Payload required for user login (`POST /api/v1/auth/login`).
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Response payload returned upon login (`POST /api/v1/auth/login`).
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

/**
 * Authentication Context state shape.
 */
export interface AuthState {
  accessToken: string | null;
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
