import { api } from './api';
import type {
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse,
  User,
} from '../types/auth';

/**
 * Service module isolating all Backend Authentication HTTP calls.
 */

/**
 * Registers a new user account against `POST /api/v1/auth/register`.
 */
export async function registerApi(data: RegisterData): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/api/v1/auth/register', data, {
    requiresAuth: false,
  });
}

/**
 * Authenticates user credentials against `POST /api/v1/auth/login`.
 */
export async function loginApi(credentials: LoginCredentials): Promise<LoginResponse> {
  return api.post<LoginResponse>('/api/v1/auth/login', credentials, {
    requiresAuth: false,
  });
}

/**
 * Retrieves authenticated user profile from `GET /api/v1/auth/me`.
 */
export async function getCurrentUserApi(): Promise<User> {
  return api.get<User>('/api/v1/auth/me', {
    requiresAuth: true,
  });
}
