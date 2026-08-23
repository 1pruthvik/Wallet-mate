import React from 'react';
import { Check, Circle } from 'lucide-react';

interface PasswordRequirementsProps {
  password?: string;
}

export const checkPasswordRequirements = (password: string = '') => {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
};

export const isPasswordValid = (password: string = '') => {
  const reqs = checkPasswordRequirements(password);
  return reqs.minLength && reqs.hasUpper && reqs.hasLower && reqs.hasNumber && reqs.hasSpecial;
};

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password = '' }) => {
  const reqs = checkPasswordRequirements(password);

  const items = [
    { label: '8+ characters', valid: reqs.minLength },
    { label: 'Uppercase letter (A-Z)', valid: reqs.hasUpper },
    { label: 'Lowercase letter (a-z)', valid: reqs.hasLower },
    { label: 'Number (0-9)', valid: reqs.hasNumber },
    { label: 'Special character (!@#$%)', valid: reqs.hasSpecial },
  ];

  return (
    <div className="wm-password-reqs">
      <div className="wm-req-title">Password Requirements</div>
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`wm-req-item ${item.valid ? 'wm-req-valid' : ''}`}
        >
          {item.valid ? (
            <Check size={14} className="wm-req-icon" />
          ) : (
            <Circle size={14} className="wm-req-icon" style={{ opacity: 0.4 }} />
          )}
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default PasswordRequirements;
