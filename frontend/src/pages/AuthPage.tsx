import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import ForgotPasswordView from '../components/auth/ForgotPasswordView';
import type { AuthViewMode } from '../types/auth';
import { useAuthStore } from '../store/useAuthStore';

export const AuthPage: React.FC<{ defaultMode?: AuthViewMode }> = ({ defaultMode = 'login' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { clearError } = useAuthStore();

  const [mode, setMode] = useState<AuthViewMode>(
    (searchParams.get('mode') as AuthViewMode) || defaultMode
  );

  // Sync mode with query param
  useEffect(() => {
    const qMode = searchParams.get('mode') as AuthViewMode;
    if (qMode && qMode !== mode && (qMode === 'login' || qMode === 'signup' || qMode === 'forgot-password')) {
      setMode(qMode);
    }
  }, [searchParams]);

  const switchMode = (newMode: AuthViewMode) => {
    clearError();
    setMode(newMode);
    setSearchParams({ mode: newMode });
  };

  const handleAuthSuccess = () => {
    navigate('/dashboard', { replace: true });
  };

  // Get dynamic titles and subtitles based on current mode
  const getHeaderInfo = () => {
    switch (mode) {
      case 'login':
        return {
          title: 'Sign in to your account',
          subtitle: undefined,
        };
      case 'signup':
        return {
          title: 'Create your Wallet-mate account',
          subtitle: 'Start managing and growing your personal wealth today.',
        };
      case 'forgot-password':
        return {
          title: 'Reset your password',
          subtitle: 'Enter your email address to recover your account.',
        };
      default:
        return {
          title: 'Sign in to your account',
          subtitle: undefined,
        };
    }
  };

  const { title, subtitle } = getHeaderInfo();

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      {/* 1. Standard Login View */}
      {mode === 'login' && (
        <LoginForm
          onSwitchToSignup={() => switchMode('signup')}
          onSwitchToForgotPassword={() => switchMode('forgot-password')}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* 2. Standard Signup View */}
      {mode === 'signup' && (
        <SignupForm
          onSwitchToLogin={() => switchMode('login')}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* 3. Forgot Password Recovery */}
      {mode === 'forgot-password' && (
        <ForgotPasswordView onBackToLogin={() => switchMode('login')} />
      )}
    </AuthLayout>
  );
};

export default AuthPage;
