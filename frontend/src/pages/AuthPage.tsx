import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import PhoneAuthView from '../components/auth/PhoneAuthView';
import ForgotPasswordView from '../components/auth/ForgotPasswordView';
import PasskeyModal from '../components/auth/PasskeyModal';
import SSOModal from '../components/auth/SSOModal';
import type { AuthViewMode, SignupData } from '../types/auth';
import { useAuthStore } from '../store/useAuthStore';

export const AuthPage: React.FC<{ defaultMode?: AuthViewMode }> = ({ defaultMode = 'login' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { signup, clearError } = useAuthStore();

  const [mode, setMode] = useState<AuthViewMode>(
    (searchParams.get('mode') as AuthViewMode) || defaultMode
  );
  const [isPasskeyOpen, setIsPasskeyOpen] = useState(false);
  const [isSSOOpen, setIsSSOOpen] = useState(false);
  const [tempSignupData, setTempSignupData] = useState<SignupData | null>(null);

  // Sync mode with query param
  useEffect(() => {
    const qMode = searchParams.get('mode') as AuthViewMode;
    if (qMode && qMode !== mode) {
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

  // If user signed up via email form, we prompt phone verification next
  const handleEmailSignupSubmit = async (data: SignupData) => {
    setTempSignupData(data);
    // Proceed to signup phone verification
    switchMode('signup-phone-verify');
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
      case 'phone-login':
        return {
          title: 'Sign in with your phone',
          subtitle: 'Enter your phone number to receive a verification code.',
        };
      case 'phone-signup':
        return {
          title: 'Create your Wallet-mate account',
          subtitle: 'Sign up in seconds using your mobile number.',
        };
      case 'signup-phone-verify':
        return {
          title: 'Verify your phone number',
          subtitle: 'Complete your Wallet-mate registration with SMS verification.',
        };
      case 'forgot-password':
      case 'forgot-phone-verify':
      case 'reset-new-password':
        return {
          title: 'Reset your password',
          subtitle: 'Choose how you would like to recover your account.',
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
          onSwitchToPhoneAuth={() => switchMode('phone-login')}
          onSwitchToForgotPassword={() => switchMode('forgot-password')}
          onOpenPasskey={() => setIsPasskeyOpen(true)}
          onOpenSSO={() => setIsSSOOpen(true)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* 2. Standard Signup View */}
      {mode === 'signup' && (
        <SignupForm
          onSwitchToLogin={() => switchMode('login')}
          onSwitchToPhoneSignup={() => switchMode('phone-signup')}
          onSuccess={handleEmailSignupSubmit}
        />
      )}

      {/* 3. Phone OTP Login View */}
      {mode === 'phone-login' && (
        <PhoneAuthView
          mode="login"
          onBackToEmail={() => switchMode('login')}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* 4. Phone OTP Direct Signup View */}
      {mode === 'phone-signup' && (
        <PhoneAuthView
          mode="signup"
          onBackToEmail={() => switchMode('signup')}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* 5. Post-Email Signup Phone Verification */}
      {mode === 'signup-phone-verify' && (
        <PhoneAuthView
          mode="signup-verify"
          tempUserData={tempSignupData || undefined}
          initialName={tempSignupData?.name}
          onBackToEmail={() => switchMode('signup')}
          onSuccess={async () => {
            if (tempSignupData) {
              try {
                await signup(tempSignupData);
              } catch {
                // User may already be created by phone OTP verify
              }
            }
            handleAuthSuccess();
          }}
        />
      )}

      {/* 6. Forgot Password Recovery */}
      {mode === 'forgot-password' && (
        <ForgotPasswordView onBackToLogin={() => switchMode('login')} />
      )}

      {/* Modals */}
      <PasskeyModal
        isOpen={isPasskeyOpen}
        onClose={() => setIsPasskeyOpen(false)}
        onSuccess={() => {
          setIsPasskeyOpen(false);
          handleAuthSuccess();
        }}
      />

      <SSOModal
        isOpen={isSSOOpen}
        onClose={() => setIsSSOOpen(false)}
        onSuccess={() => {
          setIsSSOOpen(false);
          handleAuthSuccess();
        }}
      />
    </AuthLayout>
  );
};

export default AuthPage;
