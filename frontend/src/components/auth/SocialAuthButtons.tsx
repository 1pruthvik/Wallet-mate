import React from 'react';
import { Smartphone, Fingerprint, Shield } from 'lucide-react';

interface SocialAuthButtonsProps {
  onGoogleClick: () => void;
  onPhoneClick: () => void;
  onPasskeyClick: () => void;
  onSSOClick: () => void;
  disabled?: boolean;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGoogleClick,
  onPhoneClick,
  onPasskeyClick,
  onSSOClick,
  disabled = false,
}) => {
  return (
    <div className="wm-alt-auth-group">
      {/* Google Button */}
      <button
        type="button"
        className="wm-alt-btn"
        onClick={onGoogleClick}
        disabled={disabled}
        id="btn-auth-google"
      >
        <span className="wm-alt-btn-icon">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        </span>
        <span>Continue with Google</span>
      </button>

      {/* Phone Button */}
      <button
        type="button"
        className="wm-alt-btn"
        onClick={onPhoneClick}
        disabled={disabled}
        id="btn-auth-phone"
      >
        <span className="wm-alt-btn-icon">
          <Smartphone size={17} color="#425466" />
        </span>
        <span>Continue with Phone</span>
      </button>

      {/* Passkey Button */}
      <button
        type="button"
        className="wm-alt-btn"
        onClick={onPasskeyClick}
        disabled={disabled}
        id="btn-auth-passkey"
      >
        <span className="wm-alt-btn-icon">
          <Fingerprint size={18} color="#425466" />
        </span>
        <span>Continue with Passkey</span>
      </button>

      {/* SSO Button */}
      <button
        type="button"
        className="wm-alt-btn"
        onClick={onSSOClick}
        disabled={disabled}
        id="btn-auth-sso"
      >
        <span className="wm-alt-btn-icon">
          <Shield size={17} color="#425466" />
        </span>
        <span>Continue with SSO</span>
      </button>
    </div>
  );
};

export default SocialAuthButtons;
