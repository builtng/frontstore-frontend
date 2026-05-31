'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      gap: 20,
      fontFamily: 'var(--font-heading)'
    }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer glowing pulse ring */}
        <div style={{
          position: 'absolute',
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: '2px solid var(--primary)',
          opacity: 0,
          animation: 'pulse-ring 2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite'
        }} />
        
        {/* Inner rotating dash border */}
        <Loader2 size={36} style={{
          color: 'var(--primary)',
          animation: 'spin-loader 1s linear infinite'
        }} />
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <span style={{
          color: 'var(--text)',
          fontSize: 18,
          fontWeight: 800,
          letterSpacing: '-0.02em'
        }}>
          frontstore
        </span>
        <span style={{
          color: 'var(--text-muted)',
          fontSize: 13,
          fontWeight: 500
        }}>
          Optimizing your speed...
        </span>
      </div>
      
      {/* Styles for keyframes directly injected */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin-loader {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.6); opacity: 0.8; }
            100% { transform: scale(1.3); opacity: 0; }
          }
        `
      }} />
    </div>
  );
}
