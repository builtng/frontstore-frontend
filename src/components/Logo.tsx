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
            <stop offset="0%" stopColor="hsl(290, 100%, 50%)" />
            <stop offset="50%" stopColor="hsl(277, 100%, 41%)" />
            <stop offset="100%" stopColor="hsl(255, 80%, 35%)" />
          </linearGradient>
        </defs>

        <rect
          x="38"
          y="72"
          width="124"
          height="88"
          rx="20"
          fill="url(#logo-grad)"
        />
        <path
          d="M48 46h104l18 34H30l18-34Z"
          fill="url(#logo-grad)"
        />
        <path
          d="M30 80h140"
          stroke="white"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.72"
        />
        <path
          d="M62 80V58M90 80V58M118 80V58M146 80V58"
          stroke="white"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.42"
        />
        <path
          d="M72 106h56a16 16 0 0 1 16 16v2a16 16 0 0 1-16 16H98l-22 15 7-17H72a16 16 0 0 1-16-16 16 16 0 0 1 16-16Z"
          fill="white"
          opacity="0.95"
        />
        <circle cx="86" cy="123" r="5" fill="hsl(277, 100%, 41%)" />
        <circle cx="104" cy="123" r="5" fill="hsl(277, 100%, 41%)" />
        <circle cx="122" cy="123" r="5" fill="hsl(277, 100%, 41%)" />
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
