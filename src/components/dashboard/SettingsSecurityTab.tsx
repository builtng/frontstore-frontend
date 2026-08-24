'use client';

import React from 'react';
import { Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import type { StoreInfo, UserInfo } from '@/types/dashboard';

interface SettingsSecurityTabProps {
  user: UserInfo | null;
  store: StoreInfo | null;
  handlePasswordChange: (e: React.FormEvent) => void;
  cpCurrent: string;
  setCpCurrent: (v: string) => void;
  cpNew: string;
  setCpNew: (v: string) => void;
  cpConfirm: string;
  setCpConfirm: (v: string) => void;
  cpSaving: boolean;
  showCpCurrent: boolean;
  setShowCpCurrent: (v: boolean) => void;
  showCpNew: boolean;
  setShowCpNew: (v: boolean) => void;
  showCpConfirm: boolean;
  setShowCpConfirm: (v: boolean) => void;
}

export default function SettingsSecurityTab({
  user, store, handlePasswordChange,
  cpCurrent, setCpCurrent, cpNew, setCpNew, cpConfirm, setCpConfirm, cpSaving,
  showCpCurrent, setShowCpCurrent, showCpNew, setShowCpNew, showCpConfirm, setShowCpConfirm,
}: SettingsSecurityTabProps) {
  return (
    <>
      {/* SECOND ROW: Security & Context */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="responsive-settings-grid">

        {/* Change Password Card */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <div style={{ background: 'var(--primary-light)', padding: 5, borderRadius: 'var(--r-sm)', color: 'var(--primary)' }}>
              <Key size={14} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800 }}>
              {user?.has_password === false ? 'Set Account Password' : 'Update Password'}
            </h3>
          </div>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Current Password */}
            {user?.has_password !== false && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Current Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCpCurrent ? 'text' : 'password'}
                    value={cpCurrent}
                    onChange={e => setCpCurrent(e.target.value)}
                    className="input-field"
                    placeholder="••••••••"
                    style={{ paddingRight: 40, height: 38, fontSize: 13.5 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCpCurrent(!showCpCurrent)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: 'var(--text-muted)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    {showCpCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCpNew ? 'text' : 'password'}
                  value={cpNew}
                  onChange={e => setCpNew(e.target.value)}
                  className="input-field"
                  placeholder="Min 6 characters"
                  style={{ paddingRight: 40, height: 38, fontSize: 13.5 }}
                />
                <button
                  type="button"
                  onClick={() => setShowCpNew(!showCpNew)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {showCpNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCpConfirm ? 'text' : 'password'}
                  value={cpConfirm}
                  onChange={e => setCpConfirm(e.target.value)}
                  className="input-field"
                  placeholder="Confirm new password"
                  style={{ paddingRight: 40, height: 38, fontSize: 13.5 }}
                />
                <button
                  type="button"
                  onClick={() => setShowCpConfirm(!showCpConfirm)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {showCpConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cpSaving}
              className="btn btn-primary clickable"
              style={{
                width: '100%', padding: '10px', fontSize: 12.5, borderRadius: 'var(--r-md)',
                fontWeight: 800, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {cpSaving ? (
                <>
                  <Loader2 size={14} className="spinner" />
                  Saving...
                </>
              ) : (user?.has_password === false ? 'Set Account Password' : 'Update Password')}
            </button>
          </form>
        </div>

        {/* Identity & Developer contexts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Identity Info Panel */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Identity Context</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Merchant Name</span>
                <span style={{ fontWeight: 800 }}>{user?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sign-in Phone</span>
                <span style={{ fontWeight: 700 }}>{user?.phone_number}</span>
              </div>
              {user?.email && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Registered Email</span>
                  <span style={{ fontWeight: 700 }}>{user.email}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Store Username</span>
                <span style={{ fontWeight: 700 }}>@{store?.username}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </>
  );
}
