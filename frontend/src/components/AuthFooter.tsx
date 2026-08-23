import React from 'react';
import { Link } from 'react-router-dom';
import WalletMateLogo from './auth/WalletMateLogo';
import { ShieldCheck, Lock } from 'lucide-react';

export const AuthFooter: React.FC = () => {
  return (
    <footer className="wm-auth-footer-bar">
      <div className="wm-auth-footer-container">
        <div className="wm-auth-footer-left">
          <Link to="/" className="wm-footer-brand">
            <WalletMateLogo size="sm" showText={false} />
            <span>Wallet-mate</span>
          </Link>
          <p className="wm-footer-tagline">
            Intelligent Money Management • Real-time bank analytics, AI insights & zero assumed data.
          </p>
        </div>

        <div className="wm-auth-footer-links">
          <div className="wm-footer-col">
            <h5>Workspace</h5>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/transactions">Transactions</Link>
            <Link to="/financial-health">Health Engine</Link>
          </div>

          <div className="wm-footer-col">
            <h5>Tools & AI</h5>
            <Link to="/mentor">AI Mentor</Link>
            <Link to="/trading">Paper Trading</Link>
            <Link to="/learning">Learning</Link>
          </div>

          <div className="wm-footer-col">
            <h5>Security & Legal</h5>
            <span className="wm-security-tag">
              <ShieldCheck size={14} color="#10b981" />
              <span>AES-256 Encrypted</span>
            </span>
            <span className="wm-security-tag">
              <Lock size={14} color="#635bff" />
              <span>User Isolated Data</span>
            </span>
          </div>
        </div>
      </div>

      <div className="wm-auth-footer-bottom">
        <div className="wm-auth-footer-container wm-footer-bottom-inner">
          <p>© {new Date().getFullYear()} Wallet-mate Inc. All financial calculations computed exclusively from authenticated user input.</p>
          <div className="wm-footer-status">
            <span className="wm-status-dot" />
            <span>Operational • Bank Engine v2.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AuthFooter;
