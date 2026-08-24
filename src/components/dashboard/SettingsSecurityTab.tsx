'use client';

import React from 'react';
import { Key, Eye, EyeOff, Loader2, ShieldCheck, User, Phone, Mail, Store, Lock, CheckCircle2 } from 'lucide-react';
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

  // Simple password strength check for visual feedback
  const getStrength = (pass: string) => {
    if (!pass) return { label: '', color: 'transparent' };
    if (pass.length < 6) return { label: 'Too short (min 6 chars)', color: '#ef4444' };
    if (pass.length < 10) return { label: 'Good password', color: '#f59e0b' };
    return { label: 'Strong password', color: '#10b981' };
  };

  const strength = getStrength(cpNew);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }} className="responsive-settings-grid">

      {/* Change Password Card */}
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* Card Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px var(--primary-light)', flexShrink: 0
            }}>
              <Key size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, margin: 0 }}>
                {user?.has_password === false ? 'Set Account Password' : 'Update Password'}
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Manage your credentials to secure your merchant dashboard.
              </p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Current Password */}
            {user?.has_password !== false && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCpCurrent ? 'text' : 'password'}
                    value={cpCurrent}
                    onChange={e => setCpCurrent(e.target.value)}
                    className="input-field"
                    placeholder="Enter current password"
                    style={{ paddingRight: 40, height: 42, fontSize: 13.5 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCpCurrent(!showCpCurrent)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  New Password
                </label>
                {strength.label && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>
                    {strength.label}
                  </span>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCpNew ? 'text' : 'password'}
                  value={cpNew}
                  onChange={e => setCpNew(e.target.value)}
                  className="input-field"
                  placeholder="Minimum 6 characters"
                  style={{ paddingRight: 40, height: 42, fontSize: 13.5 }}
                />
                <button
                  type="button"
                  onClick={() => setShowCpNew(!showCpNew)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  {showCpNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCpConfirm ? 'text' : 'password'}
                  value={cpConfirm}
                  onChange={e => setCpConfirm(e.target.value)}
                  className="input-field"
                  placeholder="Repeat new password"
                  style={{ paddingRight: 40, height: 42, fontSize: 13.5 }}
                />
                <button
                  type="button"
                  onClick={() => setShowCpConfirm(!showCpConfirm)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
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
                width: '100%', height: 42, fontSize: 13, borderRadius: 'var(--r-md)',
                fontWeight: 800, marginTop: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              {cpSaving ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  Updating Credentials...
                </>
              ) : (
                <>
                  <Lock size={15} />
                  {user?.has_password === false ? 'Set Account Password' : 'Save Password Changes'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Account Security Profile Panel */}
      <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: 'rgba(16, 185, 129, 0.1)', color: '#10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 800, margin: 0 }}>
                Security &amp; Identity
              </h3>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Account verification &amp; identity details.
              </p>
            </div>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
            background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4
          }}>
            <CheckCircle2 size={12} /> Active
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Item 1: Merchant Name */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            background: 'var(--card-hover)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)'
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <User size={15} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Merchant Name</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Store Owner'}</div>
            </div>
          </div>

          {/* Item 2: Sign-in Phone */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            background: 'var(--card-hover)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)'
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Phone size={15} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Sign-in Phone</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)' }}>{user?.phone_number || 'Not connected'}</div>
            </div>
          </div>

          {/* Item 3: Registered Email */}
          {user?.email && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              background: 'var(--card-hover)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)'
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                <Mail size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Registered Email</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
              </div>
            </div>
          )}

          {/* Item 4: Store Handle */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            background: 'var(--card-hover)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)'
          }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <Store size={15} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Store Username</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>@{store?.username || 'store'}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

