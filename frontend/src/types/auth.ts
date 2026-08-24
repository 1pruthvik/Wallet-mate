export type AuthProviderType = 'email';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  authProvider: AuthProviderType;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  expiresIn?: number;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  rememberMe?: boolean;
}

export interface SignupData {
  name: string;
  email: string;
  password?: string;
}

export type AuthViewMode =
  | 'login'
  | 'signup'
  | 'forgot-password';

export const AUTH_ROLES = ['Standard Member', 'Premium Member', 'Pro Member'] as const;
