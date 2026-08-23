import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import WalletMateLogo from '../auth/WalletMateLogo';
import { ArrowRight, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';

interface HomeNavbarProps {
  onScrollToSection?: (sectionId: string) => void;
}

export const HomeNavbar: React.FC<HomeNavbarProps> = ({ onScrollToSection }) => {
  const { isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleViewDashboard = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="wm-navbar">
      <div className="wm-container">
        <div className="wm-navbar-inner">
          {/* Brand */}
          <Link to="/" className="wm-nav-brand">
            <WalletMateLogo size="md" showText={false} />
            <span>Wallet-mate</span>
          </Link>

          {/* Center Links (Desktop) */}
          <nav>
            <ul className="wm-nav-links">
              <li>
                <button
                  type="button"
                  className="wm-nav-link"
                  style={{ background: 'none', border: 'none', font: 'inherit' }}
                  onClick={() => handleNavClick('features')}
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="wm-nav-link"
                  style={{ background: 'none', border: 'none', font: 'inherit' }}
                  onClick={() => handleNavClick('statement-extract')}
                >
                  PDF Import
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="wm-nav-link"
                  style={{ background: 'none', border: 'none', font: 'inherit' }}
                  onClick={() => handleNavClick('financial-health')}
                >
                  Health Engine
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="wm-nav-link"
                  style={{ background: 'none', border: 'none', font: 'inherit' }}
                  onClick={() => handleNavClick('how-it-works')}
                >
                  How it Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="wm-nav-link"
                  style={{ background: 'none', border: 'none', font: 'inherit' }}
                  onClick={() => handleNavClick('security')}
                >
                  Security
                </button>
              </li>
            </ul>
          </nav>

          {/* Actions (Desktop) */}
          <div className="wm-nav-actions">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="wm-btn-secondary" style={{ padding: '8px 14px' }}>
                  <LayoutDashboard size={16} />
                  <span>Dashboard</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="wm-btn-text"
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  title="Sign out"
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="wm-btn-text">
                  Log in
                </Link>
                <Link to="/signup" className="wm-btn-secondary">
                  Sign up
                </Link>
                <button
                  type="button"
                  onClick={handleViewDashboard}
                  className="wm-btn-primary"
                  id="btn-nav-view-dashboard"
                >
                  <span>View Dashboard</span>
                  <ArrowRight size={15} />
                </button>
              </>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              className="wm-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div
            style={{
              padding: '20px 0',
              borderTop: '1px solid var(--wm-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <button
              type="button"
              className="wm-nav-link"
              style={{ textAlign: 'left', background: 'none', border: 'none', padding: '6px 0' }}
              onClick={() => handleNavClick('features')}
            >
              Features
            </button>
            <button
              type="button"
              className="wm-nav-link"
              style={{ textAlign: 'left', background: 'none', border: 'none', padding: '6px 0' }}
              onClick={() => handleNavClick('statement-extract')}
            >
              PDF Statement Import
            </button>
            <button
              type="button"
              className="wm-nav-link"
              style={{ textAlign: 'left', background: 'none', border: 'none', padding: '6px 0' }}
              onClick={() => handleNavClick('financial-health')}
            >
              Health Engine
            </button>
            <button
              type="button"
              className="wm-nav-link"
              style={{ textAlign: 'left', background: 'none', border: 'none', padding: '6px 0' }}
              onClick={() => handleNavClick('how-it-works')}
            >
              How it Works
            </button>
            <button
              type="button"
              className="wm-nav-link"
              style={{ textAlign: 'left', background: 'none', border: 'none', padding: '6px 0' }}
              onClick={() => handleNavClick('security')}
            >
              Security
            </button>

            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--wm-border)', display: 'flex', gap: '10px' }}>
              {isAuthenticated ? (
                <Link to="/dashboard" className="wm-btn-primary" style={{ width: '100%' }}>
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="wm-btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                    Log in
                  </Link>
                  <Link to="/signup" className="wm-btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default HomeNavbar;
