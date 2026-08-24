'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  DollarSign, Loader2, AlertCircle, Shield, Check, BadgeCheck, RefreshCw, Scale, Receipt,
  X, Camera, Briefcase, Send,
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';
import { getCurrencySymbol, formatVal } from '@/utils/currency';
import SearchableSelect from '@/components/SearchableSelect';
import FileUpload from '@/components/FileUpload';
import Modal from '@/components/Modal';
import type { StoreInfo, UserInfo, PayoutStatusSummary } from '@/types/dashboard';

interface WalletTabProps {
  store: StoreInfo | null;
  user: UserInfo | null;
  isPro: boolean;
  refreshDashboard: () => void;
}

export default function WalletTab({ store, user, isPro, refreshDashboard }: WalletTabProps) {
  const apiUrl = getApiUrl();

  // Wallet & payouts
  const [walletBalances, setWalletBalances] = useState({
    withdrawable_balance: 0,
    pending_balance: 0,
    bank_name: '',
    bank_account_number: '',
    bank_account_name: '',
    bank_account_verified: false,
    payout_pin_set: false
  });
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [payoutStatus, setPayoutStatus] = useState<PayoutStatusSummary>({ state: 'paid', next_payout_at: null });
  const [walletLoading, setWalletLoading] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalSubmitting, setWithdrawalSubmitting] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawalOtpSent, setWithdrawalOtpSent] = useState(false);
  const [withdrawalOtpCode, setWithdrawalOtpCode] = useState('');
  const [withdrawalOtpLoading, setWithdrawalOtpLoading] = useState(false);

  // Payout PIN (secures WhatsApp-initiated payout requests)
  const [isPayoutPinModalOpen, setIsPayoutPinModalOpen] = useState(false);
  const [payoutPin, setPayoutPin] = useState('');
  const [payoutPinConfirm, setPayoutPinConfirm] = useState('');
  const [payoutPinOtpSent, setPayoutPinOtpSent] = useState(false);
  const [payoutPinOtpCode, setPayoutPinOtpCode] = useState('');
  const [payoutPinOtpLoading, setPayoutPinOtpLoading] = useState(false);
  const [payoutPinSubmitting, setPayoutPinSubmitting] = useState(false);

  // Store disputes
  const [merchantDisputes, setMerchantDisputes] = useState<any[]>([]);
  const [activeDisputeChat, setActiveDisputeChat] = useState<any>(null);
  const [disputeReplyText, setDisputeReplyText] = useState('');
  const [isResolvingDispute, setIsResolvingDispute] = useState(false);
  const [isRefundingDispute, setIsRefundingDispute] = useState(false);
  const [isSendingDisputeReply, setIsSendingDisputeReply] = useState(false);

  // Selfie liveness verification
  const [isSelfieModalOpen, setIsSelfieModalOpen] = useState(false);
  const [isSelfieLivenessVerifying, setIsSelfieLivenessVerifying] = useState(false);
  const [selfieCameraError, setSelfieCameraError] = useState<string | null>(null);
  const [selfieCapturedPreview, setSelfieCapturedPreview] = useState<string | null>(null);
  const selfieVideoRef = useRef<HTMLVideoElement | null>(null);
  const selfieStreamRef = useRef<MediaStream | null>(null);
  const selfieBlobRef = useRef<Blob | null>(null);

  // Business CAC verification
  const [isBusinessModalOpen, setIsBusinessModalOpen] = useState(false);
  const [businessCACName, setBusinessCACName] = useState('');
  const [businessCACNumber, setBusinessCACNumber] = useState('');
  const [isSubmittingBusinessCAC, setIsSubmittingBusinessCAC] = useState(false);

  // Identity / business document verification
  const [verificationDocType, setVerificationDocType] = useState('national_id');
  const [verificationDocUrl, setVerificationDocUrl] = useState('');
  const [verificationIdNumber, setVerificationIdNumber] = useState('');
  const [verificationUploading, setVerificationUploading] = useState(false);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [verificationRedirectUrl, setVerificationRedirectUrl] = useState<string | null>(null);

  const fetchMerchantDisputes = async () => {
    try {
      const res = await fetch(`${apiUrl}/v1/store/disputes`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        setMerchantDisputes(json.data || []);
      }
    } catch (e) {
      console.error('Failed to load merchant disputes:', e);
    }
  };

  const fetchWalletData = async () => {
    try {
      setWalletLoading(true);
      const res = await fetch(`${apiUrl}/v1/store/wallet`, {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setWalletBalances({
          withdrawable_balance: json.data.withdrawable_balance,
          pending_balance: json.data.pending_balance,
          bank_name: json.data.bank_name || '',
          bank_account_number: json.data.bank_account_number || '',
          bank_account_name: json.data.bank_account_name || '',
          bank_account_verified: !!json.data.bank_account_verified,
          payout_pin_set: !!json.data.payout_pin_set
        });
        setWithdrawals(json.data.withdrawals || []);
        if (json.data.payout_status) {
          setPayoutStatus(json.data.payout_status);
        }
      }
      // Also fetch disputes for the Disputes Center widget
      await fetchMerchantDisputes();
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

  const fetchSingleDispute = async (id: string) => {
    try {
      const res = await fetch(`${apiUrl}/v1/public/disputes/${id}`);
      if (res.ok) {
        const json = await res.json();
        setActiveDisputeChat(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendDisputeReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDisputeChat || !disputeReplyText.trim()) return;
    try {
      setIsSendingDisputeReply(true);
      const res = await fetch(`${apiUrl}/v1/public/disputes/${activeDisputeChat.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_type: 'seller',
          sender_name: store?.store_name || 'Merchant',
          message: disputeReplyText,
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to send message.');
      setDisputeReplyText('');
      fetchSingleDispute(activeDisputeChat.id);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setIsSendingDisputeReply(false);
    }
  };

  const handleResolveDispute = async (id: string) => {
    try {
      setIsResolvingDispute(true);
      const res = await fetch(`${apiUrl}/v1/store/disputes/${id}/resolve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to resolve dispute.');
      toast.success('Dispute resolved. Escrow funds released to your withdrawable balance.');
      fetchSingleDispute(id);
      fetchWalletData();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setIsResolvingDispute(false);
    }
  };

  const handleRefundDispute = async (id: string) => {
    try {
      setIsRefundingDispute(true);
      const res = await fetch(`${apiUrl}/v1/store/disputes/${id}/refund`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to refund dispute.');
      toast.success('Dispute refunded. Buyer has been credited.');
      fetchSingleDispute(id);
      fetchWalletData();
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong.');
    } finally {
      setIsRefundingDispute(false);
    }
  };

  const startSelfieCamera = async () => {
    setSelfieCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      selfieStreamRef.current = stream;
      if (selfieVideoRef.current) {
        selfieVideoRef.current.srcObject = stream;
        await selfieVideoRef.current.play();
      }
    } catch (err: any) {
      setSelfieCameraError('Camera access denied. Please allow camera permission to verify your selfie.');
    }
  };

  const stopSelfieCamera = () => {
    selfieStreamRef.current?.getTracks().forEach(track => track.stop());
    selfieStreamRef.current = null;
  };

  const captureSelfiePhoto = () => {
    const video = selfieVideoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      selfieBlobRef.current = blob;
      setSelfieCapturedPreview(URL.createObjectURL(blob));
      stopSelfieCamera();
    }, 'image/jpeg', 0.9);
  };

  const retakeSelfiePhoto = () => {
    selfieBlobRef.current = null;
    setSelfieCapturedPreview(null);
    startSelfieCamera();
  };

  const closeSelfieModal = () => {
    stopSelfieCamera();
    setSelfieCapturedPreview(null);
    selfieBlobRef.current = null;
    setSelfieCameraError(null);
    setIsSelfieModalOpen(false);
  };

  const handleSelfieSubmit = async () => {
    if (!selfieBlobRef.current) {
      toast.warning('Capture a selfie photo first.');
      return;
    }
    try {
      setIsSelfieLivenessVerifying(true);
      const formData = new FormData();
      formData.append('selfie', selfieBlobRef.current, 'selfie.jpg');
      const res = await fetch(`${apiUrl}/v1/store/verify-selfie`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Verification failed.');
      toast.success('Selfie & liveness check completed successfully!');
      closeSelfieModal();
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Selfie verification failed.');
    } finally {
      setIsSelfieLivenessVerifying(false);
    }
  };

  useEffect(() => {
    if (isSelfieModalOpen) {
      startSelfieCamera();
    }
    return () => {
      stopSelfieCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelfieModalOpen]);

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingBusinessCAC(true);
      const res = await fetch(`${apiUrl}/v1/store/verify-business`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: businessCACName,
          cac_number: businessCACNumber
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to verify business.');
      toast.success('Business info verified! Trust score updated.');
      setIsBusinessModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Business verification failed.');
    } finally {
      setIsSubmittingBusinessCAC(false);
    }
  };

  const handleSendWithdrawalOtp = async () => {
    try {
      setWithdrawalOtpLoading(true);
      const res = await fetch(`${apiUrl}/v1/store/withdraw/send-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
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
        toast.success(json.message || 'Withdrawal request submitted.');
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

  const handleSendPayoutPinOtp = async () => {
    try {
      setPayoutPinOtpLoading(true);
      const res = await fetch(`${apiUrl}/v1/store/withdraw/send-otp`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok) {
        setPayoutPinOtpSent(true);
        toast.success(json.message || 'Verification code sent to your email.');
      } else {
        toast.error(json.message || 'Failed to send verification code.');
      }
    } catch {
      toast.error('Network error sending verification code.');
    } finally {
      setPayoutPinOtpLoading(false);
    }
  };

  const handleSetPayoutPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(payoutPin)) {
      toast.warning('Your PIN must be exactly 4 digits.');
      return;
    }
    if (payoutPin !== payoutPinConfirm) {
      toast.warning('PINs do not match.');
      return;
    }

    if (!payoutPinOtpSent) {
      await handleSendPayoutPinOtp();
      return;
    }

    if (!payoutPinOtpCode || payoutPinOtpCode.trim().length !== 6) {
      toast.warning('Please enter the 6-digit verification code.');
      return;
    }

    try {
      setPayoutPinSubmitting(true);
      const res = await fetch(`${apiUrl}/v1/store/payout-pin`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: payoutPin, pin_confirmation: payoutPinConfirm, otp_code: payoutPinOtpCode.trim() })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(json.message || 'Payout PIN saved.');
        setPayoutPin('');
        setPayoutPinConfirm('');
        setPayoutPinOtpCode('');
        setPayoutPinOtpSent(false);
        setIsPayoutPinModalOpen(false);
        setWalletBalances(prev => ({ ...prev, payout_pin_set: true }));
      } else {
        toast.error(json.message || 'Failed to save payout PIN.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setPayoutPinSubmitting(false);
    }
  };

  const closePayoutPinModal = () => {
    setIsPayoutPinModalOpen(false);
    setPayoutPinOtpSent(false);
    setPayoutPin('');
    setPayoutPinConfirm('');
    setPayoutPinOtpCode('');
  };

  const handleUploadVerificationDoc = async (file: File) => {
    try {
      setVerificationUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${apiUrl}/v1/products/upload-image`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Accept': 'application/json' },
        body: formData
      });
      const json = await res.json();
      if (res.ok && json.url) {
        setVerificationDocUrl(json.url);
        toast.success('Document uploaded successfully! 📄');
      } else {
        throw new Error(json.message || 'Upload failed');
      }
    } catch (err: any) {
      toast.error(err.message || 'Document upload error');
    } finally {
      setVerificationUploading(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationDocUrl && !verificationIdNumber) {
      toast.warning('Please enter an ID number or upload a document.');
      return;
    }
    try {
      setIsSubmittingVerification(true);
      setVerificationRedirectUrl(null);
      const res = await fetch(`${apiUrl}/v1/store/verify-request`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_type: verificationDocType,
          document_url: verificationDocUrl || undefined,
          id_number: verificationIdNumber || undefined,
        })
      });
      const json = await res.json();
      if (res.ok) {
        const data = json.data ?? {};
        if (data.auto_approved) {
          toast.success('Identity verified automatically. Your badge is now active!');
        } else if (data.redirect_url) {
          setVerificationRedirectUrl(data.redirect_url);
          toast.success('Open the link below to complete your identity verification.');
        } else {
          toast.success(json.message || 'Verification request submitted.');
        }
        refreshDashboard();
      } else {
        toast.error(json.message || 'Failed to submit request.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(37, 211, 102, 0.3)', flexShrink: 0
          }}>
            <DollarSign size={22} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
              Wallet Balance
            </h2>
            <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
              Wallet & Payouts: Withdraw funds to your verified bank account instantly.
            </p>
          </div>
        </div>

        {/* Wallet loading/error state if applicable */}
        {walletLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
            <Loader2 size={32} className="spinner" style={{ color: 'var(--primary)' }} />
          </div>
        )}

        {!walletLoading && (
          <>
            {/* Balance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {/* Withdrawable Balance Card */}
              <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Withdrawable Balance</span>
                <div style={{ fontSize: 28, fontWeight: 900, marginTop: 8, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                  {getCurrencySymbol(store?.currency_code)}{formatVal(walletBalances.withdrawable_balance)}
                </div>
                <button
                  onClick={() => {
                    if (!walletBalances.bank_account_verified) {
                      toast.warning('Please verify and save your Bank Details in Settings first.');
                      return;
                    }
                    setIsWithdrawModalOpen(true);
                  }}
                  className="btn btn-primary clickable"
                  style={{ marginTop: 16, width: '100%', padding: '10px 16px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 13 }}
                >
                  Withdraw Funds
                </button>
                <button
                  onClick={() => setIsPayoutPinModalOpen(true)}
                  className="btn btn-outline clickable"
                  style={{ marginTop: 8, width: '100%', padding: '8px 16px', borderRadius: 'var(--r-md)', fontWeight: 700, fontSize: 12 }}
                >
                  {walletBalances.payout_pin_set ? 'Change Payout PIN' : 'Set Up Payout PIN'}
                </button>
                <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.4 }}>
                  Required to request a payout from WhatsApp. Can only be set or changed from this dashboard.
                </p>
              </div>

              {/* Pending Escrow Balance Card */}
              <div className="card" style={{ padding: 24, position: 'relative', overflow: 'hidden' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Pending (Escrow) Balance
                  <span title="Funds held in escrow until buyers confirm delivery of order."><AlertCircle size={14} style={{ color: 'var(--text-faint)' }} /></span>
                </span>
                <div style={{ fontSize: 28, fontWeight: 900, marginTop: 8, color: 'var(--text)', fontFamily: 'var(--font-heading)' }}>
                  {getCurrencySymbol(store?.currency_code)}{formatVal(walletBalances.pending_balance)}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 16, lineHeight: 1.4 }}>
                  {isPro ? 'Pro plan bypasses escrow. Upfront payments credit immediately to your withdrawable balance!' : 'Under the Free Starter plan, checkout payments are held in escrow and released only when customers confirm delivery.'}
                </p>
              </div>
            </div>

            {/* Payout Status Card */}
            <div className="card" style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} style={{ color: 'var(--primary)' }} />
                Payout Status
              </h3>

              {(() => {
                const statusCopy: Record<typeof payoutStatus.state, { label: string; description: string; color: string; background: string }> = {
                  paid: {
                    label: "You're all caught up",
                    description: 'No payouts are pending — new sales are paid out within 24 hours.',
                    color: 'var(--primary)',
                    background: 'var(--primary-light)',
                  },
                  processing: {
                    label: 'Your payout is being processed',
                    description: "We're sending your funds to your bank account now.",
                    color: '#2563eb',
                    background: 'rgba(37, 99, 235, 0.1)',
                  },
                  scheduled: {
                    label: payoutStatus.next_payout_at
                      ? `Your payout is scheduled for ${new Date(payoutStatus.next_payout_at).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}`
                      : 'Your payout is scheduled',
                    description: 'Your sale has been confirmed and is on its way to your withdrawable balance.',
                    color: '#d97706',
                    background: 'rgba(217, 119, 6, 0.1)',
                  },
                  under_review: {
                    label: 'A payout is under review for security',
                    description: "We're taking a closer look at a recent order before releasing this payout. This is usually quick.",
                    color: '#dc2626',
                    background: 'rgba(220, 38, 38, 0.1)',
                  },
                };
                const copy = statusCopy[payoutStatus.state];
                return (
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: copy.background, padding: 16, borderRadius: 'var(--r-md)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: copy.color, marginTop: 6, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', margin: 0 }}>{copy.label}</p>
                      <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>{copy.description}</p>
                    </div>
                  </div>
                );
              })()}

              {/* Interactive Verification Checklist */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 12, margin: 0 }}>Verification Status Checklist</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
                  {/* Email Check */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {user?.email_verified_at ? (
                        <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                      ) : (
                        <AlertCircle size={16} style={{ color: 'var(--text-faint)' }} />
                      )}
                      <span>Email Address Verified</span>
                    </div>
                    {user?.email_verified_at ? (
                      <span style={{ color: '#25D366', fontWeight: 700 }}>Verified</span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unverified</span>
                    )}
                  </div>

                  {/* Phone Check */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {(user?.phone_verified_at || store?.whatsapp_phone_updated_at) ? (
                        <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                      ) : (
                        <AlertCircle size={16} style={{ color: 'var(--text-faint)' }} />
                      )}
                      <span>Phone / WhatsApp Connected</span>
                    </div>
                    {(user?.phone_verified_at || store?.whatsapp_phone_updated_at) ? (
                      <span style={{ color: '#25D366', fontWeight: 700 }}>Verified</span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Unverified</span>
                    )}
                  </div>

                  {/* Selfie Liveness Check */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {(store as any)?.selfie_verified_at ? (
                        <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                      ) : (
                        <AlertCircle size={16} style={{ color: 'var(--text-faint)' }} />
                      )}
                      <span>Selfie Liveness check</span>
                    </div>
                    {(store as any)?.selfie_verified_at ? (
                      <span style={{ color: '#25D366', fontWeight: 700 }}>Verified</span>
                    ) : (
                      <button type="button" onClick={() => setIsSelfieModalOpen(true)} className="btn btn-outline clickable" style={{ padding: '2px 8px', fontSize: 11, borderRadius: 6 }}>
                        Verify
                      </button>
                    )}
                  </div>

                  {/* CAC Business Check */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {(store as any)?.business_info_completed ? (
                        <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                      ) : (
                        <AlertCircle size={16} style={{ color: 'var(--text-faint)' }} />
                      )}
                      <span>CAC Business details</span>
                    </div>
                    {(store as any)?.business_info_completed ? (
                      <span style={{ color: '#25D366', fontWeight: 700 }}>Verified</span>
                    ) : (
                      <button type="button" onClick={() => setIsBusinessModalOpen(true)} className="btn btn-outline clickable" style={{ padding: '2px 8px', fontSize: 11, borderRadius: 6 }}>
                        Verify
                      </button>
                    )}
                  </div>

                  {/* Gov ID Check */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {store?.verification_status === 'verified' ? (
                        <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                      ) : (
                        <AlertCircle size={16} style={{ color: 'var(--text-faint)' }} />
                      )}
                      <span>Identity Documents</span>
                    </div>
                    {store?.verification_status === 'verified' ? (
                      <span style={{ color: '#25D366', fontWeight: 700 }}>Verified</span>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Upload below</span>
                    )}
                  </div>

                  {/* Bank Check */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {walletBalances.bank_account_verified ? (
                        <Check size={16} style={{ color: '#25D366' }} strokeWidth={3} />
                      ) : (
                        <AlertCircle size={16} style={{ color: 'var(--text-faint)' }} />
                      )}
                      <span>Settlement Bank account</span>
                    </div>
                    <span style={{ color: walletBalances.bank_account_verified ? '#25D366' : 'var(--text-muted)', fontWeight: 700 }}>
                      {walletBalances.bank_account_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Store verification Document Upload widget */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={18} style={{ color: 'var(--primary)' }} />
                Document Verification Upload
              </h3>

              {store?.verification_status === 'verified' && (
                <div style={{ display: 'flex', gap: 16, background: 'var(--primary-light)', padding: 18, borderRadius: 'var(--r-md)', border: '1px solid var(--primary-border)' }}>
                  <BadgeCheck size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)' }}>Storefront Verified!</h4>
                    <p style={{ fontSize: 12.5, color: 'var(--text)', marginTop: 4, lineHeight: 1.5 }}>
                      Your business registration details or identity documents have been approved. A green "Verified" checkmark badge is now visible on your public storefront to build buyer trust.
                    </p>
                  </div>
                </div>
              )}

              {store?.verification_status === 'pending' && (
                <div style={{ display: 'flex', gap: 16, background: 'var(--bg-2)', padding: 18, borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <RefreshCw size={24} className="spinner" style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Verification Under Review</h4>
                    <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
                      We are currently reviewing your submitted verification document ({store?.verification_document_type ? store.verification_document_type.replace('_', ' ').toUpperCase() : 'ID'}). The verification badge will appear once approved.
                    </p>
                  </div>
                </div>
              )}

              {(store?.verification_status === 'unverified' || store?.verification_status === 'rejected' || !store?.verification_status) && (
                <div>
                  {store?.verification_status === 'rejected' && (
                    <div style={{ display: 'flex', gap: 16, background: '#fee2e2', padding: 16, borderRadius: 'var(--r-md)', border: '1px solid #fca5a5', marginBottom: 20 }}>
                      <AlertCircle size={24} style={{ color: '#dc2626', flexShrink: 0 }} />
                      <div>
                        <h4 style={{ fontWeight: 800, fontSize: 14, color: '#b91c1c' }}>Verification Request Declined</h4>
                        <p style={{ fontSize: 12, color: '#7f1d1d', marginTop: 4, lineHeight: 1.5 }}>
                          Your previous submission was rejected. Please ensure your document scan is clearly visible and matches your account details, then upload and resubmit.
                        </p>
                      </div>
                    </div>
                  )}

                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
                    To display a "Verified" trust badge on your public storefront and access higher payout limits, submit a scan of a government-issued ID or official business registration document.
                  </p>

                  <form onSubmit={handleSubmitVerification} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 500 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Document Type</label>
                      <SearchableSelect
                        options={[
                          { value: 'national_id', label: 'National ID Card (NIN)' },
                          { value: 'intl_passport', label: 'International Passport' },
                          { value: 'drivers_license', label: "Driver's License" },
                          { value: 'business_registration', label: 'CAC Business Registration Document' },
                        ]}
                        value={verificationDocType}
                        onChange={val => setVerificationDocType(val)}
                        placeholder="Select document type"
                      />
                    </div>

                    {verificationDocType === 'business_registration' && (
                      <div style={{ display: 'flex', gap: 12, background: '#fffbeb', padding: '12px 14px', borderRadius: 'var(--r-md)', border: '1px solid #fcd34d' }}>
                        <AlertCircle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: 12.5, color: '#92400e', lineHeight: 1.55, margin: 0 }}>
                          <strong>CAC is primarily for Nigerians.</strong> If you are not based in Nigeria, please select <strong>International Passport (IP)</strong> as your verification document instead.
                        </p>
                      </div>
                    )}


                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>ID Number (Optional if uploading document)</label>
                      <input
                        type="text"
                        placeholder="Enter NIN, Passport #, Driver's License #, or CAC #"
                        value={verificationIdNumber}
                        onChange={e => setVerificationIdNumber(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'var(--surface)',
                          border: '1.5px solid var(--border)',
                          borderRadius: 'var(--r-md)',
                          fontSize: 13.5,
                          color: 'var(--text)',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>Upload Document File (Image/PDF)</label>
                      <FileUpload
                        variant="default"
                        accept="image/*,application/pdf"
                        label="Drop your document here or click to upload"
                        hint="JPG, PNG, or PDF accepted"
                        previewUrl={verificationDocUrl || undefined}
                        uploading={verificationUploading}
                        success={verificationDocUrl ? 'Document uploaded successfully' : undefined}
                        inputId="verification-file-input"
                        onFile={async (file) => { await handleUploadVerificationDoc(file); }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingVerification || (!verificationDocUrl && !verificationIdNumber) || verificationUploading}
                      className="btn btn-primary clickable"
                      style={{
                        padding: '12px 24px', borderRadius: 'var(--r-md)', fontWeight: 800, fontSize: 13.5, width: 'fit-content', marginTop: 8
                      }}
                    >
                      {isSubmittingVerification ? <><Loader2 size={15} className="spinner" /> Submitting...</> : 'Submit Documents for Verification'}
                    </button>
                  </form>

                  {verificationRedirectUrl && (
                    <div style={{ marginTop: 16, padding: 16, background: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--r-md)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <p style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 700, margin: 0 }}>
                        Action Required: Complete verification on our secure partner portal.
                      </p>
                      <a
                        href={verificationRedirectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary clickable"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          padding: '10px 16px',
                          borderRadius: 'var(--r-md)',
                          fontWeight: 800,
                          fontSize: 13,
                          textDecoration: 'none',
                          width: 'fit-content'
                        }}
                      >
                        Open Verification Portal
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Store Disputes Center Widget */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#dc2626' }}>
                <Scale size={18} />
                Store Disputes Center
              </h3>
              {merchantDisputes.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-faint)' }}>
                  <AlertCircle size={28} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>No active store disputes</p>
                  <p style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 4, margin: 0 }}>Good job! Your customers have not filed any disputes.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {merchantDisputes.map((disp: any) => (
                    <div key={disp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-2)', padding: 14, borderRadius: 10, border: '1px solid var(--border)', fontSize: 13 }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>Dispute #{disp.id.substring(0, 8).toUpperCase()}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>Reason: {disp.reason.replace(/_/g, ' ').toUpperCase()} • Status: <span style={{ fontWeight: 700, color: disp.status === 'open' ? '#d97706' : '#25D366' }}>{disp.status.toUpperCase()}</span></div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          await fetchSingleDispute(disp.id);
                        }}
                        className="btn btn-outline clickable"
                        style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}
                      >
                        View & Chat
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Withdrawal Request History Log */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 900, marginBottom: 16 }}>Withdrawal History</h3>
              {withdrawals.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-faint)' }}>
                  <Receipt size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <p style={{ fontSize: 13.5, fontWeight: 600 }}>No withdrawal transactions yet.</p>
                  <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>Your withdrawal history logs will appear here.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 500 }}>
                    <thead>
                      <tr style={{ borderBottom: '1.5px solid var(--border)' }}>
                        <th style={{ padding: '12px 8px', fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '12px 8px', fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</th>
                        <th style={{ padding: '12px 8px', fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Destination Bank Details</th>
                        <th style={{ padding: '12px 8px', fontSize: 11.5, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w: any) => {
                        const dateStr = new Date(w.created_at).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        });
                        const withdrawalStatusStyle: Record<string, { bg: string; color: string }> = {
                          pending: { bg: '#ffedd5', color: '#d97706' },
                          processing: { bg: '#ffedd5', color: '#d97706' },
                          submitted: { bg: '#dbeafe', color: '#2563eb' },
                          success: { bg: 'var(--primary-light)', color: 'var(--primary)' },
                          failed: { bg: '#fee2e2', color: '#dc2626' },
                          reversed: { bg: '#fee2e2', color: '#dc2626' },
                          rejected: { bg: '#fee2e2', color: '#dc2626' },
                        };
                        const statusStyle = withdrawalStatusStyle[w.status] || withdrawalStatusStyle.pending;
                        return (
                          <tr key={w.id} style={{ borderBottom: '1px solid var(--border)', fontSize: 13.5 }}>
                            <td style={{ padding: '12px 8px', fontWeight: 600 }}>{dateStr}</td>
                            <td style={{ padding: '12px 8px', fontWeight: 700, color: 'var(--text)' }}>{getCurrencySymbol(store?.currency_code)}{formatVal(w.amount)}</td>
                            <td style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>
                              {w.bank_name} • {w.account_number} <span style={{ fontSize: 11, display: 'block', color: 'var(--text-faint)' }}>{w.account_name}</span>
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

      </div>

      {/* ── MODAL: WITHDRAW FUNDS OVERLAY ── */}
      <Modal
        open={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Request Payout Withdrawal"
        maxWidth={600}
      >
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
          Specify the amount you would like to withdraw from your withdrawable balance. Funds will be transferred to your verified bank account below.
        </p>

        <div style={{ background: 'var(--bg-2)', padding: 14, borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginBottom: 20 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block' }}>Destination Bank Details</span>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 4, color: 'var(--text)' }}>
            {walletBalances.bank_name} • {walletBalances.bank_account_number}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
            {walletBalances.bank_account_name}
          </div>
        </div>

        <form onSubmit={handleRequestWithdrawal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
              Amount to Withdraw ({getCurrencySymbol(store?.currency_code)})
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                required
                disabled={withdrawalOtpSent || withdrawalSubmitting || withdrawalOtpLoading}
                placeholder="Enter amount"
                value={withdrawalAmount}
                onChange={e => setWithdrawalAmount(e.target.value)}
                className="input-field"
                style={{ paddingRight: 80 }}
                min="1"
                step="0.01"
                max={walletBalances.withdrawable_balance}
              />
              {!withdrawalOtpSent && (
                <button
                  type="button"
                  disabled={withdrawalSubmitting || withdrawalOtpLoading}
                  onClick={() => setWithdrawalAmount(walletBalances.withdrawable_balance.toString())}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    border: 'none', background: 'var(--primary-light)', color: 'var(--primary)',
                    fontSize: 10.5, fontWeight: 800, padding: '4px 8px', borderRadius: 4, cursor: 'pointer'
                  }}
                >
                  Withdraw All
                </button>
              )}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span>Withdrawable Balance: {getCurrencySymbol(store?.currency_code)}{formatVal(walletBalances.withdrawable_balance)}</span>
            </div>
          </div>

          {withdrawalOtpSent && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                Email OTP Code
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
                style={{ letterSpacing: '0.1em', fontWeight: 'bold' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <span>Check your email for the verification code.</span>
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
            <button type="button" onClick={() => setIsWithdrawModalOpen(false)} className="btn btn-outline clickable" style={{ flex: 1, padding: 12 }}>Cancel</button>
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
                'Verify & Request Payout'
              ) : (
                'Send OTP Verification'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: SET/CHANGE PAYOUT PIN ── */}
      <Modal
        open={isPayoutPinModalOpen}
        onClose={closePayoutPinModal}
        title={walletBalances.payout_pin_set ? 'Change Payout PIN' : 'Set Up Payout PIN'}
        maxWidth={480}
      >
        <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
          This 4-digit PIN confirms any payout you request from Nina on WhatsApp. It can only be set or changed here on your dashboard — never from WhatsApp — so a hijacked WhatsApp session alone can never set or reset it.
        </p>

        <form onSubmit={handleSetPayoutPin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
              New 4-Digit PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              required
              disabled={payoutPinOtpSent || payoutPinSubmitting || payoutPinOtpLoading}
              placeholder="••••"
              value={payoutPin}
              onChange={e => setPayoutPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="input-field"
              style={{ letterSpacing: '0.3em', fontWeight: 'bold', textAlign: 'center' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase', marginBottom: 6 }}>
              Confirm PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              required
              disabled={payoutPinOtpSent || payoutPinSubmitting || payoutPinOtpLoading}
              placeholder="••••"
              value={payoutPinConfirm}
              onChange={e => setPayoutPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="input-field"
              style={{ letterSpacing: '0.3em', fontWeight: 'bold', textAlign: 'center' }}
            />
          </div>

          {payoutPinOtpSent && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'var(--text-2)', textTransform: 'uppercase' }}>
                Email OTP Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                placeholder="6-digit code"
                value={payoutPinOtpCode}
                onChange={e => setPayoutPinOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field"
                style={{ letterSpacing: '0.1em', fontWeight: 'bold' }}
              />
              <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <span>Check your email for the verification code.</span>
                <button
                  type="button"
                  onClick={handleSendPayoutPinOtp}
                  disabled={payoutPinOtpLoading}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, textDecoration: 'underline', padding: 0, cursor: 'pointer' }}
                >
                  {payoutPinOtpLoading ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={closePayoutPinModal}
              className="btn btn-outline clickable"
              style={{ flex: 1, padding: 12 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                payoutPinSubmitting ||
                payoutPinOtpLoading ||
                payoutPin.length !== 4 ||
                payoutPinConfirm.length !== 4 ||
                (payoutPinOtpSent && (!payoutPinOtpCode || payoutPinOtpCode.trim().length !== 6))
              }
              className="btn btn-primary clickable"
              style={{ flex: 1, padding: 12 }}
            >
              {payoutPinSubmitting ? (
                <Loader2 size={16} className="spinner" style={{ margin: '0 auto' }} />
              ) : payoutPinOtpLoading ? (
                'Sending Code...'
              ) : payoutPinOtpSent ? (
                'Verify & Save PIN'
              ) : (
                'Send OTP Verification'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Selfie Liveness Check ── */}
      {isSelfieModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={closeSelfieModal} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 400, padding: 28, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Camera size={18} /> Selfie Liveness Check
              </h3>
              <button onClick={closeSelfieModal} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
              {selfieCapturedPreview
                ? 'Review your photo below, then submit for verification.'
                : 'Position your face in frame and click Capture to take your verification selfie.'}
            </p>

            <div style={{
              width: '100%',
              height: 240,
              background: '#000',
              borderRadius: 12,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {selfieCapturedPreview ? (
                <img src={selfieCapturedPreview} alt="Captured selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : selfieCameraError ? (
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12.5, textAlign: 'center', padding: '0 20px' }}>{selfieCameraError}</p>
              ) : (
                <>
                  <video ref={selfieVideoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                  <div style={{
                    position: 'absolute',
                    width: 140,
                    height: 180,
                    border: '2px dashed rgba(255,255,255,0.6)',
                    borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                    pointerEvents: 'none'
                  }} />
                </>
              )}
            </div>

            {selfieCapturedPreview ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={retakeSelfiePhoto}
                  disabled={isSelfieLivenessVerifying}
                  className="btn btn-outline clickable"
                  style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: 800, fontSize: 13 }}
                >
                  Retake
                </button>
                <button
                  onClick={handleSelfieSubmit}
                  disabled={isSelfieLivenessVerifying}
                  className="btn btn-primary clickable"
                  style={{ flex: 1, padding: 12, borderRadius: 10, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {isSelfieLivenessVerifying ? <><Loader2 size={14} className="spinner animate-spin" /> Verifying...</> : 'Submit for Verification'}
                </button>
              </div>
            ) : (
              <button
                onClick={selfieCameraError ? startSelfieCamera : captureSelfiePhoto}
                className="btn btn-primary clickable"
                style={{ padding: 12, borderRadius: 10, fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {selfieCameraError ? 'Retry Camera Access' : 'Capture Selfie'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: Business Registration Verification ── */}
      {isBusinessModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setIsBusinessModalOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 400, padding: 28, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Briefcase size={18} /> Verify Business Info (CAC)
              </h3>
              <button onClick={() => setIsBusinessModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>
            <p style={{ margin: 0, fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Enter your official Corporate Affairs Commission (CAC) details to unlock Level 3/4 payouts.
            </p>

            <form onSubmit={handleBusinessSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>Business Name</label>
                <input
                  required
                  type="text"
                  placeholder="E.g. Frontstore Technologies Ltd"
                  value={businessCACName}
                  onChange={e => setBusinessCACName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13.5, color: 'var(--text)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>CAC Registration Number</label>
                <input
                  required
                  type="text"
                  placeholder="E.g. RC 1234567"
                  value={businessCACNumber}
                  onChange={e => setBusinessCACNumber(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', fontSize: 13.5, color: 'var(--text)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                <button type="button" onClick={() => setIsBusinessModalOpen(false)} style={{ flex: 1, padding: 12, border: '1.5px solid var(--border)', borderRadius: 10, fontSize: 13, background: 'transparent', fontWeight: 700, color: 'var(--text)' }} className="clickable">Cancel</button>
                <button type="submit" disabled={isSubmittingBusinessCAC} style={{ flex: 1, padding: 12, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700 }} className="clickable">
                  {isSubmittingBusinessCAC ? 'Submitting...' : 'Verify CAC'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Dispute Resolution Chat Center ── */}
      {activeDisputeChat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} className="animate-fade-in">
          <div onClick={() => setActiveDisputeChat(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />
          <div className="card glass animate-scale-in" style={{ position: 'relative', width: '100%', maxWidth: 500, padding: 28, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 6, color: '#dc2626' }}>
                <Scale size={18} /> Dispute Resolution Chat
              </h3>
              <button onClick={() => setActiveDisputeChat(null)} style={{ background: 'none', border: 'none', color: 'var(--text-faint)' }}><X size={18} /></button>
            </div>

            <div style={{ background: 'var(--bg-2)', padding: '12px 14px', borderRadius: '10px', fontSize: '13px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div><strong>Status:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 800, color: '#d97706' }}>{activeDisputeChat.status.replace(/_/g, ' ')}</span></div>
              <div><strong>Reason:</strong> {activeDisputeChat.reason.replace(/_/g, ' ').toUpperCase()}</div>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 6 }}>
                <strong>Buyer Explanation:</strong>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{activeDisputeChat.explanation}</p>
              </div>
            </div>

            {/* Chat Timeline logs */}
            <div style={{ height: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 10px', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--bg)' }}>
              {activeDisputeChat.messages && activeDisputeChat.messages.map((msg: any) => {
                const isMe = msg.sender_type === 'seller';
                return (
                  <div key={msg.id} style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: isMe ? 'var(--primary)' : 'var(--bg-2)',
                    color: isMe ? '#fff' : 'var(--text)',
                    padding: '8px 12px',
                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: '13px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}>
                    <div style={{ fontSize: '10px', fontWeight: 800, opacity: 0.8, marginBottom: 2 }}>{msg.sender_name} ({msg.sender_type})</div>
                    <div>{msg.message}</div>
                  </div>
                );
              })}
            </div>

            {/* Message input & Actions */}
            {['resolved', 'refunded', 'closed'].includes(activeDisputeChat.status) ? (
              <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                This dispute has been resolved and closed.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <form onSubmit={handleSendDisputeReply} style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={disputeReplyText}
                    onChange={e => setDisputeReplyText(e.target.value)}
                    placeholder="Type message to buyer/admin..."
                    style={{ flex: 1, padding: '10px 12px', background: 'var(--bg-2)', border: '1.5px solid var(--border)', borderRadius: '10px', fontSize: '13px', color: 'var(--text)' }}
                    required
                  />
                  <button type="submit" disabled={isSendingDisputeReply} style={{ width: 38, height: 38, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="clickable">
                    {isSendingDisputeReply ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Send size={15} />}
                  </button>
                </form>

                <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                  <button
                    type="button"
                    onClick={() => handleResolveDispute(activeDisputeChat.id)}
                    disabled={isResolvingDispute}
                    style={{ flex: 1, padding: 10, background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700 }}
                    className="clickable"
                  >
                    {isResolvingDispute ? 'Processing...' : 'Resolve & Release Payout'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRefundDispute(activeDisputeChat.id)}
                    disabled={isRefundingDispute}
                    style={{ flex: 1, padding: 10, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700 }}
                    className="clickable"
                  >
                    {isRefundingDispute ? 'Processing...' : 'Refund Buyer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
