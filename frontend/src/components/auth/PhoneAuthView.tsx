import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import PhoneNumberInput from './PhoneNumberInput';
import OTPInput from './OTPInput';
import { DEFAULT_COUNTRY } from '../../utils/countryCodes';
import type { CountryCodeInfo, SignupData } from '../../types/auth';
import { useAuthStore } from '../../store/useAuthStore';

interface PhoneAuthViewProps {
  mode?: 'login' | 'signup' | 'signup-verify';
  initialPhone?: string;
  initialName?: string;
  tempUserData?: Partial<SignupData>;
  onBackToEmail: () => void;
  onSuccess: () => void;
}

export const PhoneAuthView: React.FC<PhoneAuthViewProps> = ({
  mode = 'login',
  initialPhone = '',
  initialName = '',
  tempUserData,
  onBackToEmail,
  onSuccess,
}) => {
  const [step, setStep] = useState<'input' | 'verify'>(
    mode === 'signup-verify' && initialPhone ? 'verify' : 'input'
  );
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeInfo>(DEFAULT_COUNTRY);
  const [phone, setPhone] = useState(initialPhone);
  const [name, setName] = useState(initialName);
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const { sendPhoneOtp, verifyPhoneOtp, otpSession, isLoading, error, clearError } = useAuthStore();

  // Timer countdown
  useEffect(() => {
    let interval: any = null;
    if (step === 'verify' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, countdown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearError();
    setPhoneError('');

    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits) {
      setPhoneError('Phone number is required.');
      return;
    }
    if (cleanDigits.length < 7 || cleanDigits.length > 15) {
      setPhoneError('Please enter a valid phone number.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setPhoneError('Please enter your full name.');
      return;
    }

    try {
      const mergedTempData = {
        ...tempUserData,
        name: name.trim() || tempUserData?.name,
        phone: `${selectedCountry.dialCode}${cleanDigits}`,
      };

      await sendPhoneOtp(
        cleanDigits,
        selectedCountry.dialCode,
        mode === 'login' ? 'login' : 'signup',
        mergedTempData
      );

      setStep('verify');
      setCountdown(30);
      setCanResend(false);
      setOtp('');
      setOtpError('');
    } catch {
      // Error handled by store
    }
  };

  const handleResendOtp = async () => {
    if (!canResend || isLoading) return;
    clearError();
    const cleanDigits = phone.replace(/\D/g, '');
    try {
      await sendPhoneOtp(
        cleanDigits,
        selectedCountry.dialCode,
        mode === 'login' ? 'login' : 'signup',
        tempUserData
      );
      setCountdown(30);
      setCanResend(false);
      setOtp('');
      setOtpError('');
    } catch {
      // Handled by store
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearError();
    setOtpError('');

    if (otp.length !== 6) {
      setOtpError('Please enter the full 6-digit code.');
      return;
    }

    try {
      const fullPhone = otpSession?.phone || `${selectedCountry.dialCode}${phone.replace(/\D/g, '')}`;
      await verifyPhoneOtp(
        fullPhone,
        otp,
        mode === 'login' ? 'login' : 'signup',
        tempUserData
      );
      onSuccess();
    } catch (err: any) {
      setOtpError(err?.message || 'Invalid OTP. Please check the code.');
    }
  };

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        className="wm-back-btn"
        onClick={() => {
          if (step === 'verify') {
            setStep('input');
            clearError();
          } else {
            onBackToEmail();
          }
        }}
        id="btn-phone-back"
      >
        <ArrowLeft size={14} />
        <span>{step === 'verify' ? 'Change phone number' : 'Back to email sign in'}</span>
      </button>

      {/* Global Error */}
      {error && (
        <div className="wm-alert wm-alert-error" style={{ marginBottom: 16 }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Phone Entry */}
      {step === 'input' && (
        <form onSubmit={handleSendOtp} className="wm-auth-form" noValidate>
          {mode === 'signup' && (
            <div className="wm-form-group">
              <label htmlFor="phone-signup-name" className="wm-label">
                Full name
              </label>
              <input
                id="phone-signup-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="wm-input"
                required
              />
            </div>
          )}

          <PhoneNumberInput
            id="phone-number-input"
            label="Phone number"
            phone={phone}
            selectedCountry={selectedCountry}
            onPhoneChange={(val) => {
              setPhone(val);
              if (phoneError) setPhoneError('');
            }}
            onCountryChange={(country) => setSelectedCountry(country)}
            error={phoneError}
            disabled={isLoading}
          />

          <p style={{ fontSize: '13px', color: 'var(--wm-text-muted)', margin: '0' }}>
            We'll send a 6-digit one-time passcode via SMS to verify your mobile number. Standard carrier rates may apply.
          </p>

          <button
            type="submit"
            className="wm-btn-primary"
            disabled={isLoading}
            id="btn-send-otp"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="wm-spinner" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <span>Send OTP</span>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: 6-Digit OTP Verification */}
      {step === 'verify' && (
        <form onSubmit={handleVerifyOtp} className="wm-auth-form" noValidate>
          <div style={{ textAlign: 'center', marginBottom: 6 }}>
            <p style={{ fontSize: '14px', color: 'var(--wm-text-secondary)', margin: '0 0 6px 0' }}>
              We've sent a 6-digit verification code to
            </p>
            <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--wm-text-primary)' }}>
              {otpSession?.maskedPhone || `${selectedCountry.dialCode} ${phone}`}
            </div>
          </div>

          <div className="wm-form-group">
            <OTPInput
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (otpError) setOtpError('');
              }}
              onComplete={(completedOtp) => {
                setOtp(completedOtp);
              }}
              error={Boolean(otpError)}
              disabled={isLoading}
              autoFocus
            />

            {otpError && (
              <div className="wm-field-error" style={{ justifyContent: 'center' }}>
                <AlertCircle size={12} />
                <span>{otpError}</span>
              </div>
            )}
          </div>

          {/* Resend OTP countdown row */}
          <div className="wm-resend-row">
            <span>Didn't receive the code?</span>
            {canResend ? (
              <button
                type="button"
                className="wm-resend-btn"
                onClick={handleResendOtp}
                disabled={isLoading}
                id="btn-resend-otp"
              >
                Resend OTP
              </button>
            ) : (
              <span style={{ fontWeight: 500 }}>Resend OTP in {countdown}s</span>
            )}
          </div>

          <button
            type="submit"
            className="wm-btn-primary"
            disabled={isLoading || otp.length !== 6}
            id="btn-verify-otp"
            style={{ marginTop: 6 }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="wm-spinner" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default PhoneAuthView;
