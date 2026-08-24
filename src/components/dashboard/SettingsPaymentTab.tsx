'use client';

import React from 'react';
import {
  DollarSign, CreditCard, Landmark, ChevronDown, Check, CheckCircle2,
  AlertCircle, Loader2, Truck, Zap,
} from 'lucide-react';
import Toggle from '../Toggle';
import { getCurrencySymbol } from '@/utils/currency';
import type { StoreInfo, UserInfo } from '@/types/dashboard';

interface SettingsPaymentTabProps {
  store: StoreInfo | null;
  user: UserInfo | null;
  isPro: boolean;
  openUpgradePrompt: (title: string, description: string) => void;
  settingsSaving: boolean;
  handleSettingsSave: (e: React.FormEvent) => void;

  isLoadingStripeDashboard: boolean;
  handleOpenStripeDashboard: () => void;
  isConnectingStripe: boolean;
  handleConnectStripe: () => void;
  isGeneratingDedicatedAccount: boolean;
  handleGenerateDedicatedAccount: () => void;

  paymentBankName: string;
  setPaymentBankName: (v: string) => void;
  paymentBankCode: string;
  setPaymentBankCode: (v: string) => void;
  paymentAccountNumber: string;
  setPaymentAccountNumber: (v: string) => void;
  paymentAccountName: string;
  setPaymentAccountName: (v: string) => void;
  setAccountVerified: (v: boolean) => void;
  setNameMatchOk: (v: boolean | null) => void;
  setVerifyError: (v: string) => void;
  bankDropdownOpen: boolean;
  setBankDropdownOpen: (v: boolean) => void;
  bankList: { name: string; code: string }[];
  resolveAccountName: (accountNumber: string, bankCode: string) => void;
  isVerifying: boolean;
  verifyError: string;
  accountVerified: boolean;
  nameMatchOk: boolean | null;

  paymentInstructions: string;
  setPaymentInstructions: (v: string) => void;

  shippingType: string;
  setShippingType: (v: string) => void;
  shippingFreeThreshold: string;
  setShippingFreeThreshold: (v: string) => void;
  shippingFlatFee: string;
  setShippingFlatFee: (v: string) => void;
  shippingCustomRules: { min_subtotal: string; fee: string }[];
  setShippingCustomRules: React.Dispatch<React.SetStateAction<{ min_subtotal: string; fee: string }[]>>;
  shippingHandlingFee: string;
  setShippingHandlingFee: (v: string) => void;

  momoAgentEnabled: boolean;
  setMomoAgentEnabled: (v: boolean) => void;
  momoAgentNetwork: string;
  setMomoAgentNetwork: (v: string) => void;
  momoAgentNumber: string;
  setMomoAgentNumber: (v: string) => void;
  momoAgentName: string;
  setMomoAgentName: (v: string) => void;
}

export default function SettingsPaymentTab({
  store, user, isPro, openUpgradePrompt, settingsSaving, handleSettingsSave,
  isLoadingStripeDashboard, handleOpenStripeDashboard, isConnectingStripe, handleConnectStripe,
  isGeneratingDedicatedAccount, handleGenerateDedicatedAccount,
  paymentBankName, setPaymentBankName, paymentBankCode, setPaymentBankCode,
  paymentAccountNumber, setPaymentAccountNumber, paymentAccountName, setPaymentAccountName,
  setAccountVerified, setNameMatchOk, setVerifyError, bankDropdownOpen, setBankDropdownOpen,
  bankList, resolveAccountName, isVerifying, verifyError, accountVerified, nameMatchOk,
  paymentInstructions, setPaymentInstructions,
  shippingType, setShippingType, shippingFreeThreshold, setShippingFreeThreshold,
  shippingFlatFee, setShippingFlatFee, shippingCustomRules, setShippingCustomRules,
  shippingHandlingFee, setShippingHandlingFee,
  momoAgentEnabled, setMomoAgentEnabled, momoAgentNetwork, setMomoAgentNetwork,
  momoAgentNumber, setMomoAgentNumber, momoAgentName, setMomoAgentName,
}: SettingsPaymentTabProps) {
  return (
    <>
      {/* ── PAYMENT ACCOUNTS CARD ── */}
      {store?.payment_provider === 'stripe' ? (
      <div className="card" style={{ padding: 28 }}>

        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)', flexShrink: 0
          }}>
            <DollarSign size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
              Withdrawal & Payout Account
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Connect your Stripe account to receive checkout payments and payouts in {(store?.currency_code || 'NGN').toUpperCase()}.
            </p>
          </div>
        </div>

        <div style={{
          padding: 18,
          borderRadius: 'var(--r-xl)',
          border: '1.5px solid var(--border)',
          background: store?.stripe_payouts_enabled
            ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(15,23,42,0.03))'
            : 'var(--surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <CreditCard size={18} color="var(--primary)" />
              <strong style={{ fontSize: 14.5 }}>Stripe Connect account</strong>
              {store?.stripe_payouts_enabled && (
                <span className="badge badge-primary" style={{ fontSize: 10 }}>Active</span>
              )}
              {store?.stripe_account_id && !store?.stripe_payouts_enabled && (
                <span className="badge" style={{ fontSize: 10 }}>Onboarding incomplete</span>
              )}
            </div>
            {store?.stripe_account_id ? (
              <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                {store.stripe_payouts_enabled
                  ? 'Payouts are enabled — checkout payments will be deposited to your connected Stripe account.'
                  : 'Account created — finish Stripe onboarding to enable charges and payouts.'}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Connect a Stripe Express account so buyers can check out and your earnings are paid out automatically.
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {store?.stripe_payouts_enabled && (
              <button
                type="button"
                className="btn btn-secondary clickable"
                onClick={handleOpenStripeDashboard}
                disabled={isLoadingStripeDashboard}
                style={{ padding: '11px 16px', borderRadius: 'var(--r-lg)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
              >
                {isLoadingStripeDashboard ? <><Loader2 size={15} className="spinner" /> Opening...</> : 'Open Stripe dashboard'}
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary clickable"
              onClick={handleConnectStripe}
              disabled={isConnectingStripe}
              style={{ padding: '11px 16px', borderRadius: 'var(--r-lg)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {isConnectingStripe ? <><Loader2 size={15} className="spinner" /> Connecting...</> : store?.stripe_account_id ? 'Continue onboarding' : 'Connect Stripe'}
            </button>
          </div>
        </div>

      </div>
      ) : (
      <div className="card" style={{ padding: 28 }}>

        {/* Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37, 211, 102, 0.35)', flexShrink: 0
          }}>
            <DollarSign size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
              Withdrawal & Payout Bank Details
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Configure the bank account where your store earnings are paid. Customer payments will be made to your dedicated virtual account or via standard Paystack checkout.
            </p>
          </div>
        </div>

        {/* Step 1: Bank selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{
            padding: 18,
            borderRadius: 'var(--r-xl)',
            border: '1.5px solid var(--border)',
            background: store?.paystack_dva_active
              ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(15,23,42,0.03))'
              : 'var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Landmark size={18} color="var(--primary)" />
                <strong style={{ fontSize: 14.5 }}>Dedicated Paystack account</strong>
                {store?.paystack_dva_active && (
                  <span className="badge badge-primary" style={{ fontSize: 10 }}>Active</span>
                )}
                {!isPro && (
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: 'var(--danger)', padding: '2px 7px', borderRadius: 'var(--r-full)' }}>Pro</span>
                )}
              </div>
              {store?.paystack_dva_account_number ? (
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  {store.paystack_dva_bank_name || 'Paystack'} · <strong>{store.paystack_dva_account_number}</strong> · {store.paystack_dva_account_name}
                </p>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Generate a dedicated virtual account that buyers pay into directly through Paystack.
                </p>
              )}
            </div>
            <button
              type="button"
              className="btn btn-primary clickable"
              onClick={() => {
                if (!isPro) {
                  openUpgradePrompt(
                    'Dedicated Virtual Account requires Pro',
                    'Upgrade to Pro to generate or manage a dedicated virtual account for your storefront, enabling automated tracking of buyer bank transfers.'
                  );
                  return;
                }
                handleGenerateDedicatedAccount();
              }}
              disabled={isGeneratingDedicatedAccount}
              style={{ padding: '11px 16px', borderRadius: 'var(--r-lg)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {isGeneratingDedicatedAccount ? (
                <><Loader2 size={15} className="spinner" /> Generating...</>
              ) : !isPro ? (
                <><Zap size={14} /> Unlock with Pro</>
              ) : store?.paystack_dva_account_number ? (
                'Refresh account'
              ) : (
                'Generate account'
              )}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

            {/* Bank Searchable Dropdown */}
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Bank / Provider
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={paymentBankName}
                  onChange={e => {
                    setPaymentBankName(e.target.value);
                    setPaymentBankCode('');
                    setPaymentAccountName('');
                    setAccountVerified(false);
                    setNameMatchOk(null);
                    setVerifyError('');
                    setBankDropdownOpen(true);
                  }}
                  onFocus={() => setBankDropdownOpen(true)}
                  className="input-field"
                  placeholder={bankList.length > 0 ? 'Search bank or provider...' : 'Loading banks...'}
                  id="payment-bank-name"
                  autoComplete="off"
                />
                <ChevronDown size={14} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
              </div>
              {/* Bank dropdown list */}
              {bankDropdownOpen && (() => {
                const q = paymentBankName.toLowerCase();
                const filtered = bankList.filter(b => b.name.toLowerCase().includes(q));
                if (filtered.length === 0) return null;
                return (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 300,
                    background: 'var(--surface)', border: '1.5px solid var(--border)',
                    borderRadius: 'var(--r-lg)', boxShadow: 'var(--shadow-lg)',
                    maxHeight: 230, overflowY: 'auto', marginTop: 4,
                  }}>
                    {filtered.map((bank, i) => (
                      <button
                        key={bank.code}
                        type="button"
                        onMouseDown={e => {
                          e.preventDefault();
                          setPaymentBankName(bank.name);
                          setPaymentBankCode(bank.code);
                          setBankDropdownOpen(false);
                          // Auto-resolve if account number already entered
                          if (paymentAccountNumber.length === 10) {
                            resolveAccountName(paymentAccountNumber, bank.code);
                          }
                        }}
                        style={{
                          width: '100%', textAlign: 'left', background: 'none',
                          border: 'none', padding: '10px 14px', fontSize: 13.5,
                          fontWeight: 600, cursor: 'pointer', color: 'var(--text)',
                          borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                          display: 'flex', alignItems: 'center', gap: 8,
                          transition: 'background var(--t-fast)',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        <Landmark size={16} color="var(--text-muted)" />
                        <span style={{ flex: 1 }}>{bank.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-faint)', fontFamily: 'monospace' }}>{bank.code}</span>
                      </button>
                    ))}
                  </div>
                );
              })()}
              {paymentBankCode && (
                <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={11} /> Bank selected
                </span>
              )}
            </div>

            {/* Account Number — auto-resolves on 10 digits */}
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Account Number
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={paymentAccountNumber}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '');
                    setPaymentAccountNumber(val);
                    setPaymentAccountName('');
                    setAccountVerified(false);
                    setNameMatchOk(null);
                    setVerifyError('');
                    if (val.length === 10 && paymentBankCode) {
                      resolveAccountName(val, paymentBankCode);
                    }
                  }}
                  className="input-field"
                  placeholder="10-digit account number"
                  id="payment-account-number"
                  style={{
                    paddingRight: 44,
                    fontFamily: 'monospace',
                    letterSpacing: '0.08em',
                    fontSize: 15,
                    borderColor: accountVerified ? '#25D366' : undefined,
                  }}
                />
                {/* Right-side indicator */}
                <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}>
                  {isVerifying ? (
                    <Loader2 size={15} className="spinner" style={{ color: 'var(--primary)' }} />
                  ) : accountVerified ? (
                    <span style={{ color: '#25D366', display: 'flex' }}><CheckCircle2 size={17} /></span>
                  ) : paymentAccountNumber.length === 10 && paymentBankCode ? (
                    <span style={{ color: 'var(--danger)', display: 'flex' }}><AlertCircle size={17} /></span>
                  ) : null}
                </div>
              </div>
              {/* Resolve status messages */}
              {isVerifying && (
                <p style={{ fontSize: 11.5, color: 'var(--primary)', marginTop: 5, fontWeight: 600 }}>⏳ Verifying account with Paystack...</p>
              )}
              {verifyError && !isVerifying && (
                <p style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 5, fontWeight: 600 }}>⚠️ {verifyError}</p>
              )}
              {!paymentBankCode && paymentAccountNumber.length > 0 && (
                <p style={{ fontSize: 11.5, color: 'var(--accent)', marginTop: 5, fontWeight: 600 }}>⬆️ Please select a bank first.</p>
              )}
            </div>

          </div>

          {/* Verified Account Name — read-only result */}
          {(accountVerified || isVerifying) && (
            <div style={{
              padding: '16px 20px',
              borderRadius: 'var(--r-lg)',
              border: `2px solid ${nameMatchOk === false ? 'var(--danger)' : '#25D366'}`,
              background: nameMatchOk === false ? 'rgba(239,68,68,0.06)' : 'rgba(37, 211, 102, 0.07)',
              display: 'flex', flexDirection: 'column', gap: 6,
              transition: 'all 0.3s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Verified Account Name</span>
                  <p style={{ fontSize: 16, fontWeight: 900, marginTop: 2, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
                    {paymentAccountName || '...'}
                  </p>
                </div>
                {nameMatchOk === true && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: '#25D366', color: '#fff',
                    padding: '5px 12px', borderRadius: 'var(--r-full)',
                    fontSize: 12, fontWeight: 800
                  }}>
                    <Check size={13} /> Name Match
                  </span>
                )}
                {nameMatchOk === false && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'var(--danger)', color: '#fff',
                    padding: '5px 12px', borderRadius: 'var(--r-full)',
                    fontSize: 12, fontWeight: 800
                  }}>
                    <AlertCircle size={13} /> Mismatch
                  </span>
                )}
              </div>
              {nameMatchOk === false && (
                <p style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, marginTop: 4, lineHeight: 1.5 }}>
                  ⚠️ The verified name <strong>{paymentAccountName}</strong> does not match your registered name (<strong>{user?.name}</strong>) or store name. Please use a bank account that matches your identity.
                </p>
              )}
              {nameMatchOk === true && (
                <p style={{ fontSize: 12, color: '#25D366', fontWeight: 600, marginTop: 2 }}>
                  ✅ Account verified — name matches your profile. You can save.
                </p>
              )}
            </div>
          )}

          {/* Payment Instructions */}
          <div>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Payment Instructions <span style={{ fontWeight: 500, textTransform: 'none', color: 'var(--text-faint)', fontSize: 11 }}>(optional)</span>
            </label>
            <textarea
              rows={2}
              value={paymentInstructions}
              onChange={e => setPaymentInstructions(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical' }}
              placeholder="e.g. Send payment screenshot to WhatsApp after transfer."
              id="payment-instructions"
            />
            <span style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 4, display: 'block' }}>Shown to buyers after checkout so they know next steps.</span>
          </div>

          {/* Shipping & Delivery Fees */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, background: 'var(--card-hover)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck size={17} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Shipping &amp; Delivery Fees</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
                  Frontstore never covers delivery costs — whatever you charge here is what the customer pays at checkout.
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Shipping Type</label>
              <select
                value={shippingType}
                onChange={e => setShippingType(e.target.value)}
                className="input"
                id="shipping-type"
              >
                <option value="customer_pays">Customer pays shipping (default)</option>
                <option value="free">Free shipping</option>
                <option value="free_above_threshold">Free shipping above an order amount</option>
                <option value="flat_rate">Flat-rate shipping</option>
                <option value="custom">Custom rules by order amount</option>
              </select>
            </div>

            {(shippingType === 'customer_pays' || shippingType === 'flat_rate' || shippingType === 'free_above_threshold') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {shippingType === 'free_above_threshold' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                      Free Above ({getCurrencySymbol(store?.currency_code)})
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={shippingFreeThreshold}
                      onChange={e => setShippingFreeThreshold(e.target.value)}
                      className="input"
                      placeholder="e.g. 50000"
                      id="shipping-free-threshold"
                    />
                  </div>
                )}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                    {shippingType === 'free_above_threshold' ? 'Fee Below Threshold' : 'Shipping Fee'} ({getCurrencySymbol(store?.currency_code)})
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={shippingFlatFee}
                    onChange={e => setShippingFlatFee(e.target.value)}
                    className="input"
                    placeholder="e.g. 2500"
                    id="shipping-flat-fee"
                  />
                </div>
              </div>
            )}

            {shippingType === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Charge different fees depending on the order subtotal. The highest threshold the order clears wins.
                </span>
                {shippingCustomRules.map((rule, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, alignItems: 'center' }}>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={rule.min_subtotal}
                      onChange={e => setShippingCustomRules(prev => prev.map((r, i) => i === idx ? { ...r, min_subtotal: e.target.value } : r))}
                      className="input"
                      placeholder={`Order total ≥ (${getCurrencySymbol(store?.currency_code)})`}
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={rule.fee}
                      onChange={e => setShippingCustomRules(prev => prev.map((r, i) => i === idx ? { ...r, fee: e.target.value } : r))}
                      className="input"
                      placeholder={`Fee (${getCurrencySymbol(store?.currency_code)})`}
                    />
                    <button
                      type="button"
                      onClick={() => setShippingCustomRules(prev => prev.filter((_, i) => i !== idx))}
                      className="btn btn-outline"
                      style={{ padding: '8px 12px' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setShippingCustomRules(prev => [...prev, { min_subtotal: '', fee: '' }])}
                  className="btn btn-outline"
                  style={{ alignSelf: 'flex-start' }}
                >
                  + Add rule
                </button>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
                Handling Fee ({getCurrencySymbol(store?.currency_code)}) <span style={{ fontWeight: 500, textTransform: 'none', color: 'var(--text-faint)', fontSize: 11 }}>(optional, added on top)</span>
              </label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={shippingHandlingFee}
                onChange={e => setShippingHandlingFee(e.target.value)}
                className="input"
                placeholder="e.g. 500"
                id="shipping-handling-fee"
                style={{ maxWidth: 220 }}
              />
            </div>
          </div>

          {/* MTN MoMo Agent — only shown in supported countries */}
          {['NG','GH','UG','CM','CI','BJ','SN'].includes((store?.country_code || '').toUpperCase()) && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, background: 'var(--card-hover)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#FFCC00,#FF6600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 17 }}>📲</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>MTN MoMo Agent</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>Customers pay directly to your mobile money number</div>
                </div>
              </div>
              <Toggle
                checked={momoAgentEnabled}
                onChange={val => setMomoAgentEnabled(val)}
                id="momo-agent-toggle"
              />
            </div>

            {momoAgentEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Network</label>
                  <select
                    value={momoAgentNetwork}
                    onChange={e => setMomoAgentNetwork(e.target.value)}
                    className="input"
                    id="momo-agent-network"
                  >
                    <option value="mtn">MTN MoMo</option>
                    <option value="vodafone">Vodafone Cash</option>
                    <option value="airtel">Airtel Money</option>
                    <option value="tigo">Tigo Cash</option>
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Agent Number</label>
                    <input
                      type="tel"
                      value={momoAgentNumber}
                      onChange={e => setMomoAgentNumber(e.target.value.replace(/\D/g, ''))}
                      className="input"
                      placeholder="e.g. 0241234567"
                      maxLength={15}
                      id="momo-agent-number"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Account Name</label>
                    <input
                      type="text"
                      value={momoAgentName}
                      onChange={e => setMomoAgentName(e.target.value)}
                      className="input"
                      placeholder="e.g. John's Fashion Store"
                      maxLength={120}
                      id="momo-agent-name"
                    />
                  </div>
                </div>
                <div style={{ background: 'rgba(255,204,0,0.08)', border: '1px solid rgba(255,204,0,0.25)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  💡 When enabled, customers will see your MoMo number and payment instructions immediately after checkout. You confirm payment manually in the Orders section.
                </div>
              </div>
            )}
          </div>
          )}

          {/* Save Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', paddingTop: 4 }}>
            <button
              onClick={handleSettingsSave as any}
              disabled={settingsSaving || !accountVerified || nameMatchOk === false}
              className="btn btn-primary clickable"
              style={{ padding: '13px 28px', borderRadius: 'var(--r-xl)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              {settingsSaving ? <><Loader2 size={16} className="spinner" /> Saving...</> : <><CreditCard size={16} /> Save Payment Details</>}
            </button>
            {!accountVerified && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                Account must be verified before saving.
              </span>
            )}
            {accountVerified && nameMatchOk === false && (
              <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>
                Name mismatch — cannot save until resolved.
              </span>
            )}
          </div>

        </div>
      </div>
      )}
    </>
  );
}
