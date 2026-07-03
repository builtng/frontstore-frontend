import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
  className?: string;
  text?: string;
}

export default function Logo({
  size = 24,
  showText = true,
  textColor = 'var(--text)',
  className = '',
  text = 'Frontstore',
}: LogoProps) {
  return (
    <div 
      className={`logo-container ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size * 0.35,
        userSelect: 'none',
      }}
    >
      <img 
        src="/logo.png" 
        alt={text}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          flexShrink: 0,
        }}
      />

      {/* Brand Text */}
      {showText && (
        <span 
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: size * 0.9,
            fontWeight: 900,
            color: textColor,
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          {text}
        </span>
      )}
    </div>
  );
}
