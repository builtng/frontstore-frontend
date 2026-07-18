'use client';

import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, Search } from 'lucide-react';
import { PublicSiteNav, PublicSiteFooter } from '@/components/PublicSiteChrome';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <PublicSiteNav />
      
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '60px 20px',
        maxWidth: 600,
        width: '100%',
        margin: '0 auto'
      }}>
        <div 
          className="card" 
          style={{ 
            padding: '40px 32px', 
            textAlign: 'center', 
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-lg)',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            width: '100%'
          }}
        >
          {/* Animated Icon Container */}
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: 'var(--r-full)', 
            background: 'var(--primary-light)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--primary)',
            marginBottom: 8
          }}>
            <FileQuestion size={40} strokeWidth={1.5} />
          </div>

          <div>
            <h1 style={{ 
              fontFamily: 'var(--font-heading)', 
              fontSize: 32, 
              fontWeight: 900, 
              color: 'var(--text)',
              marginBottom: 12
            }}>
              Page Not Found
            </h1>
            <p style={{ 
              fontSize: 15, 
              color: 'var(--text-muted)', 
              lineHeight: 1.6,
              maxWidth: 440,
              margin: '0 auto'
            }}>
              We couldn't find the page you're looking for. The link might be broken, or this price comparison page doesn't have enough merchant data to be generated yet.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 12, 
            width: '100%', 
            maxWidth: 320,
            marginTop: 8
          }}>
            <Link href="/compare" className="btn btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px' }}>
              <Search size={16} /> Compare Prices
            </Link>
            

            
            <Link href="/" className="btn btn-ghost" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', border: '1px solid var(--border)' }}>
              <Home size={16} /> Back to Homepage
            </Link>
          </div>
        </div>
      </main>

      <PublicSiteFooter />
    </div>
  );
}
