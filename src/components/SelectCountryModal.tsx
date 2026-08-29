'use client';

import React, { useState } from 'react';
import { X, Check, Search } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', dialCode: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', dialCode: '+233', flag: '🇬🇭' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
  { code: 'UG', name: 'Uganda', dialCode: '+256', flag: '🇺🇬' },
  { code: 'RW', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼' },
  { code: 'CM', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲' },
  { code: 'CI', name: 'Ivory Coast', dialCode: '+225', flag: '🇨🇮' },
  { code: 'SN', name: 'Senegal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'TZ', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
];

export const COUNTRY_STORAGE_KEY = 'frontstore_country_code';

export function getSavedCountry(): Country {
  if (typeof window === 'undefined') return COUNTRIES[0];
  try {
    const saved = localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (saved) {
      const found = COUNTRIES.find((c) => c.code.toUpperCase() === saved.toUpperCase());
      if (found) return found;
    }
  } catch {}
  return COUNTRIES[0];
}

export function saveCountry(country: Country | string): void {
  if (typeof window === 'undefined') return;
  try {
    const code = typeof country === 'string' ? country : country.code;
    localStorage.setItem(COUNTRY_STORAGE_KEY, code.toUpperCase());
  } catch {}
}

export async function detectAndSaveCountry(): Promise<Country | null> {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (saved) {
      const found = COUNTRIES.find((c) => c.code.toUpperCase() === saved.toUpperCase());
      if (found) return found;
    }
    const apiUrl = getApiUrl();
    const res = await fetch(`${apiUrl}/v1/meta/detect-location`);
    if (!res.ok) return null;
    const json = await res.json();
    const code = json.data?.country_code;
    if (code) {
      const detected = COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
      if (detected) {
        saveCountry(detected);
        return detected;
      }
    }
  } catch {}
  return null;
}

interface SelectCountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: Country;
  onSelectCountry: (country: Country) => void;
}

export default function SelectCountryModal({
  isOpen,
  onClose,
  selectedCountry,
  onSelectCountry,
}: SelectCountryModalProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dialCode.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'rgba(10, 5, 30, 0.65)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#FFFFFF',
          borderRadius: 20,
          boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid #F0F0F3',
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 700,
              color: '#111827',
              fontFamily: 'var(--font-heading, system-ui, sans-serif)',
            }}
          >
            Select Country
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: '1px solid #E5E7EB',
              background: '#F9FAFB',
              color: '#6B7280',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search input */}
        <div style={{ padding: '12px 20px 4px 20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              background: '#F7F7FA',
              borderRadius: 12,
              border: '1px solid #EAEAEA',
            }}
          >
            <Search size={16} style={{ color: '#9CA3AF' }} />
            <input
              type="text"
              placeholder="Search country or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: 14,
                color: '#111827',
              }}
            />
          </div>
        </div>

        {/* Country List */}
        <div
          style={{
            maxHeight: 320,
            overflowY: 'auto',
            padding: '8px 12px 16px 12px',
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
              No countries found
            </div>
          ) : (
            filtered.map((country) => {
              const isSelected = selectedCountry.code === country.code;
              return (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    saveCountry(country);
                    onSelectCountry(country);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: 'none',
                    background: isSelected ? '#F9FAFB' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#F9FAFB';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{country.flag}</span>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected ? '#111827' : '#374151',
                      }}
                    >
                      {country.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>
                      {country.dialCode}
                    </span>
                    {isSelected && (
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: '#10B981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                        }}
                      >
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
