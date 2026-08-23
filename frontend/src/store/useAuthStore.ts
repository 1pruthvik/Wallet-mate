import { create } from 'zustand';
import type { User, OtpSession, SignupData } from '../types/auth';
import authService from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSession: OtpSession | null;
  
  // Actions
  loginWithEmail: (email: string, password?: string, rememberMe?: boolean) => Promise<User>;
  signup: (data: SignupData) => Promise<User>;
  sendPhoneOtp: (phone: string, countryCode?: string, purpose?: 'login' | 'signup' | 'password-reset', tempUserData?: Partial<SignupData>) => Promise<OtpSession>;
  verifyPhoneOtp: (phone: string, otp: string, purpose?: 'login' | 'signup' | 'password-reset', tempUserData?: Partial<SignupData>) => Promise<User | null>;
  signInWithGoogle: () => Promise<User>;
  signInWithPasskey: () => Promise<User>;
  signInWithSSO: (domain: string) => Promise<User>;
  logout: () => void;
  clearError: () => void;
  setOtpSession: (session: OtpSession | null) => void;
  updateUser: (partial: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialUser = authService.getCurrentUser();
  const initialToken = authService.getToken();

  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: Boolean(initialUser && initialToken),
    isLoading: false,
    error: null,
    otpSession: null,

    loginWithEmail: async (email, password, rememberMe = true) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.loginWithEmail(email, password, rememberMe);
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return response.user;
      } catch (err: any) {
        const message = err?.message || 'Unable to sign in. Please try again.';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    signup: async (data) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.signup(data);
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return response.user;
      } catch (err: any) {
        const message = err?.message || 'Unable to create account. Please try again.';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    sendPhoneOtp: async (phone, countryCode = '+91', purpose = 'login', tempUserData) => {
      set({ isLoading: true, error: null });
      try {
        const session = await authService.sendPhoneOtp(phone, countryCode, purpose, tempUserData);
        set({
          otpSession: session,
          isLoading: false,
          error: null,
        });
        return session;
      } catch (err: any) {
        const message = err?.message || 'Failed to send OTP. Please try again.';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    verifyPhoneOtp: async (phone, otp, purpose = 'login', tempUserData) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.verifyPhoneOtp(phone, otp, purpose, tempUserData);
        if ('user' in response) {
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            otpSession: null,
            isLoading: false,
            error: null,
          });
          return response.user;
        }
        set({ isLoading: false, error: null });
        return null;
      } catch (err: any) {
        const message = err?.message || 'Invalid verification code. Please try again.';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    signInWithGoogle: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.signInWithGoogle();
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return response.user;
      } catch (err: any) {
        const message = err?.message || 'Google sign-in failed. Please try again.';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    signInWithPasskey: async () => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.signInWithPasskey();
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return response.user;
      } catch (err: any) {
        const message = err?.message || 'Passkey authentication was cancelled or failed.';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    signInWithSSO: async (domain) => {
      set({ isLoading: true, error: null });
      try {
        const response = await authService.signInWithSSO(domain);
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        return response.user;
      } catch (err: any) {
        const message = err?.message || 'SSO authentication failed. Please try again.';
        set({ error: message, isLoading: false });
        throw err;
      }
    },

    logout: () => {
      authService.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        otpSession: null,
      });
    },

    clearError: () => set({ error: null }),
    setOtpSession: (session) => set({ otpSession: session }),
    updateUser: (partial) => {
      const current = get().user;
      if (current) {
        set({ user: { ...current, ...partial } });
      }
    },
  };
});
