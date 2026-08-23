import React from 'react';
import WalletMateLogo from './WalletMateLogo';
import { ShieldCheck } from 'lucide-react';
import '../../styles/auth.css';

interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children }) => {
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
            <span>End-to-End Encrypted & Secure Authentication</span>
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
    </div>
  );
};

export default AuthLayout;
