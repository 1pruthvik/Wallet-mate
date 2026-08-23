import React from 'react';

interface AuthDividerProps {
  text?: string;
}

export const AuthDivider: React.FC<AuthDividerProps> = ({ text = 'Or sign in with' }) => {
  return (
    <div className="wm-auth-divider">
      <span className="wm-auth-divider-text">{text}</span>
    </div>
  );
};

export default AuthDivider;
