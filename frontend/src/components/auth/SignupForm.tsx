import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import PasswordInput from './PasswordInput';
import PasswordRequirements, { isPasswordValid } from './PasswordRequirements';
import { useAuthStore } from '../../store/useAuthStore';
import type { SignupData } from '../../types/auth';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { signup, isLoading, error, clearError } = useAuthStore();

  const validateForm = () => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) {
      errors.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (!isPasswordValid(password)) {
      errors.password = 'Password does not meet all security criteria.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    const data: SignupData = {
      name: name.trim(),
      email: email.trim(),
      password,
    };

    try {
      await signup(data);
      onSuccess();
    } catch {
      // Error handled in store
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="wm-auth-form" noValidate>
        {/* Global Error */}
        {error && (
          <div className="wm-alert wm-alert-error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Full Name */}
        <div className="wm-form-group">
          <label htmlFor="signup-name" className="wm-label">
            Full name
          </label>
          <div className="wm-input-wrapper">
            <input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="Enter your full name"
              disabled={isLoading}
              required
              className={`wm-input ${fieldErrors.name ? 'wm-input-error' : ''}`}
            />
          </div>
          {fieldErrors.name && (
            <div className="wm-field-error">
              <AlertCircle size={12} />
              <span>{fieldErrors.name}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="wm-form-group">
          <label htmlFor="signup-email" className="wm-label">
            Email
          </label>
          <div className="wm-input-wrapper">
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              placeholder="Enter your email"
              disabled={isLoading}
              required
              className={`wm-input ${fieldErrors.email ? 'wm-input-error' : ''}`}
            />
          </div>
          {fieldErrors.email && (
            <div className="wm-field-error">
              <AlertCircle size={12} />
              <span>{fieldErrors.email}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <PasswordInput
          id="signup-password"
          name="password"
          label="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
          }}
          placeholder="Create a strong password"
          error={fieldErrors.password}
          disabled={isLoading}
          autoComplete="new-password"
        />

        {/* Dynamic Password Validation Requirements */}
        {password.length > 0 && <PasswordRequirements password={password} />}

        {/* Confirm Password */}
        <PasswordInput
          id="signup-confirm-password"
          name="confirmPassword"
          label="Confirm password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword) {
              setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }
          }}
          placeholder="Confirm your password"
          error={fieldErrors.confirmPassword}
          disabled={isLoading}
          autoComplete="new-password"
        />

        {/* Terms note */}
        <p style={{ fontSize: '12px', color: 'var(--wm-text-muted)', margin: '2px 0 0 0', lineHeight: 1.4 }}>
          By creating an account, you agree to Wallet-mate's Terms of Service and Privacy Policy.
        </p>

        {/* Create Account Button */}
        <button
          type="submit"
          className="wm-btn-primary"
          disabled={isLoading}
          id="btn-signup-submit"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="wm-spinner" />
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create account</span>
          )}
        </button>
      </form>

      {/* Footer Switch */}
      <div className="wm-auth-footer">
        <span>Already have a Wallet-mate account?</span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="wm-auth-footer-link"
          id="link-switch-login"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default SignupForm;
