import React, { useState, useEffect } from 'react';
import { Fingerprint, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface PasskeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasskeyModal: React.FC<PasskeyModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<'prompt' | 'scanning' | 'success' | 'error'>('prompt');
  const [errorMessage, setErrorMessage] = useState('');
  const { signInWithPasskey } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      setStep('prompt');
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartPasskey = async () => {
    setStep('scanning');
    try {
      await signInWithPasskey();
      setStep('success');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      setStep('error');
      setErrorMessage(err?.message || 'Passkey verification was cancelled or failed.');
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
              <Fingerprint size={18} />
            </div>
            <h3 className="wm-modal-title">Sign in with Passkey</h3>
          </div>
          <button onClick={onClose} className="wm-modal-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {step === 'prompt' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--wm-text-secondary)', lineHeight: 1.5 }}>
              Use your device's fingerprint, Face ID, or screen lock security key to sign in quickly and securely without a password.
            </p>

            <button
              type="button"
              className="wm-btn-primary"
              onClick={handleStartPasskey}
              id="btn-confirm-passkey"
            >
              <Fingerprint size={18} />
              <span>Authenticate with Biometrics</span>
            </button>
          </div>
        )}

        {step === 'scanning' && (
          <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                backgroundColor: 'var(--wm-primary-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--wm-primary)',
              }}
            >
              <Fingerprint size={36} className="wm-spinner" />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--wm-text-primary)' }}>
                Waiting for device confirmation...
              </div>
              <div style={{ fontSize: 13, color: 'var(--wm-text-muted)', marginTop: 4 }}>
                Please touch your fingerprint sensor or verify with Face ID.
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={44} color="#00875a" />
            <div style={{ fontWeight: 600, fontSize: 16, color: '#00875a' }}>
              Passkey Verified!
            </div>
            <div style={{ fontSize: 13, color: 'var(--wm-text-muted)' }}>
              Signing you into Wallet-mate...
            </div>
          </div>
        )}

        {step === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="wm-alert wm-alert-error">
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="wm-btn-secondary"
                onClick={onClose}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wm-btn-primary"
                onClick={handleStartPasskey}
                style={{ flex: 1 }}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasskeyModal;
