export type AuthProviderType = 'email' | 'phone' | 'google' | 'passkey' | 'sso';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: string;
  authProvider: AuthProviderType;
  isPhoneVerified: boolean;
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
  phone?: string;
}

export interface CountryCodeInfo {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
  format: string;
  sample: string;
}

export type AuthViewMode =
  | 'login'
  | 'signup'
  | 'phone-login'
  | 'phone-signup'
  | 'phone-verify'
  | 'signup-phone-verify'
  | 'forgot-password'
  | 'forgot-phone-verify'
  | 'reset-new-password';

export interface OtpSession {
  phone: string;
  countryCode: string;
  purpose: 'login' | 'signup' | 'password-reset';
  maskedPhone: string;
  expiresAt: number;
  tempUserData?: Partial<SignupData>;
}

export const AUTH_ROLES = ['Standard Member', 'Premium Member', 'Pro Member'] as const;
