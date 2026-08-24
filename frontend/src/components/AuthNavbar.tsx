import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import WalletMateLogo from './auth/WalletMateLogo';
import {
  Home,
  LayoutDashboard,
  ReceiptText,
  Activity,
  GraduationCap,
  Sparkles,
  TrendingUp,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export const AuthNavbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16} /> },
    { label: 'Transactions', path: '/transactions', icon: <ReceiptText size={16} /> },
    { label: 'Health Engine', path: '/financial-health', icon: <Activity size={16} /> },
    { label: 'Learning', path: '/learning', icon: <GraduationCap size={16} /> },
    { label: 'AI Mentor', path: '/mentor', icon: <Sparkles size={16} /> },
    { label: 'Trading', path: '/trading', icon: <TrendingUp size={16} /> },
  ];

  return (
    <header className="wm-auth-navbar">
      <div className="wm-auth-navbar-inner">
        {/* Brand & Home Link */}
        <div className="wm-auth-nav-left">
          <Link to="/" className="wm-auth-nav-brand" title="Return to Landing Page">
            <WalletMateLogo size="sm" showText={false} />
            <span className="wm-brand-title">Wallet-mate</span>
            <span className="wm-brand-badge">Workspace</span>
          </Link>

          <Link to="/" className="wm-nav-home-btn" title="Back to Home Page">
            <Home size={15} />
            <span>Home</span>
          </Link>
        </div>

        {/* Quick Nav Links (Desktop) */}
        <nav className="wm-auth-quick-nav">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`wm-auth-quick-link ${isActive ? 'active' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Identity & Actions (Desktop) */}
        <div className="wm-auth-nav-right">
          <Link to="/profile" className="wm-user-badge-link" title="View Profile">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'User'}
                className="wm-user-avatar"
              />
            ) : (
              <div className="wm-user-avatar-fallback">
                <User size={15} />
              </div>
            )}
            <div className="wm-user-meta">
              <span className="wm-user-name">{user?.name || 'User'}</span>
              <span className="wm-user-role">{user?.role || 'Member'}</span>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="wm-nav-signout-btn"
            title="Sign out"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>

          {/* Mobile menu trigger */}
          <button
            type="button"
            className="wm-mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="wm-auth-mobile-drawer">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="wm-auth-mobile-link home-link"
          >
            <Home size={18} />
            <span>Home Page</span>
          </Link>

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`wm-auth-mobile-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={`wm-auth-mobile-link ${location.pathname === '/profile' ? 'active' : ''}`}
          >
            <User size={18} />
            <span>Profile & Account</span>
          </Link>

          <div className="wm-auth-mobile-footer">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="wm-btn-secondary"
              style={{ width: '100%', justifyContent: 'center', color: '#ef4444' }}
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AuthNavbar;
