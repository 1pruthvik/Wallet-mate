import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface PasswordInputProps {
  id?: string;
  name?: string;
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
  actionLink?: React.ReactNode;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  id = 'password',
  name = 'password',
  label = 'Password',
  value,
  onChange,
  placeholder = 'Enter your password',
  error,
  disabled = false,
  autoComplete = 'current-password',
  required = true,
  actionLink,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="wm-form-group">
      <div className="wm-label-row">
        {label && (
          <label htmlFor={id} className="wm-label">
            {label}
          </label>
        )}
        {actionLink}
      </div>

      <div className="wm-input-wrapper">
        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          required={required}
          className={`wm-input wm-input-with-icon ${error ? 'wm-input-error' : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          className="wm-input-toggle-btn"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && (
        <div id={`${id}-error`} className="wm-field-error">
          <AlertCircle size={12} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
