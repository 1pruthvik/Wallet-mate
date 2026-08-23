import React, { useState } from 'react';
import { ArrowLeft, Mail, Smartphone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import PhoneNumberInput from './PhoneNumberInput';
import OTPInput from './OTPInput';
import PasswordInput from './PasswordInput';
import PasswordRequirements, { isPasswordValid } from './PasswordRequirements';
import { DEFAULT_COUNTRY } from '../../utils/countryCodes';
import type { CountryCodeInfo } from '../../types/auth';
import { useAuthStore } from '../../store/useAuthStore';
import authService from '../../services/authService';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onBackToLogin }) => {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [stage, setStage] = useState<'input' | 'otp' | 'new-password' | 'success'>('input');
  
  // Email states
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
  // Phone states
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeInfo>(DEFAULT_COUNTRY);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  // New password states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Errors & loading
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { sendPhoneOtp, verifyPhoneOtp } = useAuthStore();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await authService.sendPasswordResetEmail(email);
      setIsLoading(false);
      setEmailSent(true);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to send reset link.');
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length < 7) {
      setError('Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await sendPhoneOtp(cleanDigits, selectedCountry.dialCode, 'password-reset');
      setIsLoading(false);
      setStage('otp');
      setCountdown(30);
      setCanResend(false);
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const fullPhone = `${selectedCountry.dialCode}${phone.replace(/\D/g, '')}`;
      await verifyPhoneOtp(fullPhone, otp, 'password-reset');
      setIsLoading(false);
      setStage('new-password');
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Invalid code.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid(newPassword)) {
      setError('Password does not satisfy all requirements.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const fullPhone = `${selectedCountry.dialCode}${phone.replace(/\D/g, '')}`;
      await authService.resetPassword(fullPhone, newPassword);
      setIsLoading(false);
      setStage('success');
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Failed to reset password.');
    }
  };

  return (
    <div>
      <button
        type="button"
        className="wm-back-btn"
        onClick={onBackToLogin}
        id="btn-forgot-back"
      >
        <ArrowLeft size={14} />
        <span>Back to sign in</span>
      </button>

      {error && (
        <div className="wm-alert wm-alert-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* Stage: Success */}
      {stage === 'success' ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: 'var(--wm-success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--wm-success)',
            }}
          >
            <CheckCircle size={30} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--wm-text-primary)' }}>
            Password successfully reset
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--wm-text-secondary)', margin: '0 0 20px 0' }}>
            Your account password has been updated. You can now sign in with your new password.
          </p>
          <button
            type="button"
            className="wm-btn-primary"
            onClick={onBackToLogin}
            id="btn-return-login"
          >
            Sign in with new password
          </button>
        </div>
      ) : emailSent ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: 'var(--wm-primary-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: 'var(--wm-primary)',
            }}
          >
            <Mail size={26} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--wm-text-primary)' }}>
            Check your email
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--wm-text-secondary)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
            We've sent a password reset link to <strong style={{ color: 'var(--wm-text-primary)' }}>{email}</strong>. Please check your inbox and spam folder.
          </p>
          <button
            type="button"
            className="wm-btn-primary"
            onClick={onBackToLogin}
          >
            Return to sign in
          </button>
        </div>
      ) : stage === 'otp' ? (
        <form onSubmit={handleVerifyOtp} className="wm-auth-form" noValidate>
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <p style={{ fontSize: '14px', color: 'var(--wm-text-secondary)', margin: '0 0 6px 0' }}>
              Enter the 6-digit code sent to
            </p>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--wm-text-primary)' }}>
              {selectedCountry.dialCode} {phone}
            </div>
          </div>

          <OTPInput
            length={6}
            value={otp}
            onChange={(v) => {
              setOtp(v);
              if (error) setError('');
            }}
            error={Boolean(error)}
            disabled={isLoading}
          />

          <div className="wm-resend-row">
            <span>Didn't receive the code?</span>
            {canResend ? (
              <button
                type="button"
                className="wm-resend-btn"
                onClick={handlePhoneSubmit}
                disabled={isLoading}
              >
                Resend OTP
              </button>
            ) : (
              <span>Resend OTP in {countdown}s</span>
            )}
          </div>

          <button
            type="submit"
            className="wm-btn-primary"
            disabled={isLoading || otp.length !== 6}
            id="btn-verify-reset-otp"
            style={{ marginTop: 6 }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="wm-spinner" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify code</span>
            )}
          </button>
        </form>
      ) : stage === 'new-password' ? (
        <form onSubmit={handleResetPassword} className="wm-auth-form" noValidate>
          <PasswordInput
            id="reset-new-password"
            label="Create new password"
            placeholder="Enter new strong password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading}
          />

          {newPassword.length > 0 && <PasswordRequirements password={newPassword} />}

          <PasswordInput
            id="reset-confirm-password"
            label="Confirm new password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading}
          />

          <button
            type="submit"
            className="wm-btn-primary"
            disabled={isLoading}
            id="btn-submit-new-password"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="wm-spinner" />
                <span>Updating password...</span>
              </>
            ) : (
              <span>Reset password</span>
            )}
          </button>
        </form>
      ) : (
        /* Stage: Input (Choose Email or Phone) */
        <div>
          {/* Tabs for Reset Method */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--wm-bg-subtle)',
              padding: 4,
              borderRadius: 'var(--wm-radius-md)',
              marginBottom: 20,
              gap: 4,
            }}
          >
            <button
              type="button"
              style={{
                flex: 1,
                height: 34,
                border: 'none',
                borderRadius: 'var(--wm-radius-sm)',
                backgroundColor: method === 'email' ? '#ffffff' : 'transparent',
                boxShadow: method === 'email' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontWeight: method === 'email' ? 600 : 500,
                color: method === 'email' ? 'var(--wm-text-primary)' : 'var(--wm-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 13,
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
              onClick={() => {
                setMethod('email');
                setError('');
              }}
              id="tab-reset-email"
            >
              <Mail size={14} />
              <span>Email</span>
            </button>

            <button
              type="button"
              style={{
                flex: 1,
                height: 34,
                border: 'none',
                borderRadius: 'var(--wm-radius-sm)',
                backgroundColor: method === 'phone' ? '#ffffff' : 'transparent',
                boxShadow: method === 'phone' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontWeight: method === 'phone' ? 600 : 500,
                color: method === 'phone' ? 'var(--wm-text-primary)' : 'var(--wm-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                fontSize: 13,
                fontFamily: 'inherit',
                transition: 'all 0.15s ease',
              }}
              onClick={() => {
                setMethod('phone');
                setError('');
              }}
              id="tab-reset-phone"
            >
              <Smartphone size={14} />
              <span>Phone</span>
            </button>
          </div>

          {method === 'email' ? (
            <form onSubmit={handleEmailSubmit} className="wm-auth-form" noValidate>
              <div className="wm-form-group">
                <label htmlFor="reset-email" className="wm-label">
                  Email address
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your registered email"
                  className="wm-input"
                  required
                  autoFocus
                  disabled={isLoading}
                />
              </div>

              <p style={{ fontSize: '13px', color: 'var(--wm-text-muted)', margin: 0 }}>
                We'll email you a secure link to reset your account password.
              </p>

              <button
                type="submit"
                className="wm-btn-primary"
                disabled={isLoading}
                id="btn-send-reset-link"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="wm-spinner" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <span>Send reset link</span>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePhoneSubmit} className="wm-auth-form" noValidate>
              <PhoneNumberInput
                id="reset-phone"
                label="Registered phone number"
                phone={phone}
                selectedCountry={selectedCountry}
                onPhoneChange={(v) => {
                  setPhone(v);
                  if (error) setError('');
                }}
                onCountryChange={(c) => setSelectedCountry(c)}
                disabled={isLoading}
              />

              <p style={{ fontSize: '13px', color: 'var(--wm-text-muted)', margin: 0 }}>
                We'll send a 6-digit verification code to your phone number.
              </p>

              <button
                type="submit"
                className="wm-btn-primary"
                disabled={isLoading}
                id="btn-send-reset-otp"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="wm-spinner" />
                    <span>Sending OTP...</span>
                  </>
                ) : (
                  <span>Send OTP</span>
                )}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordView;
