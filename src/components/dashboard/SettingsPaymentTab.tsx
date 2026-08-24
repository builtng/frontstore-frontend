'use client';

import React from 'react';
import {
  DollarSign, CreditCard, Landmark, ChevronDown, Check, CheckCircle2,
  AlertCircle, Loader2, Truck, Zap,
} from 'lucide-react';
import Toggle from '../Toggle';
import SearchableSelect from '../SearchableSelect';
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
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px var(--primary-light)', flexShrink: 0
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

        {/* Main Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px var(--primary-light)', flexShrink: 0
          }}>
            <DollarSign size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
              Withdrawal &amp; Payout Settings
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              Configure your bank payout destination, checkout payment instructions, and delivery rates.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Dedicated Virtual Account Banner */}
          <div style={{
            padding: 20,
            borderRadius: 'var(--r-xl)',
            border: '1px solid var(--border)',
            background: store?.paystack_dva_active
              ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(15,23,42,0.03))'
              : 'var(--card-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Landmark size={18} color="var(--primary)" />
                <strong style={{ fontSize: 14.5 }}>Dedicated Paystack Account</strong>
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
              style={{ padding: '11px 18px', borderRadius: 'var(--r-lg)', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8 }}
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

          {/* Section 1: Manual Bank Payout Details */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, background: 'var(--card-hover)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--primary)' }}>
                <Landmark size={18} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Bank Account Details</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
                  Receiving bank account for manual transfers and Paystack settlements.
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
              {/* Bank Searchable Dropdown */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
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
                    style={{ height: 42, fontSize: 13.5 }}
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

              {/* Account Number */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
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
                      height: 42,
                      paddingRight: 44,
                      fontFamily: 'monospace',
                      letterSpacing: '0.08em',
                      fontSize: 15,
                      borderColor: accountVerified ? '#25D366' : undefined,
                    }}
                  />
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

            {/* Verified Account Name banner */}
            {(accountVerified || isVerifying) && (
              <div style={{
                padding: '14px 18px',
                borderRadius: 'var(--r-md)',
                border: `1.5px solid ${nameMatchOk === false ? 'var(--danger)' : '#25D366'}`,
                background: nameMatchOk === false ? 'rgba(239,68,68,0.06)' : 'rgba(37, 211, 102, 0.07)',
                display: 'flex', flexDirection: 'column', gap: 6,
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Verified Account Name</span>
                    <p style={{ fontSize: 15, fontWeight: 900, marginTop: 2, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
                      {paymentAccountName || '...'}
                    </p>
                  </div>
                  {nameMatchOk === true && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: '#25D366', color: '#fff',
                      padding: '4px 10px', borderRadius: 'var(--r-full)',
                      fontSize: 11.5, fontWeight: 800
                    }}>
                      <Check size={12} /> Name Verified
                    </span>
                  )}
                  {nameMatchOk === false && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'var(--danger)', color: '#fff',
                      padding: '4px 10px', borderRadius: 'var(--r-full)',
                      fontSize: 11.5, fontWeight: 800
                    }}>
                      <AlertCircle size={12} /> Name Mismatch
                    </span>
                  )}
                </div>
                {nameMatchOk === false && (
                  <p style={{ fontSize: 11.5, color: 'var(--danger)', fontWeight: 600, marginTop: 2, lineHeight: 1.4 }}>
                    ⚠️ Account name <strong>{paymentAccountName}</strong> does not match profile name <strong>{user?.name}</strong>.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Payment Instructions */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, background: 'var(--card-hover)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800 }}>Payment Instructions <span style={{ fontWeight: 500, color: 'var(--text-faint)', fontSize: 11 }}>(optional)</span></div>
              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                Custom instructions shown to buyers on the confirmation screen after checkout.
              </div>
            </div>
            <textarea
              rows={2}
              value={paymentInstructions}
              onChange={e => setPaymentInstructions(e.target.value)}
              className="input-field"
              style={{ resize: 'vertical', fontSize: 13 }}
              placeholder="e.g. Please send payment screenshot to WhatsApp (+234...) after bank transfer."
              id="payment-instructions"
            />
          </div>

          {/* Section 3: Shipping & Delivery Fees */}
          {store?.business_persona === 'creator-digital' || store?.store_template === 'digital-studio' ? (
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, background: 'var(--card-hover)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck size={17} color="var(--text-muted)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>Physical Shipping (Digital Store)</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                  Your store is configured for instant digital downloads. Delivery fees are automatically skipped at checkout.
                </div>
              </div>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, background: 'var(--card-hover)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Truck size={17} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>Shipping &amp; Delivery Fees</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
                    Set the delivery fee added to your customer's order total at checkout.
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Shipping Rate Structure</label>
                <SearchableSelect
                  value={shippingType}
                  onChange={v => setShippingType(v)}
                  searchable={false}
                  options={[
                    { value: 'customer_pays', label: 'Standard flat delivery fee' },
                    { value: 'free', label: 'Free delivery (₦0.00)' },
                    { value: 'free_above_threshold', label: 'Free delivery above order threshold' },
                    { value: 'flat_rate', label: 'Flat rate per order' },
                    { value: 'custom', label: 'Custom rates by order total' },
                  ]}
                />
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
                        style={{ height: 42, fontSize: 13.5 }}
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
                      style={{ height: 42, fontSize: 13.5 }}
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
                  style={{ maxWidth: 240, height: 42, fontSize: 13.5 }}
                />
              </div>
            </div>
          )}

          {/* Section 4: MTN MoMo Agent */}
          {['NG','GH','UG','CM','CI','BJ','SN'].includes((store?.country_code || '').toUpperCase()) && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, background: 'var(--card-hover)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#FFCC00,#FF6600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(255,102,0,0.2)' }}>
                  <span style={{ fontSize: 18 }}>📲</span>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>MTN MoMo Mobile Money</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>Allow customers to pay directly to your mobile money account</div>
                </div>
              </div>
              <Toggle
                checked={momoAgentEnabled}
                onChange={val => setMomoAgentEnabled(val)}
                id="momo-agent-toggle"
              />
            </div>

            {momoAgentEnabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Network</label>
                  <SearchableSelect
                    value={momoAgentNetwork}
                    onChange={v => setMomoAgentNetwork(v)}
                    searchable={false}
                    options={[
                      { value: 'mtn', label: 'MTN MoMo' },
                      { value: 'vodafone', label: 'Vodafone Cash' },
                      { value: 'airtel', label: 'Airtel Money' },
                      { value: 'tigo', label: 'Tigo Cash' },
                    ]}
                  />
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
                      style={{ height: 42, fontSize: 13.5 }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Account Name</label>
                    <input
                      type="text"
                      value={momoAgentName}
                      onChange={e => setMomoAgentName(e.target.value)}
                      className="input"
                      placeholder="e.g. John's Store"
                      maxLength={120}
                      id="momo-agent-name"
                      style={{ height: 42, fontSize: 13.5 }}
                    />
                  </div>
                </div>
                <div style={{ background: 'rgba(255,204,0,0.1)', border: '1px solid rgba(255,204,0,0.3)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5 }}>
                  💡 Customers see your MoMo details after checkout and upload transfer confirmation.
                </div>
              </div>
            )}
          </div>
          )}

          {/* Section 5: Save Action Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap'
          }}>
            {(() => {
              const isEnteringBankDetails = paymentAccountNumber.trim().length > 0 || paymentBankCode.trim().length > 0;
              const isUnverifiedBank = isEnteringBankDetails && !accountVerified;
              const isNameMismatch = isEnteringBankDetails && nameMatchOk === false;
              const isSaveDisabled = settingsSaving || isUnverifiedBank || isNameMismatch;

              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isUnverifiedBank && (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                        ⚠️ Verify bank account number before saving.
                      </span>
                    )}
                    {isNameMismatch && (
                      <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 700 }}>
                        ⚠️ Name mismatch — please use a matching bank account.
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleSettingsSave as any}
                    disabled={isSaveDisabled}
                    className="btn btn-primary clickable"
                    style={{
                      padding: '12px 28px', height: 44, borderRadius: 'var(--r-md)',
                      fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 8,
                      fontSize: 13.5, marginLeft: 'auto'
                    }}
                  >
                    {settingsSaving ? (
                      <><Loader2 size={16} className="spinner" /> Saving Changes...</>
                    ) : (
                      <><CreditCard size={16} /> Save Payment &amp; Shipping Details</>
                    )}
                  </button>
                </>
              );
            })()}
          </div>

        </div>
      </div>
      )}
    </>
  );
}
