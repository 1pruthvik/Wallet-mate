import { create } from 'zustand';
import type { User, SignupData } from '../types/auth';
import authService from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  loginWithEmail: (email: string, password?: string, rememberMe?: boolean) => Promise<User>;
  signup: (data: SignupData) => Promise<User>;
  logout: () => void;
  clearError: () => void;
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

    logout: () => {
      authService.logout();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    },

    clearError: () => set({ error: null }),
    updateUser: (partial) => {
      const current = get().user;
      if (current) {
        set({ user: { ...current, ...partial } });
      }
    },
  };
});
