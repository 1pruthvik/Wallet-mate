import type { User, AuthResponse, OtpSession, SignupData } from '../types/auth';

const STORAGE_KEYS = {
  USER: 'wallet_mate_auth_user',
  TOKEN: 'wallet_mate_auth_token',
  REMEMBER: 'wallet_mate_remember_me',
  USERS_DB: 'wallet_mate_mock_users_db',
  OTP_SESSION: 'wallet_mate_current_otp_session',
};

// Initial mock database of users
const DEFAULT_MOCK_USERS: User[] = [
  {
    id: 'usr_wm_01',
    name: 'Alex Morgan',
    email: 'alex.morgan@walletmate.io',
    phone: '+919876543210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Premium Member',
    authProvider: 'email',
    isPhoneVerified: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_wm_02',
    name: 'Dev User',
    email: 'demo@walletmate.io',
    phone: '+919876543210',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'Standard Member',
    authProvider: 'email',
    isPhoneVerified: true,
    createdAt: new Date().toISOString(),
  }
];

class AuthService {
  public isConfiguredForBackend(): boolean {
    return Boolean(import.meta.env.VITE_API_URL);
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

  private simulateDelay(ms: number = 450): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
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
    await this.simulateDelay(450);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const users = this.getStoredUsers();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // If demo testing with any credentials, auto-provision user
      user = {
        id: `usr_${Date.now()}`,
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
    await this.simulateDelay(500);

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

    const users = this.getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (existing) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
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
  // PHONE OTP AUTHENTICATION
  // ==========================================
  async sendPhoneOtp(
    phone: string,
    countryCode = '+91',
    purpose: 'login' | 'signup' | 'password-reset' = 'login',
    tempUserData?: Partial<SignupData>
  ): Promise<OtpSession> {
    await this.simulateDelay(400);

    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 7 || cleanDigits.length > 15) {
      throw new Error('Please enter a valid phone number.');
    }

    const fullPhone = `${countryCode}${cleanDigits}`;
    const maskedPhone = this.maskPhoneNumber(countryCode, cleanDigits);
    // Predictable test code 123456 or random code
    const generatedOtp = '123456';
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 minutes

    const session: OtpSession = {
      phone: fullPhone,
      countryCode,
      purpose,
      maskedPhone,
      expiresAt,
      mockCode: generatedOtp,
      tempUserData,
    };

    sessionStorage.setItem(STORAGE_KEYS.OTP_SESSION, JSON.stringify(session));

    // Dispatch a subtle notification event for UI demo feedback
    window.dispatchEvent(
      new CustomEvent('wallet-mate-otp-sent', {
        detail: {
          phone: maskedPhone,
          otp: generatedOtp,
          purpose,
        },
      })
    );

    return session;
  }

  async verifyPhoneOtp(
    phone: string,
    otp: string,
    purpose: 'login' | 'signup' | 'password-reset' = 'login',
    tempUserData?: Partial<SignupData>
  ): Promise<AuthResponse | { verified: true }> {
    await this.simulateDelay(500);

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      throw new Error('Please enter the complete 6-digit verification code.');
    }

    // Accept either 123456 or any 6-digit test code in mock environment
    const isMockValid = otp === '123456' || otp === '789012' || otp.length === 6;

    if (!isMockValid) {
      throw new Error('Invalid OTP. Please check the code and try again.');
    }

    if (purpose === 'password-reset') {
      return { verified: true };
    }

    const users = this.getStoredUsers();
    let user = users.find((u) => u.phone === phone);

    if (!user) {
      const name = tempUserData?.name || (tempUserData?.email ? tempUserData.email.split('@')[0] : 'Wallet-mate Member');
      const email = tempUserData?.email || `user_${phone.replace(/\D/g, '').slice(-4)}@walletmate.io`;

      user = {
        id: `usr_${Date.now()}`,
        name,
        email,
        phone,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${phone}`,
        role: 'Standard Member',
        authProvider: 'phone',
        isPhoneVerified: true,
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      this.saveStoredUsers(users);
    } else {
      user.isPhoneVerified = true;
      this.saveStoredUsers(users);
    }

    const token = `wm_jwt_${btoa(user.id)}_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    sessionStorage.removeItem(STORAGE_KEYS.OTP_SESSION);

    return { user, token };
  }

  // ==========================================
  // PASSWORD RESET
  // ==========================================
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
    await this.simulateDelay(400);
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
    await this.simulateDelay(450);
    if (!newPassword || newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const users = this.getStoredUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier
    );

    if (user) {
      // In a real app we'd update hashed password in backend
      this.saveStoredUsers(users);
    }

    return { success: true };
  }

  // ==========================================
  // GOOGLE OAUTH SIMULATION / INTEGRATION
  // ==========================================
  async signInWithGoogle(): Promise<AuthResponse> {
    await this.simulateDelay(600);

    const googleUser: User = {
      id: `usr_google_${Date.now()}`,
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
    await this.simulateDelay(700);

    // Passkey verification simulation
    const passkeyUser: User = {
      id: `usr_passkey_${Date.now()}`,
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
    await this.simulateDelay(600);

    const domain = workEmailOrDomain.includes('@')
      ? workEmailOrDomain.split('@')[1]
      : workEmailOrDomain;

    if (!domain || !domain.includes('.')) {
      throw new Error('Please enter a valid work email or corporate domain (e.g. acme.com).');
    }

    const companyName = domain.split('.')[0].toUpperCase();
    const ssoUser: User = {
      id: `usr_sso_${Date.now()}`,
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
