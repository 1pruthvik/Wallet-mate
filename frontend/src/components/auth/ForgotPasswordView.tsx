import React, { useState } from 'react';
import { ArrowLeft, Mail, AlertCircle, Loader2 } from 'lucide-react';
import authService from '../../services/authService';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      {emailSent ? (
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
            We've sent password reset instructions to <strong style={{ color: 'var(--wm-text-primary)' }}>{email}</strong>. Please check your inbox.
          </p>
          <button
            type="button"
            className="wm-btn-primary"
            onClick={onBackToLogin}
            id="btn-return-login"
          >
            Return to sign in
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default ForgotPasswordView;
