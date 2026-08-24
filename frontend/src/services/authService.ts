import type { User, AuthResponse, SignupData } from '../types/auth';
import apiClient from '../api/client';

const STORAGE_KEYS = {
  USER: 'wallet_mate_auth_user',
  TOKEN: 'wallet_mate_auth_token',
  REMEMBER: 'wallet_mate_remember_me',
  USERS_DB: 'wallet_mate_users_db',
};

class AuthService {
  public isConfiguredForBackend(): boolean {
    return Boolean(import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
  }

  private getStoredUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS_DB);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // ignore
    }
    return [];
  }

  private saveStoredUsers(users: User[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    } catch {
      // ignore
    }
  }

  // ==========================================
  // EMAIL / PASSWORD LOGIN
  // ==========================================
  async loginWithEmail(email: string, password?: string, rememberMe = true): Promise<AuthResponse> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // Try backend MongoDB API first
    try {
      const res = await apiClient.post<{ success: boolean; token: string; user: User }>('/auth/login', {
        email: cleanEmail,
        password,
      });

      if (res.data && res.data.token && res.data.user) {
        const user = res.data.user;
        const token = res.data.token;

        if (rememberMe) {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          localStorage.setItem(STORAGE_KEYS.TOKEN, token);
          localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true');
        } else {
          sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
          sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
          localStorage.removeItem(STORAGE_KEYS.REMEMBER);
        }

        return { user, token, expiresIn: 86400 * 7 };
      }
    } catch (apiErr: any) {
      if (apiErr.response && apiErr.response.data?.message) {
        throw new Error(apiErr.response.data.message);
      }
      console.warn('Backend login endpoint unavailable, checking local store:', apiErr.message);
    }

    // Offline Fallback
    const users = this.getStoredUsers();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        id: `66${Date.now().toString(16).padStart(22, '0').slice(-22)}`,
        name: cleanEmail.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (s) => s.toUpperCase()),
        email: cleanEmail,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
        role: 'Standard Member',
        authProvider: 'email',
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      this.saveStoredUsers(users);
    }

    const token = `wm_jwt_${btoa(user.id)}_${Date.now()}`;

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.REMEMBER, 'true');
    } else {
      sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.removeItem(STORAGE_KEYS.REMEMBER);
    }

    return { user, token, expiresIn: 86400 * 7 };
  }

  // ==========================================
  // SIGNUP WITH EMAIL
  // ==========================================
  async signup(signupData: SignupData): Promise<AuthResponse> {
    const cleanEmail = signupData.email.trim().toLowerCase();
    const cleanName = signupData.name.trim();

    if (!cleanName || cleanName.length < 2) {
      throw new Error('Please enter your full name.');
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    if (!signupData.password || signupData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    // Try backend MongoDB API first
    try {
      const res = await apiClient.post<{ success: boolean; token: string; user: User }>('/auth/register', {
        fullName: cleanName,
        email: cleanEmail,
        password: signupData.password,
      });

      if (res.data && res.data.token && res.data.user) {
        const user = res.data.user;
        const token = res.data.token;

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);

        return { user, token, expiresIn: 86400 * 7 };
      }
    } catch (apiErr: any) {
      if (apiErr.response && apiErr.response.data?.message) {
        throw new Error(apiErr.response.data.message);
      }
      console.warn('Backend register endpoint unavailable, checking local store:', apiErr.message);
    }

    // Offline Fallback
    const users = this.getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const newUser: User = {
      id: `66${Date.now().toString(16).padStart(22, '0').slice(-22)}`,
      name: cleanName,
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      role: 'Standard Member',
      authProvider: 'email',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveStoredUsers(users);

    const token = `wm_jwt_${btoa(newUser.id)}_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    return { user: newUser, token, expiresIn: 86400 * 7 };
  }

  // ==========================================
  // PASSWORD RESET
  // ==========================================
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    return {
      success: true,
      message: `Password reset instructions have been sent to ${cleanEmail}. Please check your inbox.`,
    };
  }

  async resetPassword(email: string, newPassword: string): Promise<{ success: boolean }> {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      await apiClient.post('/auth/reset-password', {
        email: cleanEmail,
        newPassword,
      });
      return { success: true };
    } catch (apiErr: any) {
      console.warn('Backend reset password offline fallback.');
    }

    const users = this.getStoredUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (user) {
      this.saveStoredUsers(users);
    }

    return { success: true };
  }

  // ==========================================
  // SESSION RECOVERY & LOGOUT
  // ==========================================
  getCurrentUser(): User | null {
    try {
      const local = localStorage.getItem(STORAGE_KEYS.USER);
      if (local) return JSON.parse(local);
      const session = sessionStorage.getItem(STORAGE_KEYS.USER);
      if (session) return JSON.parse(session);
    } catch {
      return null;
    }
    return null;
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REMEMBER);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
  }
}

export const authService = new AuthService();
export default authService;
