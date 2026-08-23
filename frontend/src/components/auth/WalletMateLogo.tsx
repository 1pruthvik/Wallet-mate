import React from 'react';

interface WalletMateLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const WalletMateLogo: React.FC<WalletMateLogoProps> = ({ size = 'md', showText = true }) => {
  const iconSizes = {
    sm: { width: 26, height: 26, iconSize: 14, fontSize: '18px' },
    md: { width: 34, height: 34, iconSize: 18, fontSize: '21px' },
    lg: { width: 44, height: 44, iconSize: 24, fontSize: '26px' },
  };

  const current = iconSizes[size];

  return (
    <div className="wm-brand-logo" style={{ marginBottom: showText ? 20 : 0 }}>
      <div
        className="wm-logo-icon"
        style={{
          width: current.width,
          height: current.height,
          borderRadius: size === 'lg' ? 12 : 8,
        }}
      >
        <svg
          width={current.iconSize}
          height={current.iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Minimalist sleek wallet / shield icon */}
          <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h14a1 1 0 0 1 1 1v3" />
          <path d="M3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z" />
          <circle cx="16" cy="14" r="1.5" fill="currentColor" />
        </svg>
      </div>
      {showText && (
        <span className="wm-brand-name" style={{ fontSize: current.fontSize }}>
          Wallet-mate
        </span>
      )}
    </div>
  );
};

export default WalletMateLogo;
