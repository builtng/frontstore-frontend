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
  text = 'Aloaye',
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
      {/* Brand Icon SVG */}
      <svg 
        viewBox="0 0 200 200" 
        width={size} 
        height={size} 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(142, 71%, 45%)" />
            <stop offset="50%" stopColor="hsl(158, 84%, 39%)" />
            <stop offset="100%" stopColor="hsl(172, 80%, 35%)" />
          </linearGradient>
        </defs>

        {/* Outer circular 'a' loop */}
        <path 
          d="M 90 30 
             A 60 60 0 1 0 135 130 
             L 135 110 
             A 45 45 0 1 1 90 45 
             A 45 45 0 0 1 135 90 
             L 135 90" 
          fill="url(#logo-grad)" 
        />
        
        {/* Central Chat Bubble */}
        <path 
          d="M 90 60 
             A 25 25 0 0 0 65 85 
             A 25 25 0 0 0 72 101 
             L 66 114 
             L 81 109 
             A 25 25 0 0 0 90 110 
             A 25 25 0 0 0 115 85 
             A 25 25 0 0 0 90 60 Z" 
          fill="url(#logo-grad)" 
          opacity="0.9" 
        />

        {/* Shopping Bag at the lower right base */}
        <g transform="translate(115, 95)">
          {/* Bag Handle */}
          <path d="M 12 12 A 10 10 0 0 1 32 12" fill="none" stroke="url(#logo-grad)" strokeWidth="4.5" strokeLinecap="round" />
          {/* Bag Body */}
          <rect x="4" y="12" width="36" height="32" rx="6" fill="url(#logo-grad)" />
        </g>
      </svg>

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
