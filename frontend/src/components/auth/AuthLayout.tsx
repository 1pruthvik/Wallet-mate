import React, { useEffect, useState } from 'react';
import WalletMateLogo from './WalletMateLogo';
import { ShieldCheck, X } from 'lucide-react';
import '../../styles/auth.css';

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
  const [toastData, setToastData] = useState<{ phone: string; otp: string; purpose: string } | null>(null);

  useEffect(() => {
    const handleOtpSent = (e: any) => {
      if (e?.detail) {
        setToastData(e.detail);
        // Auto dismiss after 15s
        const timer = setTimeout(() => {
          setToastData(null);
        }, 15000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('wallet-mate-otp-sent', handleOtpSent);
    return () => {
      window.removeEventListener('wallet-mate-otp-sent', handleOtpSent);
    };
  }, []);

  return (
    <div className="wm-auth-page">
      <div className="wm-auth-bg-ambient" />

      <div className="wm-auth-container">
        <div className="wm-auth-header">
          <WalletMateLogo size="md" />
          {title && <h1 className="wm-auth-title">{title}</h1>}
          {subtitle && <p className="wm-auth-subtitle">{subtitle}</p>}
        </div>

        <div className="wm-auth-card">
          {children}
        </div>

        <div className="wm-auth-legal">
          <div className="wm-security-badge">
            <ShieldCheck size={14} color="#635bff" />
            <span>256-bit Bank-Grade Encryption & Security</span>
          </div>

          <div className="wm-legal-links">
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="wm-legal-link">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#terms" onClick={(e) => e.preventDefault()} className="wm-legal-link">
              Terms of Service
            </a>
            <span>•</span>
            <a href="#help" onClick={(e) => e.preventDefault()} className="wm-legal-link">
              Help Center
            </a>
          </div>
        </div>
      </div>

      {/* Demo helper toast for OTP verification ease */}
      {toastData && (
        <div className="wm-demo-toast">
          <span className="wm-demo-toast-badge">Demo OTP</span>
          <div style={{ flex: 1 }}>
            <div>Code sent to {toastData.phone}:</div>
            <span className="wm-demo-toast-code">{toastData.otp}</span>
          </div>
          <button
            onClick={() => setToastData(null)}
            className="wm-modal-close-btn"
            style={{ color: '#fff' }}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthLayout;
