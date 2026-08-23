import React, { useState } from 'react';
import { Shield, X, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface SSOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SSOModal: React.FC<SSOModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [domainOrEmail, setDomainOrEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signInWithSSO } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainOrEmail.trim()) {
      setError('Please enter your work email or company domain.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await signInWithSSO(domainOrEmail);
      setIsSubmitting(false);
      onSuccess();
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err?.message || 'SSO authentication failed. Please check your domain.');
    }
  };

  return (
    <div className="wm-modal-backdrop" onClick={onClose}>
      <div className="wm-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="wm-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: 'var(--wm-primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--wm-primary)',
              }}
            >
              <Shield size={18} />
            </div>
            <h3 className="wm-modal-title">Single Sign-On (SSO)</h3>
          </div>
          <button onClick={onClose} className="wm-modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: 'var(--wm-text-secondary)', lineHeight: 1.5 }}>
            Enter your corporate email address or organization domain to sign in via your identity provider (Okta, Azure AD, SAML 2.0).
          </p>

          <div className="wm-form-group">
            <label htmlFor="sso-domain" className="wm-label">
              Work email or company domain
            </label>
            <div className="wm-input-wrapper">
              <input
                id="sso-domain"
                type="text"
                value={domainOrEmail}
                onChange={(e) => {
                  setDomainOrEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="name@company.com or company.com"
                className={`wm-input ${error ? 'wm-input-error' : ''}`}
                autoFocus
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <div className="wm-field-error">
                <AlertCircle size={12} />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              className="wm-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="wm-btn-primary"
              disabled={isSubmitting}
              style={{ flex: 1 }}
              id="btn-confirm-sso"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="wm-spinner" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Continue with SSO</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SSOModal;
