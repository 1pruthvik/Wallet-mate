import React, { useState } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import PasswordInput from './PasswordInput';
import { useAuthStore } from '../../store/useAuthStore';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToSignup,
  onSwitchToForgotPassword,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const { loginWithEmail, isLoading, error, clearError } = useAuthStore();

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await loginWithEmail(email, password, rememberMe);
      onSuccess();
    } catch {
      // Error handled by store
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="wm-auth-form" noValidate>
        {/* Global Error Banner */}
        {error && (
          <div className="wm-alert wm-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Email Field */}
        <div className="wm-form-group">
          <div className="wm-label-row">
            <label htmlFor="login-email" className="wm-label">
              Email
            </label>
          </div>
          <div className="wm-input-wrapper">
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="Enter your email"
              disabled={isLoading}
              required
              className={`wm-input ${fieldErrors.email ? 'wm-input-error' : ''}`}
              aria-invalid={Boolean(fieldErrors.email)}
            />
          </div>
          {fieldErrors.email && (
            <div className="wm-field-error">
              <AlertCircle size={12} />
              <span>{fieldErrors.email}</span>
            </div>
          )}
        </div>

        {/* Password Field */}
        <PasswordInput
          id="login-password"
          name="password"
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) {
              setFieldErrors((prev) => ({ ...prev, password: undefined }));
            }
          }}
          placeholder="Enter your password"
          error={fieldErrors.password}
          disabled={isLoading}
          autoComplete="current-password"
          actionLink={
            <button
              type="button"
              className="wm-label-link"
              onClick={onSwitchToForgotPassword}
              disabled={isLoading}
              id="link-forgot-password"
            >
              Forgot your password?
            </button>
          }
        />

        {/* Remember Me Checkbox */}
        <div className="wm-checkbox-row">
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              id="remember-me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
              className="wm-checkbox-input"
            />
            <span className="wm-custom-checkbox" aria-hidden="true">
              <Check size={12} className="wm-checkbox-icon" strokeWidth={3} />
            </span>
            <span className="wm-checkbox-label">Remember me on this device</span>
          </label>
        </div>

        {/* Primary Sign In Button */}
        <button
          type="submit"
          className="wm-btn-primary"
          disabled={isLoading}
          id="btn-login-submit"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="wm-spinner" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign in</span>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="wm-auth-footer">
        <span>New to Wallet-mate?</span>
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="wm-auth-footer-link"
          id="link-switch-signup"
        >
          Create account
        </button>
      </div>
    </div>
  );
};

export default LoginForm;
