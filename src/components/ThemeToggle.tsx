'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDashboard = typeof window !== 'undefined' && (window.location.pathname.startsWith('/dashboard') || window.location.pathname.startsWith('/admin'));
    const defaultTheme = isDashboard ? 'dark' : 'light';
    const saved = localStorage.getItem('frontstore-theme') || defaultTheme;
    const dark = saved === 'dark';
    setIsDark(dark);
    // Ensure DOM class matches localStorage
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    // Eagerly set default in localStorage if not set yet
    if (typeof window !== 'undefined' && !localStorage.getItem('frontstore-theme')) {
      localStorage.setItem('frontstore-theme', defaultTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem('frontstore-theme', nextDark ? 'dark' : 'light');

    const root = document.documentElement;
    root.classList.add('theme-switching');
    if (nextDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    setTimeout(() => root.classList.remove('theme-switching'), 300);
  };

  if (!mounted) {
    return <div style={{ width: 38, height: 38 }} />;
  }

  return (
    <button
      onClick={toggleTheme}
      className="clickable"
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      style={{
        width: 38,
        height: 38,
        border: '1.5px solid var(--border-strong)',
        borderRadius: 'var(--r-md)',
        background: 'var(--surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: isDark ? 'hsl(38, 92%, 50%)' : 'hsl(215, 25%, 27%)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'all var(--t-normal) var(--ease)',
        position: 'relative',
        overflow: 'hidden',
        padding: 0,
      }}
      aria-label="Toggle theme"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--primary)';
        e.currentTarget.style.background = 'var(--surface-2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.background = 'var(--surface)';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform var(--t-normal) var(--ease)',
          transform: isDark ? 'rotate(360deg) scale(1)' : 'rotate(0deg) scale(1)',
        }}
      >
        {isDark ? (
          <Sun size={18} strokeWidth={2.5} />
        ) : (
          <Moon size={18} strokeWidth={2.5} />
        )}
      </div>
    </button>
  );
}
