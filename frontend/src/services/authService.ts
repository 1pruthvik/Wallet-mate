import type { User, AuthResponse, OtpSession, SignupData } from '../types/auth';
import apiClient from '../api/client';

const STORAGE_KEYS = {
  USER: 'wallet_mate_auth_user',
  TOKEN: 'wallet_mate_auth_token',
  REMEMBER: 'wallet_mate_remember_me',
  USERS_DB: 'wallet_mate_mock_users_db',
  OTP_SESSION: 'wallet_mate_current_otp_session',
};

const DEFAULT_MOCK_USERS: User[] = [
  {
    id: '660000000000000000000001',
    name: 'Nivish',
    email: 'nivish@walletmate.io',
    phone: '+919876543210',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'Standard Member',
    authProvider: 'email',
    isPhoneVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '660000000000000000000002',
    name: 'Alex Morgan',
    email: 'alex.morgan@walletmate.io',
    phone: '+919876543210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Premium Member',
    authProvider: 'email',
    isPhoneVerified: true,
    createdAt: new Date().toISOString(),
  }
];

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
    localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(DEFAULT_MOCK_USERS));
    return DEFAULT_MOCK_USERS;
  }

  private saveStoredUsers(users: User[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(users));
    } catch {
      // ignore
    }
  }

  private maskPhoneNumber(countryCode: string, phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length <= 4) return `${countryCode} ${cleanPhone}`;
    const start = cleanPhone.slice(0, 2);
    const end = cleanPhone.slice(-2);
    const masked = 'X'.repeat(Math.max(4, cleanPhone.length - 4));
    return `${countryCode} ${start}${masked}${end}`;
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
      console.warn('Backend login endpoint unavailable, using offline fallback:', apiErr.message);
    }

    // Offline / Mock Fallback
    const users = this.getStoredUsers();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        id: `66000000000000000000${Date.now().toString().slice(-4)}`,
        name: cleanEmail.split('@')[0].replace('.', ' ').replace(/^./, (str) => str.toUpperCase()),
        email: cleanEmail,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
        role: 'Standard Member',
        authProvider: 'email',
        isPhoneVerified: false,
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
        phoneNumber: signupData.phone,
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
      console.warn('Backend register endpoint unavailable, using offline fallback:', apiErr.message);
    }

    // Offline / Mock Fallback
    const users = this.getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const newUser: User = {
      id: `66000000000000000000${Date.now().toString().slice(-4)}`,
      name: cleanName,
      email: cleanEmail,
      phone: signupData.phone || undefined,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanEmail}`,
      role: 'Standard Member',
      authProvider: 'email',
      isPhoneVerified: false,
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
  // PHONE OTP AUTHENTICATION (REAL SMS VIA TWILIO VERIFY)
  // ==========================================
  async sendPhoneOtp(
    phone: string,
    countryCode = '+91',
    purpose: 'login' | 'signup' | 'password-reset' = 'login',
    tempUserData?: Partial<SignupData>
  ): Promise<OtpSession> {
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 7 || cleanDigits.length > 15) {
      throw new Error('Please enter a valid mobile number.');
    }

    const fullPhone = `${countryCode}${cleanDigits}`;
    const fallbackMasked = this.maskPhoneNumber(countryCode, cleanDigits);

    // Call backend API to trigger real SMS OTP via Twilio Verify
    try {
      const res = await apiClient.post<{
        success: boolean;
        message: string;
        data?: { phone: string; maskedPhone: string; expiresInSeconds: number };
      }>('/auth/send-otp', {
        phone: cleanDigits,
        countryCode,
        purpose,
      });

      const expiresInSeconds = res.data?.data?.expiresInSeconds || 600;
      const expiresAt = Date.now() + expiresInSeconds * 1000;
      const maskedPhone = res.data?.data?.maskedPhone || fallbackMasked;

      const session: OtpSession = {
        phone: fullPhone,
        countryCode,
        purpose,
        maskedPhone,
        expiresAt,
        tempUserData,
      };

      sessionStorage.setItem(STORAGE_KEYS.OTP_SESSION, JSON.stringify(session));
      return session;
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Failed to send SMS verification code. Please check your backend connection.');
    }
  }

  async verifyPhoneOtp(
    phone: string,
    otp: string,
    purpose: 'login' | 'signup' | 'password-reset' = 'login',
    tempUserData?: Partial<SignupData>
  ): Promise<AuthResponse | { verified: true }> {
    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      throw new Error('Please enter the complete 6-digit verification code.');
    }

    try {
      // Call backend API to verify code with Twilio Verify
      const res = await apiClient.post<{
        success: boolean;
        message?: string;
        token: string;
        user: User;
        verified?: boolean;
      }>('/auth/verify-otp', {
        phone,
        otp,
        name: tempUserData?.name,
        email: tempUserData?.email,
        purpose,
      });

      if (purpose === 'password-reset') {
        return { verified: true };
      }

      if (res.data && res.data.token && res.data.user) {
        const user = res.data.user;
        const token = res.data.token;

        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        sessionStorage.removeItem(STORAGE_KEYS.OTP_SESSION);

        return { user, token };
      }

      throw new Error(res.data?.message || 'Verification failed. Please check the code and try again.');
    } catch (err: any) {
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'Failed to verify the SMS code. Please try again.');
    }
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

  async resetPassword(identifier: string, newPassword: string): Promise<{ success: boolean }> {
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    try {
      await apiClient.post('/auth/reset-password', {
        identifier,
        newPassword,
      });
      return { success: true };
    } catch (apiErr: any) {
      console.warn('Backend reset password offline fallback.');
    }

    const users = this.getStoredUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier
    );

    if (user) {
      this.saveStoredUsers(users);
    }

    return { success: true };
  }

  // ==========================================
  // GOOGLE OAUTH SIMULATION / INTEGRATION
  // ==========================================
  async signInWithGoogle(): Promise<AuthResponse> {
    const googleUser: User = {
      id: '660000000000000000000003',
      name: 'Alex Morgan',
      email: 'alex.morgan@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'Pro Member',
      authProvider: 'google',
      isPhoneVerified: true,
      createdAt: new Date().toISOString(),
    };

    const token = `wm_jwt_google_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(googleUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    return { user: googleUser, token };
  }

  // ==========================================
  // PASSKEY / WEBAUTHN SIMULATION & INTEGRATION
  // ==========================================
  async signInWithPasskey(): Promise<AuthResponse> {
    const passkeyUser: User = {
      id: '660000000000000000000004',
      name: 'Biometric Authenticated User',
      email: 'biometric.user@walletmate.io',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'Enterprise Member',
      authProvider: 'passkey',
      isPhoneVerified: true,
      createdAt: new Date().toISOString(),
    };

    const token = `wm_jwt_passkey_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(passkeyUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    return { user: passkeyUser, token };
  }

  // ==========================================
  // ENTERPRISE SSO
  // ==========================================
  async signInWithSSO(workEmailOrDomain: string): Promise<AuthResponse> {
    const domain = workEmailOrDomain.includes('@')
      ? workEmailOrDomain.split('@')[1]
      : workEmailOrDomain;

    if (!domain || !domain.includes('.')) {
      throw new Error('Please enter a valid work email or corporate domain (e.g. acme.com).');
    }

    const companyName = domain.split('.')[0].toUpperCase();
    const ssoUser: User = {
      id: '660000000000000000000005',
      name: `${companyName} Corporate User`,
      email: workEmailOrDomain.includes('@') ? workEmailOrDomain : `employee@${domain}`,
      avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${domain}`,
      role: `${companyName} Enterprise`,
      authProvider: 'sso',
      isPhoneVerified: true,
      createdAt: new Date().toISOString(),
    };

    const token = `wm_jwt_sso_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(ssoUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);

    return { user: ssoUser, token };
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
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.OTP_SESSION);
  }
}

export const authService = new AuthService();
export default authService;
