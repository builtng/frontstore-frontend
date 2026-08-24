'use client';

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  DollarSign, Loader2, AlertCircle, Shield, Check, Clock,
  Receipt, ArrowUpRight, Building2, HelpCircle, ExternalLink
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { getCurrencySymbol, formatVal } from '@/utils/currency';
import Modal from '@/components/Modal';
import type { StoreInfo, UserInfo, PayoutStatusSummary } from '@/types/dashboard';

interface WalletTabProps {
  store: StoreInfo | null;
  user: UserInfo | null;
  isPro: boolean;
  refreshDashboard: () => void;
  navigateDashboardTab?: (tab: any) => void;
}

export default function WalletTab({ store, user, isPro, refreshDashboard, navigateDashboardTab }: WalletTabProps) {
  const apiUrl = getApiUrl();

  // Wallet & payouts state
  const [walletBalances, setWalletBalances] = useState({
    withdrawable_balance: 0,
    pending_balance: 0,
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    bank_account_verified: false,
  });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [payoutStatus, setPayoutStatus] = useState<PayoutStatusSummary>({ state: 'paid', next_payout_at: null });
  const [walletLoading, setWalletLoading] = useState(false);

  // Withdrawal modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalSubmitting, setWithdrawalSubmitting] = useState(false);
  const [withdrawalOtpSent, setWithdrawalOtpSent] = useState(false);
  const [withdrawalOtpCode, setWithdrawalOtpCode] = useState('');
  const [withdrawalOtpLoading, setWithdrawalOtpLoading] = useState(false);

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      const res = await fetch(`${apiUrl}/v1/store/wallet`, {
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setWalletBalances({
          withdrawable_balance: json.data.withdrawable_balance || 0,
          pending_balance: json.data.pending_balance || 0,
          bank_name: json.data.bank_name || '',
          bank_account_number: json.data.bank_account_number || '',
          bank_account_name: json.data.bank_account_name || '',
          bank_account_verified: !!json.data.bank_account_verified,
        });
        setWithdrawals(json.data.withdrawals || []);
        if (json.data.payout_status) {
          setPayoutStatus(json.data.payout_status);
        }
      }
    } catch (e) {
      toast.error('Failed to load wallet information.');
    } finally {
      setWalletLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendWithdrawalOtp = async () => {
    try {
      setWithdrawalOtpLoading(true);
      const res = await fetch(`${apiUrl}/v1/store/withdraw/send-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { Accept: 'application/json' }
      });
      const json = await res.json();
      if (res.ok) {
        setWithdrawalOtpSent(true);
        toast.success(json.message || 'Verification code sent to your email.');
      } else {
        toast.error(json.message || 'Failed to send verification code.');
      }
    } catch {
      toast.error('Network error sending verification code.');
    } finally {
      setWithdrawalOtpLoading(false);
    }
  };

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(withdrawalAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.warning('Please enter a valid amount.');
      return;
    }
    if (amt > walletBalances.withdrawable_balance) {
      toast.error('Amount exceeds your withdrawable balance.');
      return;
    }

    if (!withdrawalOtpSent) {
      await handleSendWithdrawalOtp();
      return;
    }

    if (!withdrawalOtpCode || withdrawalOtpCode.trim().length !== 6) {
      toast.warning('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setWithdrawalSubmitting(true);
      const res = await fetch(`${apiUrl}/v1/store/withdraw`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, otp_code: withdrawalOtpCode.trim() })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Withdrawal request submitted successfully.');
        setWithdrawalAmount('');
        setWithdrawalOtpCode('');
        setWithdrawalOtpSent(false);
        setIsWithdrawModalOpen(false);
        fetchWalletData();
        refreshDashboard();
      } else {
        toast.error(json.message || 'Failed to submit withdrawal request.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setWithdrawalSubmitting(false);
    }
  };

  const currencySymbol = getCurrencySymbol(store?.currency_code);

  const getPayoutStatusBadge = (state: PayoutStatusSummary['state']) => {
    switch (state) {
      case 'processing':
        return {
          title: 'Payout Processing',
          desc: "We're currently transferring your funds to your settlement bank account.",
          color: '#2563eb',
          bg: 'rgba(37, 99, 235, 0.08)',
          border: 'rgba(37, 99, 235, 0.2)'
        };
      case 'scheduled':
        return {
          title: 'Payout Scheduled',
          desc: payoutStatus.next_payout_at
            ? `Your payout is scheduled for ${new Date(payoutStatus.next_payout_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}.`
            : 'Your payout has been scheduled and will be credited soon.',
          color: '#d97706',
          bg: 'rgba(217, 119, 6, 0.08)',
          border: 'rgba(217, 119, 6, 0.2)'
        };
      case 'under_review':
        return {
          title: 'Payout Under Security Review',
          desc: 'A recent order is undergoing standard security review before payout release. This is usually resolved quickly.',
          color: '#dc2626',
          bg: 'rgba(220, 38, 38, 0.08)',
          border: 'rgba(220, 38, 38, 0.2)'
        };
      default:
        return null;
    }
  };

  const activePayoutAlert = getPayoutStatusBadge(payoutStatus.state);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37, 211, 102, 0.25)', flexShrink: 0
          }}>
            <DollarSign size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 900, lineHeight: 1.2 }}>
              Wallet & Payouts
            </h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              View your balances, monitor payout schedules, and withdraw funds to your bank account.
            </p>
          </div>
        </div>

        {navigateDashboardTab && (
          <button
            type="button"
            onClick={() => navigateDashboardTab('settings')}
            className="btn btn-outline clickable"
            style={{ fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 'var(--r-md)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <Building2 size={14} />
            Manage Bank Account
          </button>
        )}
      </div>

      {/* Loading state */}
      {walletLoading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
          <Loader2 size={32} className="spinner" style={{ color: 'var(--primary)' }} />
        </div>
      )}

      {!walletLoading && (
        <>
          {/* Active Payout Alert (Only when processing / scheduled / under review) */}
          {activePayoutAlert && (
            <div style={{
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              background: activePayoutAlert.bg,
              border: `1px solid ${activePayoutAlert.border}`,
              padding: '16px 18px',
              borderRadius: 'var(--r-md)'
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: activePayoutAlert.color, marginTop: 5, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text)', margin: 0 }}>
                  {activePayoutAlert.title}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3, lineHeight: 1.5, margin: 0 }}>
                  {activePayoutAlert.desc}
                </p>
              </div>
            </div>
          )}

          {/* Balance & Settlement Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {/* Withdrawable Balance Card */}
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Withdrawable Balance
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    Available
                  </span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, marginTop: 12, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  {currencySymbol}{formatVal(walletBalances.withdrawable_balance)}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => {
                    if (!walletBalances.bank_account_verified) {
                      toast.warning('Please set up and verify your Bank Account in Settings before withdrawing.');
                      if (navigateDashboardTab) navigateDashboardTab('settings');
                      return;
                    }
                    if (walletBalances.withdrawable_balance <= 0) {
                      toast.info('You do not have any withdrawable balance yet.');
                      return;
                    }
                    setIsWithdrawModalOpen(true);
                  }}
                  className="btn btn-primary clickable"
                  style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <ArrowUpRight size={16} />
                  Withdraw Funds
                </button>
              </div>
            </div>

            {/* Pending Escrow Balance Card */}
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Pending (Escrow)
                    <span title="Funds held in escrow until order delivery is confirmed by buyer.">
                      <HelpCircle size={14} style={{ color: 'var(--text-faint)' }} />
                    </span>
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: 'var(--bg-2)', color: 'var(--text-muted)' }}>
                    Held
                  </span>
                </div>
                <div style={{ fontSize: 32, fontWeight: 900, marginTop: 12, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
                  {currencySymbol}{formatVal(walletBalances.pending_balance)}
                </div>
              </div>

              <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 20, lineHeight: 1.45, margin: '20px 0 0' }}>
                {isPro
                  ? 'Pro plan members receive instant payouts on upfront card & transfer checkouts.'
                  : 'On the Free Starter plan, payments are securely released to your withdrawable balance once delivery is confirmed.'}
              </p>
            </div>

            {/* Settlement Bank Account Card */}
            <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Settlement Account
                  </span>
                  {walletBalances.bank_account_verified ? (
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: 'rgba(37, 211, 102, 0.1)', color: '#25D366', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Check size={12} strokeWidth={3} /> Verified
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
                      Unlinked
                    </span>
                  )}
                </div>

                {walletBalances.bank_name ? (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
                      {walletBalances.bank_name}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3, fontFamily: 'monospace' }}>
                      {walletBalances.bank_account_number}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 2 }}>
                      {walletBalances.bank_account_name}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    No settlement bank account linked yet. Add your bank details to receive payouts.
                  </div>
                )}
              </div>

              {navigateDashboardTab && (
                <button
                  type="button"
                  onClick={() => navigateDashboardTab('settings')}
                  className="btn btn-outline clickable"
                  style={{ marginTop: 20, width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  {walletBalances.bank_name ? 'Edit Bank Account' : 'Link Bank Account'}
                  <ExternalLink size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Withdrawal History Table */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Receipt size={18} style={{ color: 'var(--primary)' }} />
                Withdrawal History
              </h3>
              {withdrawals.length > 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {withdrawals.length} {withdrawals.length === 1 ? 'transaction' : 'transactions'}
                </span>
              )}
            </div>

            {withdrawals.length === 0 ? (
              <div style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-faint)' }}>
                <Receipt size={32} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                <p style={{ fontSize: 13.5, fontWeight: 700, margin: 0 }}>No withdrawals yet</p>
                <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4, margin: 0 }}>
                  When you request payouts, your transaction records will be logged here.
                </p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 500 }}>
                  <thead>
                    <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination Account</th>
                      <th style={{ padding: '12px 8px', fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.map((w: any) => {
                      const dateStr = new Date(w.created_at).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      });
                      const withdrawalStatusStyle: Record<string, { bg: string; color: string }> = {
                        pending: { bg: 'rgba(217, 119, 6, 0.1)', color: '#d97706' },
                        processing: { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' },
                        submitted: { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' },
                        success: { bg: 'rgba(37, 211, 102, 0.12)', color: '#25D366' },
                        failed: { bg: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' },
                        reversed: { bg: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' },
                        rejected: { bg: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' },
                      };
                      const statusStyle = withdrawalStatusStyle[w.status] || withdrawalStatusStyle.pending;
                      return (
                        <tr key={w.id} style={{ borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                          <td style={{ padding: '12px 8px', fontWeight: 600, color: 'var(--text-muted)' }}>{dateStr}</td>
                          <td style={{ padding: '12px 8px', fontWeight: 800, color: 'var(--text)' }}>
                            {currencySymbol}{formatVal(w.amount)}
                          </td>
                          <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                            <div style={{ fontWeight: 600 }}>{w.bank_name} • {w.account_number}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{w.account_name}</div>
                          </td>
                          <td style={{ padding: '12px 8px' }}>
                            <span style={{
                              padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                              background: statusStyle.bg,
                              color: statusStyle.color
                            }}>
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── MODAL: WITHDRAW FUNDS ── */}
      <Modal
        open={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setWithdrawalOtpSent(false);
          setWithdrawalOtpCode('');
        }}
        title="Request Payout Withdrawal"
        maxWidth={500}
      >
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
          Enter the amount you would like to withdraw. Payouts are transferred directly to your verified bank account below.
        </p>

        <div style={{ background: 'var(--bg-2)', padding: 14, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginBottom: 20 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>
            Destination Bank Account
          </span>
          <div style={{ fontSize: 14, fontWeight: 800, marginTop: 4, color: 'var(--text)' }}>
            {walletBalances.bank_name} • {walletBalances.bank_account_number}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {walletBalances.bank_account_name}
          </div>
        </div>

        <form onSubmit={handleRequestWithdrawal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
              Amount to Withdraw ({currencySymbol})
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                required
                disabled={withdrawalOtpSent || withdrawalSubmitting || withdrawalOtpLoading}
                placeholder="0.00"
                value={withdrawalAmount}
                onChange={e => setWithdrawalAmount(e.target.value)}
                className="input-field"
                style={{ paddingRight: 90 }}
                min="1"
                step="0.01"
                max={walletBalances.withdrawable_balance}
              />
              {!withdrawalOtpSent && (
                <button
                  type="button"
                  disabled={withdrawalSubmitting || withdrawalOtpLoading || walletBalances.withdrawable_balance <= 0}
                  onClick={() => setWithdrawalAmount(walletBalances.withdrawable_balance.toString())}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    border: 'none', background: 'var(--primary-light)', color: 'var(--primary)',
                    fontSize: 11, fontWeight: 800, padding: '4px 8px', borderRadius: 4, cursor: 'pointer'
                  }}
                >
                  Max All
                </button>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>Available: {currencySymbol}{formatVal(walletBalances.withdrawable_balance)}</span>
            </div>
          </div>

          {withdrawalOtpSent && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                Email Verification Code (OTP)
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="6-digit code"
                value={withdrawalOtpCode}
                onChange={e => setWithdrawalOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field"
                style={{ letterSpacing: '0.15em', fontWeight: 'bold', textAlign: 'center', fontSize: 16 }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <span>Code sent to your account email.</span>
                <button
                  type="button"
                  onClick={handleSendWithdrawalOtp}
                  disabled={withdrawalOtpLoading}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline', padding: 0, cursor: 'pointer' }}
                >
                  {withdrawalOtpLoading ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={() => {
                setIsWithdrawModalOpen(false);
                setWithdrawalOtpSent(false);
                setWithdrawalOtpCode('');
              }}
              className="btn btn-outline clickable"
              style={{ flex: 1, padding: 12 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                withdrawalSubmitting ||
                withdrawalOtpLoading ||
                !withdrawalAmount ||
                parseFloat(withdrawalAmount) <= 0 ||
                parseFloat(withdrawalAmount) > walletBalances.withdrawable_balance ||
                (withdrawalOtpSent && (!withdrawalOtpCode || withdrawalOtpCode.trim().length !== 6))
              }
              className="btn btn-primary clickable"
              style={{ flex: 1, padding: 12 }}
            >
              {withdrawalSubmitting ? (
                <Loader2 size={16} className="spinner" style={{ margin: '0 auto' }} />
              ) : withdrawalOtpLoading ? (
                'Sending Code...'
              ) : withdrawalOtpSent ? (
                'Confirm Withdrawal'
              ) : (
                'Send Verification Code'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
